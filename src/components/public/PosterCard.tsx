"use client";

import type { Metafora } from "@/lib/metaforas";

function PlayIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} translate-x-0.5`} aria-hidden="true">
      <path d="M8 5.14v13.72c0 .78.85 1.27 1.54.87l11.14-6.86a1 1 0 000-1.72L9.54 4.27A1 1 0 008 5.14z" />
    </svg>
  );
}

function LockIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 5a3 3 0 116 0v3H9V7zm3 7a2 2 0 011.732 3H10.27A2 2 0 0112 14z" />
    </svg>
  );
}

export default function PosterCard({
  metafora,
  onSelect,
  progresso,
  destaque = false,
  preencherLargura = false,
  bloqueado = false,
  compacto = false,
}: {
  metafora: Metafora;
  onSelect: (metafora: Metafora) => void;
  progresso?: number;
  destaque?: boolean;
  preencherLargura?: boolean;
  bloqueado?: boolean;
  compacto?: boolean;
}) {
  const largura = preencherLargura
    ? "w-full"
    : compacto
      ? "w-28 sm:w-32 md:w-36"
      : destaque
      ? "w-48 sm:w-56 md:w-64"
      : "w-32 sm:w-40 md:w-44";

  const emBreve = metafora.status === "em_breve";
  const exibirBloqueio = emBreve || bloqueado;

  return (
    <button
      type="button"
      onClick={() => onSelect(metafora)}
      className={`glass-card group relative overflow-hidden ${compacto ? "rounded-2xl" : "rounded-3xl"} text-left transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:z-10 hover:scale-105 hover:border-gold/60 hover:shadow-[0_0_40px_rgba(167,139,113,0.25)] ${preencherLargura ? "" : "shrink-0 snap-start"} ${largura}`}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
        {metafora.thumb_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={metafora.thumb_url}
            alt={metafora.titulo}
            className="h-full w-full object-cover"
          />
        ) : metafora.video_url ? (
          <video
            src={metafora.video_url}
            className="h-full w-full object-cover"
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/[0.06] to-transparent p-3 text-center">
            <span className="font-serif text-sm italic text-zinc-500">
              {metafora.titulo}
            </span>
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            exibirBloqueio
              ? "bg-black/60 opacity-100 backdrop-blur-[1.5px]"
              : "bg-black/10 opacity-0 group-hover:opacity-100 group-hover:bg-black/30"
          }`}
        >
          <span
            className={`flex ${compacto ? "h-10 w-10" : "h-11 w-11"} items-center justify-center rounded-full shadow-lg ${
              exibirBloqueio ? "bg-black/65 text-zinc-100 ring-1 ring-white/15" : "bg-gold text-black"
            }`}
          >
            {exibirBloqueio ? <LockIcon className="h-5 w-5" /> : <PlayIcon />}
          </span>
        </div>

        {typeof progresso === "number" && !exibirBloqueio && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div
              className="h-full bg-gold"
              style={{ width: `${Math.min(100, Math.max(4, progresso))}%` }}
            />
          </div>
        )}
      </div>
      <div className={compacto ? "p-2" : "p-2.5"}>
        <p className={`${compacto ? "text-xs" : "text-sm"} truncate font-medium text-zinc-100`}>
          {metafora.titulo}
        </p>
        {exibirBloqueio && (
          <p className="text-xs text-zinc-500">🔒 Bloqueado</p>
        )}
      </div>
    </button>
  );
}
