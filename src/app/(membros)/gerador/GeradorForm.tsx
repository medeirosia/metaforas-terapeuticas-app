"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOTAL_ETAPAS = 3;

export default function GeradorForm({ isDemo }: { isDemo: boolean }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [dor, setDor] = useState("");
  const [contexto, setContexto] = useState("");
  const [tom, setTom] = useState("Suave");
  const [gerando, setGerando] = useState(false);

  function proximaEtapa() {
    setEtapa((e) => Math.min(TOTAL_ETAPAS, e + 1));
  }

  function etapaAnterior() {
    setEtapa((e) => Math.max(1, e - 1));
  }

  function gerar() {
    if (isDemo) {
      router.push("/pagamento");
      return;
    }
    setGerando(true);
  }

  const inputClass =
    "glass-card w-full rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-gold/60 focus:outline-none";

  return (
    <div className="glass-card mx-auto max-w-xl rounded-[32px] p-6 sm:p-10">
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_ETAPAS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < etapa ? "bg-gold" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {gerando ? (
        <div className="animate-reveal flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold-light">
            ✨
          </span>
          <h2 className="font-serif text-2xl italic text-zinc-50">
            Gerador chegando em breve
          </h2>
          <p className="max-w-sm text-sm text-zinc-400">
            Estamos finalizando o gerador de metáforas personalizadas. Em
            breve você vai poder criar a sua aqui mesmo.
          </p>
        </div>
      ) : (
        <>
          {etapa === 1 && (
            <div className="animate-reveal flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                Etapa 1 de 3
              </p>
              <h2 className="font-serif text-xl italic text-zinc-50">
                Qual dor ou situação você quer trabalhar?
              </h2>
              <textarea
                value={dor}
                onChange={(e) => setDor(e.target.value)}
                rows={4}
                placeholder="Ex: medo de se comprometer em relacionamentos..."
                className={inputClass}
              />
            </div>
          )}

          {etapa === 2 && (
            <div className="animate-reveal flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                Etapa 2 de 3
              </p>
              <h2 className="font-serif text-xl italic text-zinc-50">
                Conte um pouco sobre o contexto do seu cliente
              </h2>
              <textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                rows={4}
                placeholder="Ex: adulto jovem, passou por um término recente..."
                className={inputClass}
              />
            </div>
          )}

          {etapa === 3 && (
            <div className="animate-reveal flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                Etapa 3 de 3
              </p>
              <h2 className="font-serif text-xl italic text-zinc-50">
                Qual tom a metáfora deve ter?
              </h2>
              <select
                value={tom}
                onChange={(e) => setTom(e.target.value)}
                className={inputClass}
              >
                <option>Suave</option>
                <option>Direto</option>
                <option>Reflexivo</option>
              </select>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              onClick={etapaAnterior}
              disabled={etapa === 1}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gold/50 hover:text-gold-light disabled:opacity-0"
            >
              Voltar
            </button>

            {etapa < TOTAL_ETAPAS ? (
              <button
                type="button"
                onClick={proximaEtapa}
                className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={gerar}
                className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Gerar minha metáfora
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
