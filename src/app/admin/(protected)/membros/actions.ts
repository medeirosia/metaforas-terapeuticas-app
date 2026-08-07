"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function criarAcessoComprador(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  if (!email || senha.length < 6) {
    throw new Error("Informe e-mail e senha com pelo menos 6 caracteres.");
  }

  const authClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data, error } = await authClient.auth.signUp({
    email,
    password: senha,
  });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error("Não foi possível criar usuário.");

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("members").upsert({
    id: userId,
    email,
    acesso_pago: true,
  });
  if (insertError) throw insertError;

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
