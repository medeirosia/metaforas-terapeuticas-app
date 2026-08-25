"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CriarMembroForm({
  action,
}: {
  action: (formData: FormData) => Promise<string>;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-teal-400 focus:outline-none";

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(null);
    iniciar(async () => {
      try {
        setSucesso(await action(formData));
        router.refresh();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao enviar o acesso.");
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-zinc-900 p-6"
    >
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">
          Enviar acesso por e-mail
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          A pessoa recebe o e-mail de acesso na hora, com a senha dentro. Se ela
          já tiver conta, o acesso é reativado e ela recebe um link para criar
          uma senha nova.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="pessoa@email.com"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Nome (opcional, só para o "Oi, fulano")
          </label>
          <input name="nome" type="text" className={inputClass} placeholder="Rafaela" />
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
        >
          {enviando ? "Enviando..." : "Enviar acesso"}
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input name="licenca" type="checkbox" className="accent-teal-500" />
        Incluir a licença de uso nas redes (assiste e baixa sem marca d&apos;água)
      </label>

      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {sucesso && <p className="text-sm text-teal-400">{sucesso}</p>}
    </form>
  );
}
