import Link from "next/link";
import { exigirAdmin } from "@/lib/admin";
import CriarMembroForm from "@/app/admin/(protected)/membros/CriarMembroForm";
import RevogarButton from "@/app/admin/(protected)/membros/RevogarButton";
import LicencaToggle from "@/app/admin/(protected)/membros/LicencaToggle";
import ReenviarButton from "@/app/admin/(protected)/membros/ReenviarButton";
import {
  alternarLicencaRedes,
  enviarAcessoPorEmail,
  reenviarAcesso,
  revogarAcesso,
} from "@/app/admin/(protected)/membros/actions";

const POR_PAGINA = 50;

export default async function MembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string }>;
}) {
  const { supabase } = await exigirAdmin();
  const { q, p } = await searchParams;

  const busca = (q ?? "").trim();
  const pagina = Math.max(1, Number(p) || 1);
  const inicio = (pagina - 1) * POR_PAGINA;

  let consulta = supabase
    .from("members")
    .select("id, email, acesso_pago, licenca_redes, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(inicio, inicio + POR_PAGINA - 1);

  if (busca) consulta = consulta.ilike("email", `%${busca}%`);

  const [{ data: membros, count }, { count: totalGeral }, { count: totalAtivos }] =
    await Promise.all([
      consulta,
      supabase.from("members").select("id", { count: "exact", head: true }),
      supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("acesso_pago", true),
    ]);

  const encontrados = count ?? 0;
  const ultimaPagina = Math.max(1, Math.ceil(encontrados / POR_PAGINA));
  const linkPagina = (n: number) =>
    `/admin/membros?${new URLSearchParams({
      ...(busca ? { q: busca } : {}),
      ...(n > 1 ? { p: String(n) } : {}),
    })}`;

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-teal-400 focus:outline-none";

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-zinc-50">Membros</h1>
      <p className="mb-6 text-sm text-zinc-400">
        {totalGeral ?? 0} no total, {totalAtivos ?? 0} com acesso ativo. Envie
        acesso para quem você quiser, reenvie para quem perdeu a senha e revogue
        quando precisar.
      </p>

      <CriarMembroForm action={enviarAcessoPorEmail} />

      <form
        method="get"
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          name="q"
          type="search"
          defaultValue={busca}
          placeholder="Buscar por e-mail"
          className={`${inputClass} sm:max-w-sm`}
        />
        <button
          type="submit"
          className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-200 hover:border-teal-400 hover:text-teal-300"
        >
          Buscar
        </button>
        {busca && (
          <Link
            href="/admin/membros"
            className="text-sm text-zinc-400 hover:text-zinc-100"
          >
            Limpar
          </Link>
        )}
      </form>

      {busca && (
        <p className="mt-3 text-sm text-zinc-400">
          {encontrados === 0
            ? `Ninguém com "${busca}" no e-mail.`
            : `${encontrados} ${encontrados === 1 ? "resultado" : "resultados"} para "${busca}".`}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Acesso</th>
              <th className="px-4 py-3">Licença redes</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(membros ?? []).map((membro) => (
              <tr key={membro.id} className="text-zinc-200">
                <td className="px-4 py-3">{membro.email}</td>
                <td className="px-4 py-3">
                  {membro.acesso_pago ? (
                    <span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-xs font-medium text-teal-300">
                      Ativo
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs font-medium text-zinc-400">
                      Revogado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <LicencaToggle
                    id={membro.id}
                    ativa={membro.licenca_redes ?? false}
                    alternarLicencaRedes={alternarLicencaRedes}
                  />
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(membro.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4 whitespace-nowrap">
                    <ReenviarButton
                      email={membro.email}
                      reenviarAcesso={reenviarAcesso}
                    />
                    {membro.acesso_pago && (
                      <RevogarButton id={membro.id} revogarAcesso={revogarAcesso} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(membros ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  {busca
                    ? "Nenhum membro com esse e-mail."
                    : "Nenhum comprador cadastrado ainda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ultimaPagina > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Página {pagina} de {ultimaPagina}
          </span>
          <div className="flex items-center gap-2">
            {pagina > 1 && (
              <Link
                href={linkPagina(pagina - 1)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-teal-400 hover:text-teal-300"
              >
                Anterior
              </Link>
            )}
            {pagina < ultimaPagina && (
              <Link
                href={linkPagina(pagina + 1)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-teal-400 hover:text-teal-300"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
