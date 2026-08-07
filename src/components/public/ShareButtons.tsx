"use client";

import { useState } from "react";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.986.583 3.833 1.588 5.386L2 22l4.735-1.55A9.947 9.947 0 0012 22c5.523 0 10-4.477 10-10S17.524 2 12.001 2zm0 18.06a8.033 8.033 0 01-4.29-1.238l-.308-.183-3.192 1.045.995-3.263-.202-.318A8.024 8.024 0 013.94 12c0-4.444 3.617-8.06 8.061-8.06 4.443 0 8.06 3.616 8.06 8.06 0 4.443-3.617 8.06-8.06 8.06z" />
    </svg>
  );
}

export default function ShareButtons({
  titulo,
  videoUrl,
  slug,
  mensagem,
  size = "md",
}: {
  titulo: string;
  videoUrl: string;
  slug: string;
  mensagem: string;
  size?: "sm" | "md";
}) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  function abrirWhatsAppComTexto() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function compartilhar() {
    if (sharing) return;
    setSharing(true);

    const suportaCompartilharArquivo =
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      "canShare" in navigator;

    if (suportaCompartilharArquivo) {
      try {
        const resposta = await fetch(videoUrl);
        const blob = await resposta.blob();
        const arquivo = new File([blob], `${slug}.mp4`, { type: "video/mp4" });

        if (navigator.canShare({ files: [arquivo] })) {
          await navigator.share({
            files: [arquivo],
            title: titulo,
            text: mensagem,
          });
          setSharing(false);
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setSharing(false);
          return;
        }
      }
    }

    abrirWhatsAppComTexto();
    setSharing(false);
  }

  async function copiarMensagem() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  }

  const padding = size === "sm" ? "px-3.5 py-2 text-xs" : "px-4 py-2.5 text-sm";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={compartilhar}
        disabled={sharing}
        className={`flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] font-semibold text-white transition-transform active:scale-95 hover:brightness-95 disabled:opacity-70 ${padding}`}
      >
        <WhatsAppIcon />
        {sharing ? "Preparando vídeo..." : "Compartilhar"}
      </button>
      <button
        type="button"
        onClick={copiarMensagem}
        title="Copiar mensagem"
        className={`glass-card flex items-center justify-center rounded-full font-medium text-zinc-300 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gold/50 hover:text-gold-light ${padding}`}
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
