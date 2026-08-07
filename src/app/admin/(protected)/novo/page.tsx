import { createClient } from "@/lib/supabase/server";
import { criarMetafora } from "@/app/admin/(protected)/actions";
import MetaforaForm from "@/app/admin/(protected)/MetaforaForm";

export default async function NovaMetaforaPage() {
  const supabase = await createClient();
  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nome")
    .order("ordem", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-zinc-50">Nova metáfora</h1>
      <MetaforaForm categorias={categorias ?? []} action={criarMetafora} />
    </div>
  );
}
