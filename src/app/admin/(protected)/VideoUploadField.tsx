"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VideoUploadField({
  name,
  valorInicial,
  onChange,
}: {
  name: string;
  valorInicial?: string;
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(valorInicial ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (arquivo.type !== "video/mp4") {
      setErro("Envie um arquivo .mp4.");
      return;
    }

    setErro(null);
    setEnviando(true);

    try {
      const supabase = createClient();
      const extensao = arquivo.name.split(".").pop() ?? "mp4";
      const caminho = `${crypto.randomUUID()}.${extensao}`;

      const { error } = await supabase.storage
        .from("videos")
        .upload(caminho, arquivo, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from("videos").getPublicUrl(caminho);
      setUrl(data.publicUrl);
      onChange?.(data.publicUrl);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar vídeo.");
    } finally {
      setEnviando(false);
    }
  }

  function trocarVideo() {
    setUrl("");
    onChange?.("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />

      {url && !enviando ? (
        <div className="flex items-start gap-4">
          <video
            src={url}
            controls
            className="aspect-[9/16] w-32 rounded-lg bg-black object-cover"
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-teal-400">Vídeo pronto.</p>
            <button
              type="button"
              onClick={trocarVideo}
              className="w-fit rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Trocar vídeo
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4"
            onChange={handleFile}
            disabled={enviando}
            className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-500 disabled:opacity-60"
          />
          {enviando && (
            <p className="mt-2 text-xs text-teal-400">Enviando vídeo...</p>
          )}
        </div>
      )}

      {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}
    </div>
  );
}
