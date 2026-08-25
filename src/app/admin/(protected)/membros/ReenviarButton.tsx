"use client";

import { useState, useTransition } from "react";

// Socorro para o comprador que não consegue entrar: manda o link de criar
// senha nova para o e-mail dele. Não mexe no acesso, só na senha.
export default function ReenviarButton({
  email,
  reenviarAcesso,
}: {
  email: string;
  reenviarAcesso: (email: string) => Promise<string>;
}) {
  const [pendente, startTransition] = useTransition();
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");

  if (estado === "ok") {
    return <span className="text-xs text-teal-400">E-mail enviado</span>;
  }

  return (
    <button
      type="button"
      disabled={pendente}
      title={`Enviar link de nova senha para ${email}`}
      onClick={() =>
        startTransition(async () => {
          try {
            await reenviarAcesso(email);
            setEstado("ok");
          } catch {
            setEstado("erro");
          }
        })
      }
      className="text-zinc-400 hover:text-teal-300 hover:underline disabled:opacity-50"
    >
      {pendente ? "Enviando..." : estado === "erro" ? "Falhou, tentar de novo" : "Reenviar acesso"}
    </button>
  );
}
