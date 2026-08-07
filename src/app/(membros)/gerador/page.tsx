import GeradorForm from "@/app/(membros)/gerador/GeradorForm";
import { getAccessState } from "@/lib/access";

export default async function GeradorPage() {
  const { isDemo } = await getAccessState();

  return (
    <div className="animate-reveal px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          Assistente de Metáforas
        </span>
        <h1 className="mt-2 font-serif text-3xl italic text-zinc-50 sm:text-4xl">
          Gerador de Metáforas Personalizadas
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Crie uma metáfora personalizada sob medida para a dor exata do seu
          cliente em segundos.
        </p>
      </div>
      <GeradorForm isDemo={isDemo} />
    </div>
  );
}
