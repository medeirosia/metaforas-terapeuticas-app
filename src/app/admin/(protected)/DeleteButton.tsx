"use client";

import { useTransition } from "react";

export default function DeleteButton({
  metaforaId,
  excluirMetafora,
}: {
  metaforaId: string;
  excluirMetafora: (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Excluir esta metáfora? Essa ação não pode ser desfeita.")) {
      return;
    }
    startTransition(() => {
      excluirMetafora(metaforaId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-red-400 hover:underline disabled:opacity-50"
    >
      {pending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
