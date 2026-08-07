import GeradorForm from "@/app/(membros)/gerador/GeradorForm";
import { getAccessState } from "@/lib/access";

export default async function GeradorPage() {
  const { isDemo } = await getAccessState();

  return (
    <div className="animate-reveal px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          Gerador de Metáforas
        </span>
        <h1 className="mt-2 font-serif text-3xl italic text-zinc-50">
          Crie uma metáfora sob medida
        </h1>
      </div>
      <GeradorForm isDemo={isDemo} />
    </div>
  );
}
