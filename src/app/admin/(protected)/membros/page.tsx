import { createClient } from "@/lib/supabase/server";
import { criarAcessoComprador, revogarAcesso } from "@/app/admin/(protected)/membros/actions";
import CriarMembroForm from "@/app/admin/(protected)/membros/CriarMembroForm";
import RevogarButton from "@/app/admin/(protected)/membros/RevogarButton";

export default async function MembrosPage() {
  const supabase = await createClient();
  const { data: membros } = await supabase
    .from("members")
    .select("id, email, acesso_pago, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-zinc-50">
        Membros com acesso pago
      </h1>
      <p className="mb-6 text-sm text-zinc-400">
        Crie o acesso do comprador aqui após confirmar o pagamento, e envie o
        e-mail e a senha manualmente para ele.
      </p>

      <CriarMembroForm action={criarAcessoComprador} />

      <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Status</th>
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
                    <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-300">
                      Acesso ativo
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs font-medium text-zinc-400">
                      Revogado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(membro.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right">
                  {membro.acesso_pago && (
                    <RevogarButton id={membro.id} revogarAcesso={revogarAcesso} />
                  )}
                </td>
              </tr>
            ))}
            {(membros ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Nenhum membro cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
