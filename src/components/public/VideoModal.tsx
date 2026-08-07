"use client";

import { useEffect, useRef } from "react";
import ShareButtons from "@/components/public/ShareButtons";
import { criarMensagemCompartilhar, type Metafora } from "@/lib/metaforas";

export default function VideoModal({
  metafora,
  categoriaNome,
  onClose,
  onProgresso,
}: {
  metafora: Metafora;
  categoriaNome: string;
  onClose: () => void;
  onProgresso: (slug: string, progresso: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function registrarProgresso() {
      if (!video || !video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      onProgresso(metafora.slug, pct);
    }

    video.addEventListener("timeupdate", registrarProgresso);
    video.addEventListener("pause", registrarProgresso);
    return () => {
      video.removeEventListener("timeupdate", registrarProgresso);
      video.removeEventListener("pause", registrarProgresso);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metafora.slug]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card gold-glow animate-reveal flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] bg-[#0a0a0a]/80 sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[9/16] w-full shrink-0 bg-black sm:w-[300px]">
          <video
            ref={videoRef}
            src={metafora.video_url ?? undefined}
            className="h-full w-full object-cover"
            controls
            autoPlay
            playsInline
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6 font-sans font-light">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                {categoriaNome}
              </span>
              <h2 className="mt-1 font-serif text-2xl italic text-zinc-50">
                {metafora.titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gold/50 hover:text-gold-light"
            >
              ✕
            </button>
          </div>

          <p className="text-sm leading-relaxed text-zinc-300">
            {metafora.descricao ?? ""}
          </p>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gold-light">
              Dores abordadas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {metafora.dores.map((dor) => (
                <span
                  key={dor}
                  className="rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-light"
                >
                  {dor}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-2">
            <ShareButtons
              titulo={metafora.titulo}
              videoUrl={metafora.video_url ?? ""}
              slug={metafora.slug}
              mensagem={criarMensagemCompartilhar(
                metafora.titulo,
                metafora.resumo ?? ""
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
