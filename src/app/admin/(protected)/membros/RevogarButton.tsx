"use client";

import { useTransition } from "react";

export default function RevogarButton({
  id,
  revogarAcesso,
}: {
  id: string;
  revogarAcesso: (id: string) => Promise<void>;
}) {
  const [pendente, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => {
        if (!confirm("Revogar acesso deste comprador?")) return;
        startTransition(() => {
          void revogarAcesso(id);
        });
      }}
      className="text-red-400 hover:underline disabled:opacity-50"
    >
      {pendente ? "Revogando..." : "Revogar"}
    </button>
  );
}
