import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/(protected)/actions";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-6 py-4 backdrop-blur">
        <nav className="flex items-center gap-5">
          <Link href="/admin" className="text-sm font-semibold text-zinc-50">
            Metáforas
          </Link>
          <Link href="/admin/membros" className="text-sm text-zinc-400 hover:text-zinc-100">
            Membros
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-zinc-300 hover:text-teal-300">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
