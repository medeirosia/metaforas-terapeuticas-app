import { NextResponse } from "next/server";
import { enviarEmailAcesso, gerarSenha, type EmailAcesso } from "@/lib/acesso";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Webhook da Kavoo — plataforma de vendas que o Kenneth começou a testar em
// out/2026. Mesma esteira do /api/kirvano (que segue intocado), só que no
// formato da Kavoo:
//   - senha no header X-Webhook-Token ("Ativar senha de segurança" no painel)
//   - evento em status.code (SALE_APPROVED, SALE_COMPLETED, SALE_REVERSED…)
//   - comprador em customer.email / customer.name
//   - itens do pedido em items[] (product_name, type "product" | "order_bump")
// A referência dos campos fica no próprio painel da Kavoo, em
// Webhooks → "Documentação dos webhooks".
//
// Fluxo:
//   SALE_APPROVED   → cria usuário + members.acesso_pago + e-mail de acesso.
//   SALE_COMPLETED  → a Kavoo manda depois do aprovado; se o acesso já está
//                     liberado só garante a licença, sem segundo e-mail. Se o
//                     aprovado não chegou, libera aqui.
//   SALE_REVERSED   → members.acesso_pago = false.
//
// Env (Vercel, server-only):
//   KAVOO_WEBHOOK_TOKEN  a mesma senha cadastrada no webhook da Kavoo
//   (o resto é o mesmo do /api/kirvano: ADMIN_EMAIL/ADMIN_PASSWORD, RESEND…)

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

type ItemKavoo = { product_name?: string; name?: string; description?: string };
type PedidoKavoo = {
  status?: { code?: string };
  event?: string;
  customer?: { email?: string; name?: string };
  items?: ItemKavoo[];
  product?: ItemKavoo;
};

// Order bump "licença de uso nas redes sociais", procurado pelo nome nos itens.
function detectarLicenca(payload: PedidoKavoo): boolean {
  const termo = (process.env.KAVOO_TERMO_LICENCA ?? "licen").toLowerCase();
  const itens = [
    ...(Array.isArray(payload.items) ? payload.items : []),
    ...(payload.product ? [payload.product] : []),
  ];
  return itens.some((item) =>
    [item?.product_name, item?.name, item?.description].some((texto) =>
      String(texto ?? "").toLowerCase().includes(termo)
    )
  );
}

// O botão "Testar" da Kavoo manda um pedido de exemplo. Comprador de domínio
// de exemplo não vira conta nem recebe e-mail.
function compradorDeExemplo(email: string): boolean {
  const dominio = email.split("@")[1] ?? "";
  return /(^|\.)(example|exemplo|teste?)\.(com|com\.br|org|net)$/.test(dominio);
}

export async function POST(request: Request) {
  const token = request.headers.get("x-webhook-token");
  if (!process.env.KAVOO_WEBHOOK_TOKEN || token !== process.env.KAVOO_WEBHOOK_TOKEN) {
    return NextResponse.json({ erro: "token inválido" }, { status: 401 });
  }

  const payload: PedidoKavoo | null = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ erro: "payload inválido" }, { status: 400 });
  }

  const evento: string = String(payload?.status?.code ?? payload?.event ?? "").toUpperCase();
  const email: string = String(payload?.customer?.email ?? "").trim().toLowerCase();
  const nome: string = payload?.customer?.name ?? "";
  if (!email) {
    return NextResponse.json({ erro: "payload sem e-mail" }, { status: 400 });
  }
  if (compradorDeExemplo(email)) {
    return NextResponse.json({ ok: true, acao: "teste", evento });
  }

  const comprouLicenca = detectarLicenca(payload);

  if (evento === "SALE_COMPLETED") {
    const admin = await clientComoAdmin();
    const { data: linha } = await admin
      .from("members")
      .select("id, acesso_pago")
      .eq("email", email)
      .maybeSingle();
    if (linha?.acesso_pago) {
      if (comprouLicenca) {
        await admin.from("members").update({ licenca_redes: true }).eq("id", linha.id);
      }
      return NextResponse.json({ ok: true, acao: "ja-liberado" });
    }
  }

  if (evento === "SALE_APPROVED" || evento === "SALE_COMPLETED") {
    const senha = gerarSenha();
    const { data, error } = await clientIsolado().auth.signUp({
      email,
      password: senha,
    });

    const admin = await clientComoAdmin();

    let userId = data?.user?.id ?? null;
    let acesso: EmailAcesso = { tipo: "nova-conta", senha };

    if (error || !userId) {
      // Já tem conta (comprou antes pela Kirvano, por exemplo): reativa o
      // acesso e o e-mail avisa que vale a senha de sempre.
      const jaExiste = /already|registered|exists/i.test(error?.message ?? "");
      if (!jaExiste) {
        console.error("[kavoo] signUp falhou:", error);
        return NextResponse.json({ erro: "falha ao criar usuário" }, { status: 500 });
      }
      const { data: linha } = await admin
        .from("members")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (!linha) {
        console.error("[kavoo] usuário no Auth sem linha em members:", email);
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
      ...(comprouLicenca ? { licenca_redes: true } : {}),
    });
    if (upsertError) {
      console.error("[kavoo] upsert members falhou:", upsertError);
      return NextResponse.json({ erro: "falha ao liberar acesso" }, { status: 500 });
    }

    await enviarEmailAcesso(nome, email, acesso);
    return NextResponse.json({ ok: true, acao: "liberado" });
  }

  if (evento === "SALE_REVERSED") {
    const admin = await clientComoAdmin();
    const { error: updateError } = await admin
      .from("members")
      .update({ acesso_pago: false })
      .eq("email", email);
    if (updateError) {
      console.error("[kavoo] revogação falhou:", updateError);
      return NextResponse.json({ erro: "falha ao revogar" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, acao: "revogado" });
  }

  // Pix/boleto gerado, carrinho abandonado, recusado…: 200 para a Kavoo não
  // reenviar em loop.
  return NextResponse.json({ ok: true, acao: "ignorado", evento });
}
