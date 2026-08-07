"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function criarAcessoComprador(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "").trim();

  if (!email || senha.length < 6) {
    throw new Error(
      "Informe um e-mail válido e uma senha com pelo menos 6 caracteres."
    );
  }

  // Cliente isolado (sem cookies): cria o usuário sem afetar a sessão do admin logado.
  const supabaseIsolado = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await supabaseIsolado.auth.signUp({
    email,
    password: senha,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Não foi possível criar o acesso.");

  const supabaseAdmin = await createClient();
  const { error: erroMembro } = await supabaseAdmin.from("members").insert({
    id: data.user.id,
    email,
    acesso_pago: true,
  });

  if (erroMembro) throw erroMembro;

  revalidatePath("/admin/membros");
}

export async function revogarAcesso(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ acesso_pago: false })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/membros");
}
