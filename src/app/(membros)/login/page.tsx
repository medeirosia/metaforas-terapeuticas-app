"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginMembroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  // Recuperacao de senha: sem isso, quem perde o e-mail de acesso fica
  // trancado para sempre e vira chamado manual.
  const [recuperando, setRecuperando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function recuperarSenha() {
    setErro(null);
    setAviso(null);
    if (!email) {
      setErro("Escreva seu e-mail no campo acima e clique de novo.");
      return;
    }
    setRecuperando(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setRecuperando(false);
    if (error) {
      setErro("Não consegui enviar agora. Tente de novo em alguns minutos.");
      return;
    }
    setAviso(
      "Pronto. Se existir conta com esse e-mail, o link para criar uma senha nova acabou de sair. Olhe também no spam."
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/metaforas");
    router.refresh();
  }

  return (
    <div className="animate-reveal flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-sm rounded-[32px] p-8"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          Área de membros
        </span>
        <h1 className="mb-6 mt-1 font-serif text-2xl italic text-zinc-50">
          Entrar na minha conta
        </h1>

        <label className="mb-1 block text-xs font-medium text-zinc-400">
          E-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass-card mb-4 w-full rounded-xl px-3 py-2 text-sm text-zinc-100 focus:border-gold/60 focus:outline-none"
        />

        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Senha
        </label>
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="glass-card mb-6 w-full rounded-xl px-3 py-2 text-sm text-zinc-100 focus:border-gold/60 focus:outline-none"
        />

        {erro && <p className="mb-4 text-sm text-red-400">{erro}</p>}
        {aviso && <p className="mb-4 text-sm text-emerald-300">{aviso}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={recuperarSenha}
          disabled={recuperando}
          className="mt-4 w-full text-center text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-gold-light hover:underline disabled:opacity-60"
        >
          {recuperando ? "Enviando..." : "Esqueci minha senha"}
        </button>
      </form>
    </div>
  );
}
