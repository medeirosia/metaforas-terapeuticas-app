"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
      setErro(err instanceof Error ? err.message : "Erro ao enviar capa.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      {url && (
        <img src={url} alt="" className="mb-3 aspect-[9/16] w-28 rounded-lg object-cover" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={enviando}
        className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-500 disabled:opacity-60"
      />
      {enviando && <p className="mt-2 text-xs text-teal-400">Enviando capa...</p>}
      {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}
    </div>
  );
}
