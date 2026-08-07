"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

export default function ThumbUploadField({
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

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro("Envie uma imagem .jpg, .png ou .webp.");
      return;
    }

    setErro(null);
    setEnviando(true);

    try {
      const supabase = createClient();
      const extensao = arquivo.name.split(".").pop() ?? "jpg";
      const caminho = `${crypto.randomUUID()}.${extensao}`;

      const { error } = await supabase.storage
        .from("thumbs")
        .upload(caminho, arquivo, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from("thumbs").getPublicUrl(caminho);
      setUrl(data.publicUrl);
      onChange?.(data.publicUrl);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setEnviando(false);
    }
  }

  function trocarImagem() {
    setUrl("");
    onChange?.("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />

      {url && !enviando ? (
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Capa da metáfora"
            className="aspect-[9/16] w-32 rounded-lg bg-black object-cover"
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-teal-400">Capa pronta.</p>
            <button
              type="button"
              onClick={trocarImagem}
              className="w-fit rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Trocar capa
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={enviando}
            className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-500 disabled:opacity-60"
          />
          {enviando && (
            <p className="mt-2 text-xs text-teal-400">Enviando imagem...</p>
          )}
        </div>
      )}

      {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}
    </div>
  );
}
