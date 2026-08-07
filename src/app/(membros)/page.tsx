import Link from "next/link";
import { getAccessState } from "@/lib/access";
import { VSL_URL } from "@/lib/funil";

export default async function InicioPage() {
  const { isDemo, userEmail } = await getAccessState();

  if (!isDemo) {
    return (
      <div className="animate-reveal flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          Bem-vindo(a) de volta
        </span>
        <h1 className="max-w-xl font-serif text-3xl italic text-zinc-50 sm:text-4xl">
          {userEmail ? userEmail.split("@")[0] : "Você"}, sua biblioteca de
          metáforas está pronta.
        </h1>
        <Link
          href="/metaforas"
          className="rounded-full bg-gold px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Ver metáforas
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-reveal flex flex-col items-center gap-8 px-4 py-10 text-center sm:px-6">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          Metáforas Terapêuticas em Vídeo
        </span>
        <h1 className="mt-3 font-serif text-3xl italic text-zinc-50 sm:text-4xl">
          Assista e veja como transformar sua próxima sessão
        </h1>
        <p className="mt-4 text-sm text-zinc-400 sm:text-base">
          Uma biblioteca de metáforas em vídeo prontas para usar com seus
          clientes — e para compartilhar com quem precisa ouvir isso agora.
        </p>
      </div>

      <div className="gold-glow glass-card aspect-video w-full max-w-3xl overflow-hidden rounded-[32px]">
        {VSL_URL ? (
          <video
            src={VSL_URL}
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-500">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-black">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M8 5.14v13.72c0 .78.85 1.27 1.54.87l11.14-6.86a1 1 0 000-1.72L9.54 4.27A1 1 0 008 5.14z" />
              </svg>
            </span>
            <p className="font-serif italic">O vídeo de apresentação entra aqui</p>
          </div>
        )}
      </div>

      <Link
        href="/pagamento"
        className="rounded-full bg-gold px-10 py-4 text-base font-semibold text-black shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105"
      >
        Quero acesso completo
      </Link>
    </div>
  );
}
