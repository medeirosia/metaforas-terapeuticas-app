"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoUploadField from "@/app/admin/(protected)/VideoUploadField";
import ThumbUploadField from "@/app/admin/(protected)/ThumbUploadField";

type Categoria = { id: string; nome: string };

type MetaforaInicial = {
  titulo: string;
  status: "liberado" | "em_breve";
  video_url: string | null;
  thumb_url: string | null;
  resumo: string | null;
  descricao: string | null;
  categoria_id: string;
  dores: string[];
  destaque: boolean;
  publicado: boolean;
  ordem: number;
};

export default function MetaforaForm({
  categorias,
  inicial,
  action,
}: {
  categorias: Categoria[];
  inicial?: MetaforaInicial;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const router = useRouter();
  const [categoriaId, setCategoriaId] = useState(
    inicial?.categoria_id ?? categorias[0]?.id ?? ""
  );
  const [status, setStatus] = useState<"liberado" | "em_breve">(
    inicial?.status ?? "em_breve"
  );
  const [videoUrl, setVideoUrl] = useState(inicial?.video_url ?? "");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErro(null);

    if (status === "liberado" && !videoUrl) {
      setErro("Envie o arquivo de vídeo antes de marcar como liberado.");
      return;
    }

    try {
      await action(formData);
      router.push("/admin");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-teal-400 focus:outline-none";
  const labelClass = "mb-1 block text-xs font-medium text-zinc-400";

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Título da metáfora</label>
        <input
          name="titulo"
          required
          defaultValue={inicial?.titulo}
          className={inputClass}
          placeholder="Ex: Guarda-chuva aberto"
        />
      </div>

      <div>
        <label className={labelClass}>Status</label>
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "liberado" | "em_breve")}
          className={inputClass}
        >
          <option value="em_breve">Em breve (sem vídeo ainda)</option>
          <option value="liberado">Liberado (vídeo pronto)</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Vídeo (.mp4){status === "em_breve" && " — opcional enquanto estiver em breve"}
        </label>
        <VideoUploadField
          name="video_url"
          valorInicial={inicial?.video_url ?? undefined}
          onChange={setVideoUrl}
        />
      </div>

      <div>
        <label className={labelClass}>
          Capa (thumb) — imagem usada no card. Se não enviar, usa o primeiro
          frame do vídeo (quando liberado) ou um cadeado (quando em breve)
        </label>
        <ThumbUploadField
          name="thumb_url"
          valorInicial={inicial?.thumb_url ?? undefined}
        />
      </div>

      <div>
        <label className={labelClass}>
          Resumo curto (usado na mensagem do WhatsApp)
        </label>
        <textarea
          name="resumo"
          rows={2}
          defaultValue={inicial?.resumo ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Descrição completa</label>
        <textarea
          name="descricao"
          rows={4}
          defaultValue={inicial?.descricao ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Categoria (dor principal)</label>
        <select
          name="categoria_id"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className={inputClass}
        >
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
          <option value="__nova__">+ Criar nova categoria...</option>
        </select>
      </div>

      {categoriaId === "__nova__" && (
        <div>
          <label className={labelClass}>Nome da nova categoria</label>
          <input
            name="nova_categoria_nome"
            required
            className={inputClass}
            placeholder="Ex: Ansiedade social"
          />
        </div>
      )}

      <div>
        <label className={labelClass}>Dores abordadas (separadas por vírgula)</label>
        <input
          name="dores"
          defaultValue={inicial?.dores.join(", ") ?? ""}
          className={inputClass}
          placeholder="Medo de se abrir, Dificuldade em confiar, ..."
        />
      </div>

      <div>
        <label className={labelClass}>Ordem de exibição (menor aparece primeiro)</label>
        <input
          name="ordem"
          type="number"
          defaultValue={inicial?.ordem ?? 0}
          className={inputClass}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="destaque"
            defaultChecked={inicial?.destaque}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
          />
          Metáfora em destaque
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="publicado"
            defaultChecked={inicial?.publicado ?? true}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-teal-500"
          />
          Publicado (visível na área de membros)
        </label>
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        className="mt-2 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
      >
        Salvar
      </button>
    </form>
  );
}
