import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Quem é admin está no banco, na função `public.eh_admin()` — a mesma que as
// políticas de RLS das tabelas e do storage usam. Aqui a gente só pergunta,
// em vez de manter uma segunda lista de ids no código: duas listas divergem
// na primeira vez que alguém entra ou sai, e a que manda de verdade é a do
// banco. Admin novo = um `create or replace function` e mais nada.
export async function ehAdmin(supabase: Supabase) {
  const { data } = await supabase.rpc("eh_admin");
  return data === true;
}

/**
 * Portão do painel, para layout e páginas.
 *
 * Antes daqui o /admin só checava se havia ALGUÉM logado — então qualquer
 * comprador que digitasse o endereço entrava e via a casca do painel, com a
 * lista vazia porque o RLS segurava os dados. Confundiu o próprio cliente.
 */
export async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  if (!(await ehAdmin(supabase))) redirect("/metaforas");

  return { supabase, user };
}

/**
 * Mesmo portão, para server action.
 *
 * Aqui erro é melhor que redirect: a tela mostra a mensagem no formulário em
 * vez de trocar de página no meio do envio. E é obrigatório mesmo com o RLS
 * ligado, porque as ações de acesso criam conta e disparam e-mail pela chave
 * pública, um caminho que o RLS não cobre.
 */
export async function exigirAdminNaAcao(supabase: Supabase) {
  if (!(await ehAdmin(supabase))) {
    throw new Error("Sua conta não tem permissão para isso.");
  }
}
