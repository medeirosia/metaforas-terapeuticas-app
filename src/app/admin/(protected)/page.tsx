import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { excluirMetafora } from "@/app/admin/(protected)/actions";
import DeleteButton from "@/app/admin/(protected)/DeleteButton";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nome")
    .order("ordem", { ascending: true });

  const { data: metaforas } = await supabase
    .from("metaforas")
    .select(
      "id, titulo, categoria_id, status, destaque, publicado, ordem, created_at"
    )
    .order("ordem", { ascending: true });

  const nomeCategoria = new Map(
    (categorias ?? []).map((c) => [c.id, c.nome])
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-50">Vídeos</h1>
          <p className="text-sm text-zinc-400">
            {metaforas?.length ?? 0} metáfora
            {metaforas?.length === 1 ? "" : "s"} cadastrada
            {metaforas?.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/novo"
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
        >
          + Nova metáfora
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Disponibilidade</th>
              <th className="px-4 py-3">Publicação</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(metaforas ?? []).map((metafora) => (
              <tr key={metafora.id} className="text-zinc-200">
                <td className="px-4 py-3 font-medium">
                  {metafora.titulo}
                  {metafora.destaque && (
                    <span className="ml-2 rounded-full bg-teal-400/10 px-2 py-0.5 text-xs font-medium text-teal-300">
                      Destaque
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {nomeCategoria.get(metafora.categoria_id) ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {metafora.status === "liberado" ? (
                    <span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-xs font-medium text-teal-300">
                      Liberado
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">
                      Em breve
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {metafora.publicado ? (
                    <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-300">
                      Publicado
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs font-medium text-zinc-400">
                      Rascunho
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/${metafora.id}/editar`}
                      className="text-teal-400 hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteButton
                      metaforaId={metafora.id}
                      excluirMetafora={excluirMetafora}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(metaforas ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Nenhuma metáfora cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
