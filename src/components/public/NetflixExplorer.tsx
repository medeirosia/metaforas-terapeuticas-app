"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import CategoriaRow from "@/components/public/CategoriaRow";
import PosterCard from "@/components/public/PosterCard";
import VideoModal from "@/components/public/VideoModal";
import type { CategoriaComMetaforas, Metafora } from "@/lib/metaforas";

const CHAVE_LOCALSTORAGE = "metaforas-continuar-assistindo";
const EVENTO_ATUALIZACAO = "metaforas-progresso-atualizado";

type ProgressoSalvo = Record<string, { progresso: number; atualizadoEm: number }>;

function subscribeProgressos(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO_ATUALIZACAO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO_ATUALIZACAO, callback);
  };
}

function getSnapshotProgressos() {
  return window.localStorage.getItem(CHAVE_LOCALSTORAGE) ?? "{}";
}

function getServerSnapshotProgressos() {
  return "{}";
}

export default function NetflixExplorer({
  categorias,
  isDemo,
}: {
  categorias: CategoriaComMetaforas[];
  isDemo: boolean;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState<Metafora | null>(null);

  const progressosRaw = useSyncExternalStore(
    subscribeProgressos,
    getSnapshotProgressos,
    getServerSnapshotProgressos
  );
  const progressos: ProgressoSalvo = useMemo(() => {
    try {
      return JSON.parse(progressosRaw);
    } catch {
      return {};
    }
  }, [progressosRaw]);

  const todas = useMemo(
    () =>
      categorias.flatMap((categoria) =>
        categoria.metaforas.map((metafora) => ({
          metafora,
          categoriaNome: categoria.nome,
        }))
      ),
    [categorias]
  );

  const categoriaPorMetaforaId = useMemo(() => {
    const mapa = new Map<string, string>();
    todas.forEach(({ metafora, categoriaNome }) =>
      mapa.set(metafora.id, categoriaNome)
    );
    return mapa;
  }, [todas]);

  const destaques = useMemo(
    () => todas.filter((item) => item.metafora.destaque).map((i) => i.metafora),
    [todas]
  );

  const continuarAssistindo = useMemo(() => {
    const entradas = Object.entries(progressos)
      .filter(([, v]) => v.progresso >= 3 && v.progresso < 95)
      .sort((a, b) => b[1].atualizadoEm - a[1].atualizadoEm);

    return entradas
      .map(([slug]) => todas.find((t) => t.metafora.slug === slug)?.metafora)
      .filter((m): m is Metafora => Boolean(m));
  }, [progressos, todas]);

  const progressoPorSlug = useMemo(() => {
    const mapa: Record<string, number> = {};
    Object.entries(progressos).forEach(([slug, v]) => {
      mapa[slug] = v.progresso;
    });
    return mapa;
  }, [progressos]);

  const resultadosBusca = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return null;
    return todas
      .filter(({ metafora, categoriaNome }) => {
        const alvo = [
          metafora.titulo,
          metafora.resumo ?? "",
          categoriaNome,
          ...metafora.dores,
        ]
          .join(" ")
          .toLowerCase();
        return alvo.includes(termo);
      })
      .map((item) => item.metafora);
  }, [busca, todas]);

  function salvarProgresso(slug: string, progresso: number) {
    try {
      const atual: ProgressoSalvo = JSON.parse(getSnapshotProgressos());
      const proximo = {
        ...atual,
        [slug]: { progresso, atualizadoEm: Date.now() },
      };
      window.localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(proximo));
      window.dispatchEvent(new Event(EVENTO_ATUALIZACAO));
    } catch {
      // localStorage indisponível — segue sem persistir
    }
  }

  function handleSelect(metafora: Metafora) {
    if (isDemo) {
      router.push("/pagamento");
      return;
    }
    if (metafora.status === "em_breve") return;
    setSelecionada(metafora);
  }

  return (
    <div>
      <div className="sticky top-0 z-20 px-4 py-4 sm:px-6">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título ou dor..."
          className="glass-card w-full max-w-xs rounded-full px-4 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-gold/60 focus:outline-none"
        />
      </div>

      <main className="pb-10">
        {resultadosBusca ? (
          <div className="animate-reveal px-4 sm:px-6">
            <h2 className="mb-3 text-sm text-zinc-400">
              {resultadosBusca.length} resultado
              {resultadosBusca.length === 1 ? "" : "s"} para &ldquo;{busca}
              &rdquo;
            </h2>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {resultadosBusca.map((metafora) => (
                <PosterCard
                  key={metafora.id}
                  metafora={metafora}
                  onSelect={handleSelect}
                  progresso={progressoPorSlug[metafora.slug]}
                  preencherLargura
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-reveal flex flex-col gap-8">
            {destaques.length > 0 && (
              <CategoriaRow
                titulo="Metáfora em destaque"
                metaforas={destaques}
                onSelect={handleSelect}
                progressos={progressoPorSlug}
                destaque
              />
            )}

            {continuarAssistindo.length > 0 && (
              <CategoriaRow
                titulo="Continuar assistindo"
                metaforas={continuarAssistindo}
                onSelect={handleSelect}
                progressos={progressoPorSlug}
              />
            )}

            {categorias.map((categoria) => (
              <CategoriaRow
                key={categoria.id}
                titulo={categoria.nome}
                metaforas={categoria.metaforas}
                onSelect={handleSelect}
                progressos={progressoPorSlug}
              />
            ))}
          </div>
        )}
      </main>

      {selecionada && (
        <VideoModal
          metafora={selecionada}
          categoriaNome={categoriaPorMetaforaId.get(selecionada.id) ?? ""}
          onClose={() => setSelecionada(null)}
          onProgresso={salvarProgresso}
        />
      )}
    </div>
  );
}
