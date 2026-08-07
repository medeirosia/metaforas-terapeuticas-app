"use client";

import { useEffect, useState } from "react";

const COMPRAS = [
  ["Mariana", "Belo Horizonte"],
  ["Rafael", "Curitiba"],
  ["Patrícia", "Recife"],
  ["Lucas", "Campinas"],
  ["Aline", "Florianópolis"],
  ["Fernanda", "São Paulo"],
];

const NOTIFICACOES = [
  ...COMPRAS.map(([nome, cidade]) => ({
    tipo: "compra",
    icon: "✓",
    texto: `${nome} acabou de comprar!`,
    detalhe: cidade,
  })),
  {
    tipo: "atualizacao",
    icon: "+",
    texto: "+5 novas metáforas disponíveis.",
    detalhe: "Atualização do acervo",
  },
];

export default function SocialProofNotifications() {
  const [indice, setIndice] = useState(0);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const entrada = window.setTimeout(() => setVisivel(true), 1800);
    const ciclo = window.setInterval(() => {
      setVisivel(false);
      window.setTimeout(() => {
        setIndice((atual) => (atual + 1) % NOTIFICACOES.length);
        setVisivel(true);
      }, 450);
    }, 7200);

    return () => {
      window.clearTimeout(entrada);
      window.clearInterval(ciclo);
    };
  }, []);

  const notificacao = NOTIFICACOES[indice];

  return (
    <div
      className={`pointer-events-none fixed inset-x-4 bottom-24 z-30 flex justify-center transition-all duration-500 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:justify-start lg:bottom-6 lg:left-72 ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
      aria-live="polite"
    >
      <div className="flex max-w-[min(22rem,calc(100vw-2rem))] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0b10]/92 px-4 py-3 text-left shadow-[0_18px_54px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-base font-black text-black">
          {notificacao.icon}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-zinc-50">
            {notificacao.texto}
          </span>
          <span className="block truncate text-xs font-medium text-zinc-400">
            {notificacao.detalhe}
          </span>
        </span>
      </div>
    </div>
  );
}
