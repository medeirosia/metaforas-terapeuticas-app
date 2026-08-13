import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AccessState = {
  userEmail: string | null;
  acessoPago: boolean;
  isDemo: boolean;
  // Order bump "licença de uso nas redes": o vídeo toca sem a marca d'água
  // com o e-mail, pra pessoa poder publicar. O logo continua queimado.
  licencaRedes: boolean;
};

export const getAccessState = cache(async (): Promise<AccessState> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userEmail: null,
      acessoPago: false,
      isDemo: true,
      licencaRedes: false,
    };
  }

  const { data: member } = await supabase
    .from("members")
    .select("acesso_pago, licenca_redes")
    .eq("id", user.id)
    .maybeSingle();

  const acessoPago = member?.acesso_pago ?? false;

  return {
    userEmail: user.email ?? null,
    acessoPago,
    isDemo: !acessoPago,
    licencaRedes: (member?.licenca_redes ?? false) && acessoPago,
  };
});
