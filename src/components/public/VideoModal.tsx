"use client";

import { useEffect, useRef, useState } from "react";
import MarcaDaguaAluno from "@/components/public/MarcaDaguaAluno";
import ShareButtons from "@/components/public/ShareButtons";
import { criarMensagemCompartilhar, type Metafora } from "@/lib/metaforas";

export default function VideoModal({
  metafora,
  categoriaNome,
  onClose,
  onProgresso,
  exibirCtaPreview = false,
  onUnlock,
  emailAluno = null,
  licencaRedes = false,
}: {
  metafora: Metafora;
  categoriaNome: string;
  onClose: () => void;
  onProgresso: (slug: string, progresso: number) => void;
  exibirCtaPreview?: boolean;
  onUnlock?: () => void;
  emailAluno?: string | null;
  licencaRedes?: boolean;
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
          <div
            className={`relative w-full bg-black ${
              exibirCtaPreview
                ? "h-[calc(92dvh-2rem)] sm:h-auto sm:aspect-[9/16]"
                : "aspect-[9/16]"
            }`}
          >
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
            {!exibirCtaPreview && <MarcaDaguaAluno email={emailAluno} />}
            {!exibirCtaPreview && (
              // Um de cada lado na mesma linha; altura livre da barra de
              // controles do player (que ocupa o rodape do video).
              <div className="absolute bottom-28 left-4 z-20 sm:bottom-16">
                <a
                  // Com licença de uso nas redes, baixa a versão limpa (sem
                  // logo) pela rota que confere a licença e assina o link.
                  //
                  // Quem tem licença vê um botão ESCRITO. O ícone mudo fazia
                  // o comprador salvar o vídeo pelo player e levar o arquivo
                  // com logo, achando que a licença não tinha funcionado.
                  href={
                    licencaRedes
                      ? `/api/baixar/${metafora.slug}`
                      : metafora.video_url ?? "#"
                  }
                  download={`${metafora.slug}.mp4`}
                  aria-label={
                    licencaRedes
                      ? "Baixar esta metáfora sem logo"
                      : "Baixar esta metáfora"
                  }
                  className={
                    licencaRedes
                      ? "flex h-11 items-center gap-2 rounded-full border border-gold/55 bg-black/70 px-4 text-xs font-semibold text-gold-light shadow-[0_0_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors hover:border-gold hover:text-gold-hover"
                      : "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white shadow-[0_0_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors hover:border-gold hover:text-gold-hover"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0"
                  >
                    <path d="M12 3v12" />
                    <path d="m7 11 5 5 5-5" />
                    <path d="M4 20h16" />
                  </svg>
                  {licencaRedes && (
                    <span className="whitespace-nowrap">Baixar sem logo</span>
                  )}
                </a>
              </div>
            )}
            {!exibirCtaPreview && (
              <div className="absolute bottom-28 right-4 z-20 sm:bottom-16">
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
            {exibirCtaPreview && (
              <div className="absolute inset-x-3 bottom-3 z-20 rounded-3xl border border-emerald-400/35 bg-[#07100c]/92 p-3 text-center shadow-[0_-18px_48px_rgba(16,185,129,0.18),0_0_34px_rgba(52,211,153,0.2)] backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:p-4">
                {videoFinalizado && (
                  <p className="mb-2 text-[11px] font-semibold text-emerald-200">
                    Esta é 1 de 147+ metáforas disponíveis no acervo completo.
                  </p>
                )}
                <p className="text-sm font-black leading-snug text-zinc-50">
                  Gostou desta metáfora? Libere o acervo completo com +147 vídeos.
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                  Por apenas{" "}
                  <strong className="text-emerald-300">R$ 47</strong>{" "}
                </p>
                <button
                  type="button"
                  onClick={onUnlock}
                  className="relative mt-2.5 inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-emerald-400 px-4 py-3 text-xs font-black uppercase tracking-wide text-black shadow-[0_0_34px_rgba(52,211,153,0.45)] transition-transform hover:scale-[1.02]"
                >
                  <span className="absolute inset-0 animate-pulse bg-emerald-300/40" />
                  <span className="shine-sweep absolute -left-14 top-0 h-full w-12 -skew-x-12 bg-white/50 shadow-[0_0_24px_rgba(255,255,255,0.7)]" />
                  <span className="relative">🚀 Desbloquear todas as metáforas</span>
                </button>
              </div>
            )}
          </div>
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
