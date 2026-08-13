"use client";

import { useTransition } from "react";

export default function LicencaToggle({
  id,
  ativa,
  alternarLicencaRedes,
}: {
  id: string;
  ativa: boolean;
  alternarLicencaRedes: (id: string, ativar: boolean) => Promise<void>;
}) {
  const [pendente, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() =>
        startTransition(() => {
          void alternarLicencaRedes(id, !ativa);
        })
      }
      title={
        ativa
          ? "Assiste sem a marca d'água do e-mail. Clique para tirar a licença."
          : "Clique para liberar a licença de uso nas redes"
      }
      className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        ativa
          ? "bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
          : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"
      }`}
    >
      {pendente ? "..." : ativa ? "Licença" : "Sem licença"}
    </button>
  );
}
