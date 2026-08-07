"use client";

import { useTransition } from "react";

type DeleteButtonProps = {
  metaforaId: string;
  excluirMetafora: (id: string) => Promise<void>;
};

export default function DeleteButton({
  metaforaId,
  excluirMetafora,
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmado = window.confirm(
      "Tem certeza que deseja excluir esta metáfora?"
    );

    if (!confirmado) return;

    startTransition(async () => {
      await excluirMetafora(metaforaId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-red-400 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
