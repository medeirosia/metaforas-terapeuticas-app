"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutMembro } from "@/app/(membros)/actions";

const ITENS = [
  { href: "/", label: "Início", icon: HomeIcon },
  { href: "/metaforas", label: "Metáforas", icon: PlayIcon },
  { href: "/gerador", label: "Gerador", icon: WandIcon },
];

export default function Sidebar({
  userEmail,
}: {
  isDemo: boolean;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const itens = ITENS;
  const itemAtual = itens.find((item) => item.href === pathname);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-20 items-center justify-center gap-3 border-b border-white/10 bg-[#0b0b10]/95 px-4 backdrop-blur-xl lg:hidden">
        <Image
          src="/logo-metaforas.png"
          alt="Metáforas Terapêuticas em Vídeo"
          width={1078}
          height={305}
          priority
          className="h-8 w-auto shrink-0"
        />

        <span className="min-w-0 truncate text-lg font-semibold text-zinc-100">
          {itemAtual?.label ?? "Metáforas"}
        </span>
      </header>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid gap-1 rounded-[24px] border border-white/10 bg-[#0b0b10]/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden"
        style={{ gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))` }}
      >
        <NavLinks itens={itens} pathname={pathname} variant="mobile" />
      </nav>

      <aside className="glass-card hidden w-full flex-col gap-4 border-x-0 border-t-0 p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:gap-6 lg:border-y-0 lg:border-l-0 lg:p-6">
        <Image
          src="/logo-metaforas.png"
          alt="Metáforas Terapêuticas em Vídeo"
          width={1078}
          height={305}
          priority
          className="h-8 w-auto self-start lg:h-9"
        />

        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
          <NavLinks itens={itens} pathname={pathname} variant="desktop" />
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
    </>
  );
}

function NavLinks({
  itens,
  pathname,
  variant,
}: {
  itens: typeof ITENS;
  pathname: string;
  variant: "desktop" | "mobile";
}) {
  return (
    <>
      {itens.map((item) => {
        const ativo = pathname === item.href;
        const Icon = item.icon;

        if (variant === "mobile") {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition-colors ${
                ativo
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              ativo
                ? "bg-gold text-black"
                : "text-zinc-300 hover:bg-white/5 hover:text-gold-light"
            }`}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M3.5 11.2 12 4l8.5 7.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10.5V20h13v-9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 20v-5.5h5V20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="m5 19 9.5-9.5" strokeLinecap="round" />
      <path d="m13 5 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM18 3l.7 1.3L20 5l-1.3.7L18 7l-.7-1.3L16 5l1.3-.7L18 3z" strokeLinejoin="round" />
    </svg>
  );
}
