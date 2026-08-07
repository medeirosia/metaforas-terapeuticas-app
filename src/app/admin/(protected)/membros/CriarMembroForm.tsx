"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CriarMembroForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-teal-400 focus:outline-none";

  async function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(null);
    try {
      await action(formData);
      setSucesso(
        `Acesso criado para ${formData.get("email")}. Envie o login e a senha para o comprador.`
      );
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao criar acesso.");
    }
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-zinc-900 p-6 sm:flex-row sm:items-end sm:gap-3"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          E-mail do comprador
        </label>
        <input
          name="email"
          type="email"
          required
          className={inputClass}
          placeholder="comprador@email.com"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Senha (mínimo 6 caracteres)
        </label>
        <input
          name="senha"
          type="text"
          required
          minLength={6}
          className={inputClass}
          placeholder="Senha que você vai enviar por e-mail"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-500"
      >
        Criar acesso
      </button>
      {erro && <p className="text-sm text-red-400 sm:basis-full">{erro}</p>}
      {sucesso && (
        <p className="text-sm text-teal-400 sm:basis-full">{sucesso}</p>
      )}
    </form>
  );
}
