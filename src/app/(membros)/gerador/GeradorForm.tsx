"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const TOTAL_ETAPAS = 3;
const ABORDAGENS = ["TCC", "Psicanálise", "Gestalt", "Sistêmica", "ACT"];
const MENSAGENS_IA = [
  "Analisando padrão emocional...",
  "Construindo metáfora analógica...",
  "Formatando mensagem para WhatsApp...",
];

export default function GeradorForm({ isDemo }: { isDemo: boolean }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [dor, setDor] = useState("");
  const [abordagem, setAbordagem] = useState("TCC");
  const [gerando, setGerando] = useState(false);
  const [mensagemAtual, setMensagemAtual] = useState(0);
  const [resultadoPronto, setResultadoPronto] = useState(false);

  useEffect(() => {
    if (!gerando || resultadoPronto) return;

    const interval = window.setInterval(() => {
      setMensagemAtual((atual) => Math.min(MENSAGENS_IA.length - 1, atual + 1));
    }, 1500);

    const timeout = window.setTimeout(() => {
      setResultadoPronto(true);
      setGerando(false);
    }, 4600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [gerando, resultadoPronto]);

  const progresso = useMemo(() => {
    if (resultadoPronto) return 100;
    if (!gerando) return 0;
    return ((mensagemAtual + 1) / MENSAGENS_IA.length) * 100;
  }, [gerando, mensagemAtual, resultadoPronto]);

  function proximaEtapa() {
    setEtapa((e) => Math.min(TOTAL_ETAPAS, e + 1));
  }

  function etapaAnterior() {
    setEtapa((e) => Math.max(1, e - 1));
  }

  function gerar() {
    setResultadoPronto(false);
    setMensagemAtual(0);
    setGerando(true);
  }

  const inputClass =
    "glass-card w-full rounded-2xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none";

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="glass-card rounded-[28px] p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          {Array.from({ length: TOTAL_ETAPAS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < etapa ? "bg-emerald-400" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {etapa === 1 && (
          <div className="animate-reveal flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Etapa 1 de 3
            </p>
            <h2 className="font-serif text-2xl italic text-zinc-50">
              Qual dor ou situação você quer trabalhar?
            </h2>
            <textarea
              value={dor}
              onChange={(e) => setDor(e.target.value)}
              rows={5}
              placeholder="Ex: cliente que entende racionalmente, mas trava quando precisa se abrir..."
              className={inputClass}
            />
          </div>
        )}

        {etapa === 2 && (
          <div className="animate-reveal flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Etapa 2 de 3
            </p>
            <h2 className="font-serif text-2xl italic text-zinc-50">
              Escolha a abordagem clínica
            </h2>
            <div className="flex flex-wrap gap-2">
              {ABORDAGENS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAbordagem(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    abordagem === item
                      ? "border-emerald-300 bg-emerald-400 text-black"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-emerald-400/50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {etapa === 3 && (
          <div className="animate-reveal flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Etapa 3 de 3
            </p>
            <h2 className="font-serif text-2xl italic text-zinc-50">
              Gere a mensagem pronta
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              O assistente vai montar uma metáfora breve para acompanhamento
              entre sessões, já no formato de mensagem de WhatsApp.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <button
            type="button"
            onClick={etapaAnterior}
            disabled={etapa === 1 || gerando}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-emerald-400/50 hover:text-emerald-300 disabled:opacity-0"
          >
            Voltar
          </button>

          {etapa < TOTAL_ETAPAS ? (
            <button
              type="button"
              onClick={proximaEtapa}
              disabled={etapa === 1 && dor.trim().length < 3}
              className="rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-black text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={gerar}
              disabled={gerando}
              className="rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-black text-black shadow-[0_0_28px_rgba(52,211,153,0.35)] transition-transform hover:scale-[1.03] disabled:opacity-70"
            >
              Gerar Metáfora
            </button>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[#06130d] p-5 shadow-[0_0_70px_rgba(16,185,129,0.1)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.22),transparent_35%)]" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Preview do resultado
          </p>

          {gerando && (
            <div className="mt-8 rounded-3xl border border-emerald-400/25 bg-black/35 p-5">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-emerald-200">
                {MENSAGENS_IA[mensagemAtual]}
              </p>
            </div>
          )}

          {!gerando && !resultadoPronto && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 p-6 text-center text-sm leading-relaxed text-zinc-400">
              Preencha as etapas para ver uma mensagem clínica pronta em formato
              de WhatsApp.
            </div>
          )}

          {resultadoPronto && (
            <div className="mt-6">
              <div className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[#0b2b1c] p-5 text-sm leading-relaxed text-emerald-50">
                <p>🌿 Às vezes, a mente constrói uma porta pesada onde antes havia apenas uma passagem.</p>
                <p className="mt-3">
                  E talvez hoje o trabalho não seja arrombar essa porta, mas perceber...
                </p>
                <div className={`${isDemo ? "blur-sm select-none" : ""}`}>
                  <p className="mt-3">
                    ...que você pode aproximar a mão da maçaneta aos poucos, no
                    seu tempo, testando segurança a cada respiração.
                  </p>
                  <p className="mt-3">
                    Durante a semana, observe qual pequena abertura já seria um
                    gesto de coragem possível para você.
                  </p>
                </div>
                {isDemo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#06130d]/45 p-4 backdrop-blur-[1px]">
                    <div className="rounded-3xl border border-emerald-300/30 bg-black/75 p-5 text-center shadow-2xl">
                      <p className="text-lg font-black text-zinc-50">
                        ✨ Sua Mensagem Pronta para WhatsApp Foi Gerada!
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                        Para visualizar o texto completo, copiar com 1 clique e
                        usar o Gerador sem limites:
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push("/#oferta")}
                        className="mt-4 rounded-full bg-emerald-400 px-5 py-3 text-xs font-black uppercase text-black"
                      >
                        Desbloquear Gerador + Biblioteca por R$ 67
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isDemo}
                className="mt-4 w-full rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 disabled:cursor-not-allowed disabled:opacity-45"
              >
                📋 Copiar Mensagem Pronta
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
