"use client";

type VideoPreview = {
  titulo: string;
  videoUrl: string;
  thumbUrl: string | null;
};

export default function VideoLoop({
  videos,
  compacto = false,
}: {
  videos: VideoPreview[];
  compacto?: boolean;
}) {
  if (videos.length === 0) return null;

  const itens = [...videos, ...videos];

  return (
    <section className={`relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-black/30 ${compacto ? "py-3" : "py-5"}`}>
      {!compacto && (
        <div className="mb-4 px-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Veja uma amostra do acervo em movimento
          </p>
          <h2 className="mt-2 font-serif text-2xl italic text-zinc-50">
            Metáforas rodando em vídeo, prontas para usar em sessão
          </h2>
        </div>
      )}

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

      <div className="video-marquee flex w-max gap-3">
        {itens.map((video, index) => (
          <article
            key={`${video.videoUrl}-${index}`}
            className={`${compacto ? "w-24 sm:w-32" : "w-32 sm:w-40"} shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]`}
          >
            <div className="aspect-[9/16] bg-black">
              <video
                src={video.videoUrl}
                poster={video.thumbUrl ?? undefined}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
            <p className="truncate px-3 py-2 text-xs font-semibold text-zinc-300">
              {video.titulo}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
