"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { exigirAdminNaAcao } from "@/lib/admin";
import { enviarEmailAcesso, gerarSenha } from "@/lib/acesso";

// Destino dos links que saem por e-mail. Valor de desenvolvimento (localhost)
// não serve aqui: o Supabase recusa fora da allow-list e joga o comprador na
// raiz do site, com o token de recuperação e sem tela para criar senha.
const SITE = "https://www.metaforasterapeuticas.video";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
  ? process.env.NEXT_PUBLIC_APP_URL
  : SITE;

function clientIsolado() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Um botão só, para os dois casos que o Kenneth pediu:
 *
 *  - e-mail novo (presentear alguém): cria a conta, libera o acesso e manda o
 *    MESMO e-mail do webhook, já com a senha dentro.
 *  - e-mail que já existe (cliente que não consegue entrar): reativa o acesso
 *    e dispara o link de redefinir senha.
 *
 * O segundo caminho existe porque a operação roda sem service role — não dá
 * para escolher a senha de quem já tem conta, e nem precisa: a pessoa define
 * a dela pelo link.
 */
export async function enviarAcessoPorEmail(formData: FormData) {
  const supabase = await createClient();
  await exigirAdminNaAcao(supabase);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nome = String(formData.get("nome") ?? "").trim();
  const licenca = formData.get("licenca") === "on";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("Informe um e-mail válido.");
  }

  const senha = gerarSenha();
  const { data, error } = await clientIsolado().auth.signUp({ email, password: senha });

  const userId = data?.user?.id ?? null;

  if (!error && userId) {
    const { error: upsertError } = await supabase.from("members").upsert({
      id: userId,
      email,
      acesso_pago: true,
      ...(licenca ? { licenca_redes: true } : {}),
    });
    if (upsertError) throw upsertError;

    await enviarEmailAcesso(nome, email, { tipo: "nova-conta", senha });
    revalidatePath("/admin/membros");
    return `Acesso criado e e-mail enviado para ${email} com a senha.`;
  }

  const jaExiste = /already|registered|exists/i.test(error?.message ?? "");
  if (!jaExiste) throw new Error(error?.message ?? "Não foi possível criar o acesso.");

  // Já tem conta: garante o acesso ligado e manda o link de nova senha.
  const { data: linha } = await supabase
    .from("members")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (linha) {
    await supabase
      .from("members")
      .update({ acesso_pago: true, ...(licenca ? { licenca_redes: true } : {}) })
      .eq("id", linha.id);
  }

  await reenviarSenha(email);
  revalidatePath("/admin/membros");
  return `${email} já tinha conta. Acesso liberado e enviei o link para a pessoa criar uma senha nova.`;
}

/**
 * Dispara o e-mail de redefinição de senha do próprio Supabase. Usado pelo
 * botão "Reenviar" de cada linha e pelo caminho de conta existente acima.
 *
 * Sem `export` de propósito: neste arquivo todo export vira endpoint que
 * qualquer pessoa logada pode chamar, e esta função manda e-mail pela chave
 * pública, fora do alcance do RLS. Quem entra por fora é o `reenviarAcesso`,
 * que confere o admin antes.
 */
async function reenviarSenha(email: string) {
  const { error } = await clientIsolado().auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}/redefinir-senha`,
  });
  if (error) throw new Error(`Não consegui enviar o e-mail: ${error.message}`);
}

export async function reenviarAcesso(email: string) {
  await exigirAdminNaAcao(await createClient());
  await reenviarSenha(email);
  return `Link para criar uma senha nova enviado para ${email}.`;
}

export async function revogarAcesso(id: string) {
  const supabase = await createClient();
  await exigirAdminNaAcao(supabase);
  const { error } = await supabase
    .from("members")
    .update({ acesso_pago: false })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/membros");
}

// Order bump "licença de uso nas redes": liga/desliga a marca d'água com o
// e-mail no player desse comprador. O webhook também liga sozinho quando a
// Kirvano manda o bump no pedido; isto aqui é o controle na mão.
export async function alternarLicencaRedes(id: string, ativar: boolean) {
  const supabase = await createClient();
  await exigirAdminNaAcao(supabase);
  const { error } = await supabase
    .from("members")
    .update({ licenca_redes: ativar })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/membros");
}
