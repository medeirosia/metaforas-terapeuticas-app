"use client";

import { useState } from "react";

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.34 4.95L2.05 22l5.28-1.39a9.9 9.9 0 004.71 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm.01 18.14h-.01a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 01-1.25-4.37c0-4.53 3.69-8.22 8.23-8.22a8.23 8.23 0 010 16.45z" />
    </svg>
  );
}

export default function ShareButtons({
  titulo,
  videoUrl,
  slug,
  mensagem,
  compacto = false,
}: {
  titulo: string;
  videoUrl: string;
  slug: string;
  mensagem: string;
  compacto?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/metaforas?video=${slug}`
      : "";

  async function compartilhar() {
    const texto = `${mensagem}\n\n${shareUrl}`;

    if (navigator.share) {
      await navigator.share({
        title: titulo,
        text: texto,
        url: videoUrl || shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1800);
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${mensagem}\n\n${shareUrl}`
  )}`;

  if (compacto) {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Enviar no WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-black shadow-[0_0_28px_rgba(52,211,153,0.45)] transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={compartilhar}
        className="glass-card flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gold/50 hover:text-gold-light"
      >
        {copiado ? "Mensagem copiada" : "Compartilhar"}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="glass-card flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gold/50 hover:text-gold-light"
      >
        <WhatsAppIcon /> Enviar no WhatsApp
      </a>
    </div>
  );
}
