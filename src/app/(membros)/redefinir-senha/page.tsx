"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Destino do link que sai no e-mail de "esqueci minha senha". O Supabase
// entrega a sessão de recuperação pelo fragmento da URL, e o client-side do
// @supabase/ssr troca isso por sessão sozinho — por isso a página só espera o
// evento antes de deixar salvar.
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY" || evento === "SIGNED_IN") setPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirma) {
      setErro("As duas senhas não são iguais.");
      return;
    }
    setSalvando(true);
    const { error } = await createClient().auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      setErro("Não consegui salvar. Peça um link novo na tela de login.");
      return;
    }
    router.push("/metaforas");
    router.refresh();
  }

  const inputClass =
    "glass-card mb-4 w-full rounded-xl px-3 py-2 text-sm text-zinc-100 focus:border-gold/60 focus:outline-none";

  return (
    <div className="animate-reveal flex min-h-[80vh] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-sm rounded-[32px] p-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          Área de membros
        </span>
        <h1 className="mb-6 mt-1 font-serif text-2xl italic text-zinc-50">
          Criar uma senha nova
        </h1>

        {!pronto ? (
          <p className="text-sm leading-relaxed text-zinc-400">
            Abra esta página pelo link que chegou no seu e-mail. Se você já
            abriu e continua vendo esta mensagem, o link expirou — peça outro
            em &ldquo;Esqueci minha senha&rdquo; na tela de login.
          </p>
        ) : (
          <>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Nova senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputClass}
            />

            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Repita a senha
            </label>
            <input
              type="password"
              required
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              className={inputClass}
            />

            {erro && <p className="mb-4 text-sm text-red-400">{erro}</p>}

            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar e entrar"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
