"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutMembro } from "@/app/(membros)/actions";

const ITENS = [
  { href: "/", label: "Início" },
  { href: "/metaforas", label: "Metáforas" },
  { href: "/gerador", label: "Gerador de Metáforas" },
  { href: "/pagamento", label: "Pagamento" },
];

export default function Sidebar({
  isDemo,
  userEmail,
}: {
  isDemo: boolean;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const itens = isDemo ? ITENS : ITENS.filter((item) => item.href !== "/pagamento");

  return (
    <aside className="glass-card flex w-full flex-col gap-4 border-x-0 border-t-0 p-4 lg:h-screen lg:w-64 lg:sticky lg:top-0 lg:gap-6 lg:border-y-0 lg:border-l-0 lg:p-6">
      <Image
        src="/logo-metaforas.png"
        alt="Metáforas Terapêuticas em Vídeo"
        width={1078}
        height={305}
        priority
        className="h-8 w-auto self-start lg:h-9"
      />

      <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
        {itens.map((item) => {
          const ativo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                ativo
                  ? "bg-gold text-black"
                  : "text-zinc-300 hover:bg-white/5 hover:text-gold-light"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-row items-center gap-2 border-t border-white/10 pt-3 lg:flex-col lg:items-stretch lg:pt-4">
        {userEmail ? (
          <>
            <p className="hidden truncate text-xs text-zinc-500 lg:block">
              {userEmail}
            </p>
            <form action={signOutMembro} className="ml-auto lg:ml-0">
              <button
                type="submit"
                className="w-full rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gold/50 hover:text-gold-light"
              >
                Sair
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="ml-auto rounded-full bg-gold px-3.5 py-2 text-center text-xs font-semibold text-black transition-opacity hover:opacity-90 lg:ml-0 lg:w-full"
          >
            Já sou aluno — Entrar
          </Link>
        )}
      </div>
    </aside>
  );
}
