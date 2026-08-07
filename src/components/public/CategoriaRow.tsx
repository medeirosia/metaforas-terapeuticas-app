"use client";

import { useRef } from "react";
import PosterCard from "@/components/public/PosterCard";
import type { Metafora } from "@/lib/metaforas";

export default function CategoriaRow({
  titulo,
  metaforas,
  onSelect,
  progressos,
  destaque = false,
}: {
  titulo: string;
  metaforas: Metafora[];
  onSelect: (metafora: Metafora) => void;
  progressos?: Record<string, number>;
  destaque?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direcao: "esquerda" | "direita") {
    const el = scrollRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.8 * (direcao === "esquerda" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (metaforas.length === 0) return null;

  return (
    <section className="group/row">
      <h2 className="mb-2 px-6 font-serif text-lg italic text-gold-light sm:text-xl">
        {titulo}
      </h2>
      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("esquerda")}
          aria-label="Rolar para a esquerda"
          className="absolute left-0 top-0 z-10 hidden h-full w-10 items-center justify-center bg-gradient-to-r from-[#0a0a0a] to-transparent text-gold-light opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/row:opacity-100 sm:flex"
        >
          ‹
        </button>
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {metaforas.map((metafora) => (
            <PosterCard
              key={metafora.id}
              metafora={metafora}
              onSelect={onSelect}
              progresso={progressos?.[metafora.slug]}
              destaque={destaque}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll("direita")}
          aria-label="Rolar para a direita"
          className="absolute right-0 top-0 z-10 hidden h-full w-10 items-center justify-center bg-gradient-to-l from-[#0a0a0a] to-transparent text-gold-light opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/row:opacity-100 sm:flex"
        >
          ›
        </button>
      </div>
    </section>
  );
}
