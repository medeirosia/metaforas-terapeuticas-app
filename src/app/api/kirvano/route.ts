import { NextResponse } from "next/server";
import { enviarEmailAcesso, gerarSenha, type EmailAcesso } from "@/lib/acesso";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Webhook da Kirvano — provisiona o comprador automaticamente.
// Resolve a pendência 2 do CONTEXTO.md (provisionamento manual).
//
// Fluxo:
//   SALE_APPROVED            → cria usuário (signUp, chave publishable, igual
//                              ao criarAcessoComprador do admin) + linha em
//                              members com acesso_pago=true + e-mail de acesso.
//   SALE_REFUNDED/CHARGEBACK → members.acesso_pago = false (mesma semântica
//                              do revogarAcesso do admin).
//
// SEM service role key, de propósito (o CONTEXTO.md pede): a escrita em
// members é feita com uma sessão do PRÓPRIO admin — o webhook faz
// signInWithPassword com as credenciais do admin (env, server-only) num
// client isolado e opera dentro das políticas de RLS existentes. É
// exatamente o que o Kenneth faria no painel /admin/membros, automatizado.
//
// Env (Vercel, server-only — sem NEXT_PUBLIC):
//   ADMIN_EMAIL / ADMIN_PASSWORD  login do admin (o mesmo do /admin/login)
//   KIRVANO_WEBHOOK_TOKEN         token definido ao criar o webhook na Kirvano
//   RESEND_API_KEY                envio do e-mail de acesso
//   EMAIL_FROM                    ex.: Metáforas Terapêuticas <acesso@metaforasterapeuticas.video>
//   NEXT_PUBLIC_APP_URL           ex.: https://www.metaforasterapeuticas.video

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIsolado() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

async function clientComoAdmin() {
  const client = clientIsolado();
  const { error } = await client.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  });
  if (error) throw new Error(`login do admin falhou: ${error.message}`);
  return client;
}

// Order bump "licença de uso nas redes sociais": quem compra assiste sem a
// marca d'água com o e-mail. A Kirvano manda os itens do pedido em campos que
// mudam de conta para conta, então varremos o payload inteiro atrás do termo
// (ajustável por KIRVANO_TERMO_LICENCA sem precisar de deploy).
function detectarLicenca(payload: unknown): boolean {
  const termo = (process.env.KIRVANO_TERMO_LICENCA ?? "licen").toLowerCase();
  const itens = [
    ...(Array.isArray((payload as any)?.products) ? (payload as any).products : []),
    ...(Array.isArray((payload as any)?.order_bumps) ? (payload as any).order_bumps : []),
    ...(Array.isArray((payload as any)?.items) ? (payload as any).items : []),
  ];
  return itens.some((item) =>
    ["name", "offer_name", "product_name", "title", "description"].some((campo) =>
      String(item?.[campo] ?? "").toLowerCase().includes(termo)
    )
  );
}

export async function POST(request: Request) {
  // A Kirvano envia o token cadastrado no webhook em um header próprio.
  // Sem essa checagem, qualquer POST anônimo liberaria acesso.
  const token =
    request.headers.get("security-token") ?? request.headers.get("x-kirvano-token");
  if (!process.env.KIRVANO_WEBHOOK_TOKEN || token !== process.env.KIRVANO_WEBHOOK_TOKEN) {
    return NextResponse.json({ erro: "token inválido" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ erro: "payload inválido" }, { status: 400 });
  }

  const evento: string = payload.event ?? "";
  const email: string = String(payload?.customer?.email ?? "").trim().toLowerCase();
  const nome: string = payload?.customer?.name ?? "";
  if (!email) {
    return NextResponse.json({ erro: "payload sem e-mail" }, { status: 400 });
  }

  const comprouLicenca = detectarLicenca(payload);

  if (evento === "SALE_APPROVED") {
    const senha = gerarSenha();

    // Mesmo padrão do criarAcessoComprador: signUp com a chave publishable,
    // client isolado. Confirmação de e-mail está desativada no projeto,
    // a conta nasce ativa.
    const { data, error } = await clientIsolado().auth.signUp({
      email,
      password: senha,
    });

    const admin = await clientComoAdmin();

    let userId = data?.user?.id ?? null;
    let acesso: EmailAcesso = { tipo: "nova-conta", senha };

    if (error || !userId) {
      // Recompra/upsell: o usuário já existe no Auth. Sem service role não
      // dá para redefinir a senha dele — e nem precisa: reativa o acesso na
      // members (o admin lê e escreve todas as linhas) e o e-mail avisa que
      // vale a senha que a pessoa já usava.
      const jaExiste = /already|registered|exists/i.test(error?.message ?? "");
      if (!jaExiste) {
        console.error("[kirvano] signUp falhou:", error);
        return NextResponse.json({ erro: "falha ao criar usuário" }, { status: 500 });
      }
      const { data: linha } = await admin
        .from("members")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (!linha) {
        // Existe no Auth mas nunca teve linha em members — caso raro que
        // precisa de olho humano; não dá para descobrir o id sem service role.
        console.error("[kirvano] usuário no Auth sem linha em members:", email);
        return NextResponse.json(
          { erro: "usuário órfão, criar manualmente no /admin/membros" },
          { status: 500 }
        );
      }
      userId = linha.id;
      acesso = { tipo: "recompra" };
    }

    const { error: upsertError } = await admin.from("members").upsert({
      id: userId,
      email,
      acesso_pago: true,
      // Só liga; uma compra sem o bump não tira a licença de quem já comprou.
      ...(comprouLicenca ? { licenca_redes: true } : {}),
    });
    if (upsertError) {
      console.error("[kirvano] upsert members falhou:", upsertError);
      return NextResponse.json({ erro: "falha ao liberar acesso" }, { status: 500 });
    }

    await enviarEmailAcesso(nome, email, acesso);
    return NextResponse.json({ ok: true, acao: "liberado" });
  }

  if (evento === "SALE_REFUNDED" || evento === "CHARGEBACK") {
    // Mesma semântica do revogarAcesso do admin: a conta continua existindo,
    // só perde o acesso pago (volta a ver a biblioteca em modo demo).
    const admin = await clientComoAdmin();
    const { error: updateError } = await admin
      .from("members")
      .update({ acesso_pago: false })
      .eq("email", email);
    if (updateError) {
      console.error("[kirvano] revogação falhou:", updateError);
      return NextResponse.json({ erro: "falha ao revogar" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, acao: "revogado" });
  }

  // Evento que não interessa (pix gerado, boleto, carrinho abandonado…):
  // responde 200 de propósito — 4xx faria a Kirvano reenviar em loop.
  return NextResponse.json({ ok: true, acao: "ignorado", evento });
}
