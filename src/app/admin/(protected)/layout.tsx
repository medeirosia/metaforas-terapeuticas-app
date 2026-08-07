import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/(protected)/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-semibold text-zinc-50">
            Painel — Metáforas Terapêuticas
          </Link>
          <Link
            href="/admin/membros"
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Membros
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
