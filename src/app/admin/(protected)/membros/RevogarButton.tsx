"use client";

import { useTransition } from "react";

export default function RevogarButton({
  id,
  revogarAcesso,
}: {
  id: string;
  revogarAcesso: (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Revogar o acesso pago desse membro?")) return;
    startTransition(() => {
      revogarAcesso(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-red-400 hover:underline disabled:opacity-50"
    >
      {pending ? "Revogando..." : "Revogar"}
    </button>
  );
}
