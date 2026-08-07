import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AccessState = {
  userEmail: string | null;
  acessoPago: boolean;
  isDemo: boolean;
};

export const getAccessState = cache(async (): Promise<AccessState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userEmail: null, acessoPago: false, isDemo: true };
  }

  const { data: member } = await supabase
    .from("members")
    .select("acesso_pago")
    .eq("id", user.id)
    .maybeSingle();

  const acessoPago = member?.acesso_pago ?? false;

  return {
    userEmail: user.email ?? null,
    acessoPago,
    isDemo: !acessoPago,
  };
});
