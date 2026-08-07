import type { ReactNode } from "react";
import Sidebar from "@/app/(membros)/Sidebar";
import SocialProofNotifications from "@/components/public/SocialProofNotifications";
import { getAccessState } from "@/lib/access";

export default async function MembrosLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isDemo, userEmail } = await getAccessState();

  return (
    <div className="bg-dots flex min-h-screen flex-col font-sans font-light text-zinc-100 lg:flex-row">
      <Sidebar isDemo={isDemo} userEmail={userEmail} />
      <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      {isDemo && <SocialProofNotifications />}
    </div>
  );
}
