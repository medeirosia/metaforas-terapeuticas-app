import Sidebar from "@/app/(membros)/Sidebar";
import { getAccessState } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function MembrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDemo, userEmail } = await getAccessState();

  return (
    <div className="bg-dots flex min-h-screen flex-col font-sans font-light text-zinc-100 lg:flex-row">
      <Sidebar isDemo={isDemo} userEmail={userEmail} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
