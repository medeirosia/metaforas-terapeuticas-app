import { createClient } from "@/lib/supabase/server";
import type { CategoriaComMetaforas } from "@/lib/metaforas";

export async function getCategoriasComMetaforas(): Promise<
  CategoriaComMetaforas[]
> {
  const supabase = await createClient();

  const { data: categorias, error: erroCategorias } = await supabase
    .from("categorias")
    .select("id, nome, ordem")
    .order("ordem", { ascending: true });

  if (erroCategorias) throw erroCategorias;

  const { data: metaforas, error: erroMetaforas } = await supabase
    .from("metaforas")
    .select(
      "id, titulo, slug, video_url, thumb_url, resumo, descricao, categoria_id, dores, status, destaque, publicado, ordem, created_at"
    )
    .eq("publicado", true)
    .order("ordem", { ascending: true });

  if (erroMetaforas) throw erroMetaforas;

  return (categorias ?? [])
    .map((categoria) => ({
      ...categoria,
      metaforas: (metaforas ?? []).filter(
        (m) => m.categoria_id === categoria.id
      ),
    }))
    .filter((categoria) => categoria.metaforas.length > 0);
}
