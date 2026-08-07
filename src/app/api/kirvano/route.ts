import { NextResponse } from "next/server";
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

// Senha legível ditada por telefone: sem 0/O/1/l/I.
function gerarSenha(): string {
  const letras = "abcdefghijkmnopqrstuvwxyz";
  const numeros = "23456789";
  const b = new Uint32Array(10);
  crypto.getRandomValues(b);
  return (
    [...Array(6)].map((_, i) => letras[b[i] % letras.length]).join("") +
    [...Array(4)].map((_, i) => numeros[b[6 + i] % numeros.length]).join("")
  );
}

type EmailAcesso =
  | { tipo: "nova-conta"; senha: string }
  | { tipo: "recompra" };

async function enviarEmailAcesso(nome: string, email: string, acesso: EmailAcesso) {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.metaforasterapeuticas.video";
  const primeiro = (nome || "").trim().split(" ")[0] || "tudo bem";

  const blocoCredenciais =
    acesso.tipo === "nova-conta"
      ? `
  <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin:0 0 24px">
    <p style="font-size:13px;color:#666;margin:0 0 4px">E-mail</p>
    <p style="font-size:16px;font-weight:600;margin:0 0 16px">${email}</p>
    <p style="font-size:13px;color:#666;margin:0 0 4px">Senha</p>
    <p style="font-size:20px;font-weight:700;letter-spacing:1px;font-family:ui-monospace,Menlo,monospace;margin:0">${acesso.senha}</p>
  </div>`
      : `
  <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin:0 0 24px">
    <p style="font-size:15px;line-height:1.6;margin:0">
      Sua conta já existia, então seu acesso foi reativado — entre com o
      e-mail <strong>${email}</strong> e a senha que você já usava.
    </p>
  </div>`;

  const html = `
<div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
  <p style="font-size:16px;margin:0 0 20px">Oi, ${primeiro}.</p>
  <p style="font-size:16px;line-height:1.6;margin:0 0 20px">
    Seu acesso à biblioteca de metáforas está liberado. São 50 metáforas
    organizadas por tema, prontas para usar em sessão.
  </p>
  ${blocoCredenciais}
  <a href="${url}/login" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:16px;font-weight:600">
    Entrar na biblioteca
  </a>
  <p style="font-size:14px;color:#666;line-height:1.6;margin:28px 0 0">
    Guarde este e-mail. Precisando de ajuda, é só responder.
  </p>
</div>`.trim();

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Seu acesso à biblioteca de metáforas",
      html,
    }),
  });
  if (!resposta.ok) {
    throw new Error(`Resend ${resposta.status}: ${await resposta.text()}`);
  }
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
