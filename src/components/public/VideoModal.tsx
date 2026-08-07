"use client";

import { useEffect, useRef, useState } from "react";
import ShareButtons from "@/components/public/ShareButtons";
import { criarMensagemCompartilhar, type Metafora } from "@/lib/metaforas";

export default function VideoModal({
  metafora,
  categoriaNome,
  onClose,
  onProgresso,
  exibirCtaPreview = false,
  onUnlock,
}: {
  metafora: Metafora;
  categoriaNome: string;
  onClose: () => void;
  onProgresso: (slug: string, progresso: number) => void;
  exibirCtaPreview?: boolean;
  onUnlock?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFinalizado, setVideoFinalizado] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

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

    function registrarFim() {
      setVideoFinalizado(true);
    }

    video.addEventListener("timeupdate", registrarProgresso);
    video.addEventListener("pause", registrarProgresso);
    video.addEventListener("ended", registrarFim);
    return () => {
      video.removeEventListener("timeupdate", registrarProgresso);
      video.removeEventListener("pause", registrarProgresso);
      video.removeEventListener("ended", registrarFim);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metafora.slug]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card gold-glow animate-reveal relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-[32px] bg-[#0a0a0a]/80 sm:flex-row sm:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full shrink-0 flex-col bg-black sm:w-[300px]">
          <div className="relative aspect-[9/16] w-full bg-black">
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar"
              className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/65 text-2xl font-light leading-none text-white shadow-[0_0_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors hover:border-emerald-300/60 hover:text-emerald-200"
            >
              ×
            </button>
            <video
              ref={videoRef}
              src={metafora.video_url ?? undefined}
              className="h-full w-full object-cover"
              controls
              autoPlay
              playsInline
              onPlay={() => setVideoFinalizado(false)}
            />
            {!exibirCtaPreview && (
              <div className="absolute bottom-28 right-4 z-20 sm:bottom-4">
                <ShareButtons
                  titulo={metafora.titulo}
                  videoUrl={metafora.video_url ?? ""}
                  slug={metafora.slug}
                  mensagem={criarMensagemCompartilhar(
                    metafora.titulo,
                    metafora.resumo ?? ""
                  )}
                  compacto
                />
              </div>
            )}
            {videoFinalizado && exibirCtaPreview && (
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-emerald-400/30 bg-black/75 p-4 text-center text-sm font-semibold text-emerald-200 backdrop-blur-md">
                Esta é 1 de 147+ metáforas disponíveis no acervo completo.
              </div>
            )}
          </div>

          {exibirCtaPreview && (
            <div className="border-t border-emerald-400/30 bg-[#07100c]/95 p-4 text-center shadow-[0_-18px_48px_rgba(16,185,129,0.18)] backdrop-blur-md">
              <p className="text-sm font-black leading-snug text-zinc-50">
                Gostou desta metáfora? Libere o acervo completo com +147 vídeos.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                Por apenas{" "}
                <strong className="text-emerald-300">12x de R$ 6,83</strong>{" "}
                ou <strong className="text-gold-light">R$ 67,00 à vista</strong>
              </p>
              <button
                type="button"
                onClick={onUnlock}
                className="relative mt-3 inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-emerald-400 px-4 py-3 text-xs font-black uppercase tracking-wide text-black shadow-[0_0_34px_rgba(52,211,153,0.45)] transition-transform hover:scale-[1.02]"
              >
                <span className="absolute inset-0 animate-pulse bg-emerald-300/40" />
                <span className="shine-sweep absolute -left-14 top-0 h-full w-12 -skew-x-12 bg-white/50 shadow-[0_0_24px_rgba(255,255,255,0.7)]" />
                <span className="relative">🚀 Desbloquear todas as metáforas</span>
              </button>
            </div>
          )}
        </div>

        <div
          className={`relative z-10 flex flex-1 flex-col gap-3 overflow-y-auto border-t border-white/10 bg-[#0a0a0a]/95 font-sans font-light backdrop-blur-xl transition-[max-height] duration-300 sm:inset-auto sm:z-auto sm:max-h-none sm:rounded-none sm:border-l sm:border-t-0 sm:p-6 sm:shadow-none ${
            detalhesAbertos ? "max-h-[60vh] p-5" : "max-h-28 p-4"
          }`}
        >
          <button
            type="button"
            onClick={() => setDetalhesAbertos((aberto) => !aberto)}
            aria-expanded={detalhesAbertos}
            className="flex flex-col items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-gold-light sm:hidden"
          >
            <span className="h-1.5 w-12 rounded-full bg-white/25" />
            {detalhesAbertos ? "Ocultar detalhes" : "Ver detalhes"}
          </button>
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

          <div className={`${detalhesAbertos ? "block" : "hidden"} sm:block`}>
            <p className="text-sm leading-relaxed text-zinc-300">
              {metafora.descricao ?? ""}
            </p>

            <div className="mt-4">
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

            <div className="mt-4 pt-2">
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
    </div>
  );
}
