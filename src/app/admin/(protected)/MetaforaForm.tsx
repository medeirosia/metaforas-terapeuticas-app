"use client";

import { useState } from "react";
import VideoUploadField from "@/app/admin/(protected)/VideoUploadField";
import ThumbUploadField from "@/app/admin/(protected)/ThumbUploadField";

type Categoria = { id: string; nome: string };
type Inicial = {
  titulo?: string;
  status?: "liberado" | "em_breve";
  video_url?: string | null;
  thumb_url?: string | null;
  resumo?: string | null;
  descricao?: string | null;
  categoria_id?: string;
  dores?: string[];
  ficha_dor?: string | null;
  ficha_usar?: string | null;
  ficha_nao_usar?: string | null;
  ficha_preparo?: string | null;
  ficha_perguntas?: string[];
  ficha_ponte?: string | null;
  destaque?: boolean;
  publicado?: boolean;
  ordem?: number;
};

export default function MetaforaForm({
  categorias,
  inicial,
  action,
}: {
  categorias: Categoria[];
  inicial?: Inicial;
  action: (formData: FormData) => Promise<void>;
}) {
  const [categoriaId, setCategoriaId] = useState(
    inicial?.categoria_id ?? categorias[0]?.id ?? ""
  );
  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-teal-400 focus:outline-none";

  return (
    <form action={action} className="max-w-3xl space-y-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">Título</label>
        <input name="titulo" required defaultValue={inicial?.titulo ?? ""} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Categoria</label>
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
            <option value="__nova__">+ Criar nova categoria</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Nova categoria</label>
          <input
            name="nova_categoria_nome"
            disabled={categoriaId !== "__nova__"}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Status</label>
          <select name="status" defaultValue={inicial?.status ?? "em_breve"} className={inputClass}>
            <option value="liberado">Liberado</option>
            <option value="em_breve">Em breve</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Ordem</label>
          <input name="ordem" type="number" defaultValue={inicial?.ordem ?? 0} className={inputClass} />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input name="destaque" type="checkbox" defaultChecked={inicial?.destaque} />
            Destaque
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input name="publicado" type="checkbox" defaultChecked={inicial?.publicado ?? true} />
            Publicado
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">Vídeo</label>
        <VideoUploadField name="video_url" valorInicial={inicial?.video_url ?? undefined} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">Capa</label>
        <ThumbUploadField name="thumb_url" valorInicial={inicial?.thumb_url ?? undefined} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">Resumo</label>
        <textarea name="resumo" rows={3} defaultValue={inicial?.resumo ?? ""} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">Descrição</label>
        <textarea name="descricao" rows={5} defaultValue={inicial?.descricao ?? ""} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">Dores (separadas por vírgula)</label>
        <input name="dores" defaultValue={(inicial?.dores ?? []).join(", ")} className={inputClass} />
      </div>

      <fieldset className="rounded-xl border border-zinc-700 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-teal-400">
          Ficha de uso clínico
        </legend>
        <p className="mb-4 text-xs text-zinc-500">
          Deixe em branco o que não se aplica. O bloco só aparece no site quando
          houver conteúdo.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Dor</label>
            <input name="ficha_dor" defaultValue={inicial?.ficha_dor ?? ""} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Use quando</label>
            <textarea name="ficha_usar" rows={2} defaultValue={inicial?.ficha_usar ?? ""} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Não use quando</label>
            <textarea name="ficha_nao_usar" rows={2} defaultValue={inicial?.ficha_nao_usar ?? ""} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Frase de preparo</label>
            <textarea name="ficha_preparo" rows={2} defaultValue={inicial?.ficha_preparo ?? ""} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Perguntas principais (uma por linha)
            </label>
            <textarea
              name="ficha_perguntas"
              rows={5}
              defaultValue={(inicial?.ficha_perguntas ?? []).join("\n")}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Ponte</label>
            <textarea name="ficha_ponte" rows={2} defaultValue={inicial?.ficha_ponte ?? ""} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <button type="submit" className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500">
        Salvar
      </button>
    </form>
  );
}
