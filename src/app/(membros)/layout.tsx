import type { ReactNode } from "react";
import Script from "next/script";
import Sidebar from "@/app/(membros)/Sidebar";
import SocialProofNotifications from "@/components/public/SocialProofNotifications";
import { getAccessState } from "@/lib/access";

const META_PIXEL_IDS = [
  "828987493447968",
  "1399844474267640",
  "5368686996568838",
  "634220728389118",
];

export default async function MembrosLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isDemo, userEmail } = await getAccessState();

  return (
    <div className="bg-dots flex min-h-screen flex-col font-sans font-light text-zinc-100 lg:flex-row">
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          ${META_PIXEL_IDS.map((id) => `fbq('init', '${id}');`).join("\n")}
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {META_PIXEL_IDS.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        ))}
      </noscript>
      <Sidebar isDemo={isDemo} userEmail={userEmail} />
      <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      {isDemo && <SocialProofNotifications />}
    </div>
  );
}
