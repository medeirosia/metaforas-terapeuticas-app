import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { atualizarMetafora } from "@/app/admin/(protected)/actions";
import MetaforaForm from "@/app/admin/(protected)/MetaforaForm";

export default async function EditarMetaforaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categorias }, { data: metafora }] = await Promise.all([
    supabase.from("categorias").select("id, nome").order("ordem", { ascending: true }),
    supabase
      .from("metaforas")
      .select(
        "titulo, status, video_url, thumb_url, resumo, descricao, categoria_id, dores, destaque, publicado, ordem"
      )
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!metafora) notFound();

  const atualizarComId = atualizarMetafora.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-zinc-50">Editar metáfora</h1>
      <MetaforaForm
        categorias={categorias ?? []}
        inicial={metafora}
        action={atualizarComId}
      />
    </div>
  );
}
