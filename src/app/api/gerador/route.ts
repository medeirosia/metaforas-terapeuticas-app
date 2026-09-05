import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { instrucoes, pedido, ABORDAGENS } from "@/lib/gerador-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Teto por pessoa e por dia. Existe porque a conta é por uso: sem ele, um
// membro segurando o botão vira a fatura do mês inteiro. Ajustável sem deploy.
const LIMITE_DIARIO = Number(process.env.GERADOR_LIMITE_DIARIO ?? 10);
const MODELO = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
const LIMITE_DOR = 600;

function erro(mensagem: string, status: number) {
  return NextResponse.json({ erro: mensagem }, { status });
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return erro("O gerador ainda não está ligado. Fale com o suporte.", 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return erro("Entre na sua conta para usar o gerador.", 401);

  // O acesso vem do banco a cada chamada, não do que o navegador afirma: quem
  // teve o acesso revogado para de gerar na hora.
  const { data: membro } = await supabase
    .from("members")
    .select("acesso_pago")
    .eq("id", user.id)
    .maybeSingle();

  if (!membro?.acesso_pago) {
    return erro("O gerador faz parte do acesso completo à biblioteca.", 403);
  }

  let corpo: { dor?: unknown; abordagem?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return erro("Pedido inválido.", 400);
  }

  const dor = String(corpo.dor ?? "").trim().slice(0, LIMITE_DOR);
  const abordagem = String(corpo.abordagem ?? "").trim();

  // Mínimo de 3, não de 10: o antigo fez alguém digitar "pai" seguido de vinte
  // e quatro pontos pra conseguir enviar. Tema curto agora passa, e quem
  // resolve é o prompt, que escolhe uma cena concreta quando o pedido é vago.
  if (dor.length < 3) {
    return erro("Escreva ao menos a dor que você quer trabalhar.", 400);
  }
  if (!ABORDAGENS.includes(abordagem)) {
    return erro("Escolha uma das abordagens da lista.", 400);
  }

  const desdeOntem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("geracoes")
    .select("id", { count: "exact", head: true })
    .eq("member_id", user.id)
    .gte("created_at", desdeOntem);

  if ((count ?? 0) >= LIMITE_DIARIO) {
    return erro(
      `Você já gerou ${LIMITE_DIARIO} metáforas nas últimas 24 horas. O limite volta a liberar aos poucos.`,
      429
    );
  }

  let resposta: Response;
  try {
    resposta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODELO,
        instructions: instrucoes(),
        input: pedido(dor, abordagem),
        max_output_tokens: 900,
        reasoning: { effort: "low" },
      }),
    });
  } catch {
    return erro("Não consegui falar com o gerador agora. Tente de novo.", 502);
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const codigo = dados?.error?.code ?? "";
    // Saldo acabado é o único erro que o dono da operação resolve sozinho, e
    // vale dizer isso em vez de "erro inesperado".
    if (codigo === "credit_balance_exhausted" || codigo === "insufficient_quota") {
      return erro(
        "O gerador está temporariamente sem créditos. Já avisamos a equipe.",
        503
      );
    }
    console.error("gerador: openai respondeu", resposta.status, codigo);
    return erro("Não consegui gerar agora. Tente de novo em instantes.", 502);
  }

  const texto: string = (
    dados?.output_text ??
    (dados?.output ?? [])
      .filter((item: { type?: string }) => item?.type === "message")
      .flatMap((item: { content?: { text?: string }[] }) => item.content ?? [])
      .map((bloco: { text?: string }) => bloco?.text ?? "")
      .join("")
  )
    .toString()
    .trim();

  if (!texto) {
    return erro("A resposta veio vazia. Tente de novo.", 502);
  }

  // O modelo foi instruído a recusar caso de risco em vez de escrever metáfora.
  // Aqui a recusa vira uma resposta própria, pra tela não tratar como texto
  // pronto pra mandar ao cliente.
  if (/^RISCO\s*:/i.test(texto)) {
    return NextResponse.json({
      risco: true,
      texto: texto.replace(/^RISCO\s*:\s*/i, ""),
    });
  }

  await supabase.from("geracoes").insert({
    member_id: user.id,
    dor,
    abordagem,
    resultado: texto,
    modelo: MODELO,
    tokens_entrada: dados?.usage?.input_tokens ?? null,
    tokens_saida: dados?.usage?.output_tokens ?? null,
  });

  return NextResponse.json({
    texto,
    restantes: Math.max(0, LIMITE_DIARIO - (count ?? 0) - 1),
  });
}
