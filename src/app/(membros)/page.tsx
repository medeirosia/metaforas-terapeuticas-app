import Image from "next/image";
import { CHECKOUT_URL } from "@/lib/funil";
import { getCategoriasComMetaforas } from "@/lib/metaforas-queries";
import VideoLoop from "@/components/public/VideoLoop";

const ENTREGAVEIS = [
  {
    icon: "🎬",
    titulo: "+100 Metáforas em Vídeo HD",
    texto: "Prontas para exibição em sessão e uso em Reels/TikTok.",
    selo: "Atualizações constantes",
  },
  {
    icon: "🎁",
    titulo: "Bônus Especial: Gerador de Metáforas Personalizadas",
    texto: "Crie metáforas sob medida para o tema emocional de cada atendimento.",
  },
  {
    icon: "📚",
    titulo: "Acervo de 1.200 Metáforas Textuais",
    texto: "Guia em PDF para impressão e atendimentos presenciais.",
  },
  {
    icon: "🎓",
    titulo: "Guia Clínico & Diário de Reflexão",
    texto: "Scripts de timing, perguntas de ancoragem e autoaplicação.",
  },
];

const VALUE_STACK = [
  ["Biblioteca de +100 Metáforas em Vídeo HD", "R$ 297,00"],
  ["Gerador de Metáforas Personalizadas", "R$ 197,00"],
  ["Guia de Aplicação Clínica em Sessão", "R$ 97,00"],
  ["Acervo de 1.200 Metáforas para Imprimir", "R$ 147,00"],
  ["Atualizações Semanalmente Gratuitas", "R$ 97,00/ano"],
];

const TEORICOS = [
  {
    nome: "Carl Rogers",
    abordagem: "Centrada na pessoa",
    foto: "/teoricos/carl-rogers.png",
  },
  {
    nome: "Fritz Perls",
    abordagem: "Gestalt-terapia",
    foto: "/teoricos/fritz-perls.jpg",
  },
  {
    nome: "Aaron Beck",
    abordagem: "Terapia cognitiva",
    foto: "/teoricos/aaron-beck.jpg",
  },
  {
    nome: "Carl Jung",
    abordagem: "Psicologia analítica",
    foto: "/teoricos/carl-jung.jpeg",
  },
  {
    nome: "Sigmund Freud",
    abordagem: "Psicanálise",
    foto: "/teoricos/freud.jpg",
  },
  {
    nome: "Milton Erickson",
    abordagem: "Hipnose clínica",
    foto: "/teoricos/milton-erickson.jpg",
  },
  {
    nome: "Viktor Frankl",
    abordagem: "Logoterapia",
    foto: "/teoricos/viktor-frankl.jpg",
  },
];

export default async function InicioPage() {
  const categorias = await getCategoriasComMetaforas();
  const videosPreview = categorias
    .flatMap((categoria) => categoria.metaforas)
    .filter((metafora) => metafora.status === "liberado" && metafora.video_url)
    .slice(0, 8)
    .map((metafora) => ({
      titulo: metafora.titulo,
      videoUrl: metafora.video_url ?? "",
      thumbUrl: metafora.thumb_url,
    }));
  const teoricosLoop = [...TEORICOS, ...TEORICOS];

  return (
    <div className="animate-reveal mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-400/25 bg-[#0c0f0d] p-5 shadow-2xl sm:rounded-[36px] sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.26),transparent_40%),radial-gradient(circle_at_100%_70%,rgba(167,139,113,0.22),transparent_32%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300 sm:text-xs">
            Pagamento Único • Sem Assinatura • Acesso Vitalício
          </span>

          <h1 className="text-3xl font-black leading-tight text-zinc-50 sm:text-5xl">
            Biblioteca de Metáforas Terapêuticas em Vídeo
          </h1>
          
          <h1 className="text-3xl font-black leading-tight text-zinc-50 sm:text-5xl">
            Transforme conceitos complexos em &apos;estalos&apos; de consciência
            instantâneos.
          </h1>
          <VideoLoop videos={videosPreview} compacto />
          <p className="text-base font-bold leading-relaxed text-zinc-100 sm:text-xl">
            Uma biblioteca inteira de vídeos que curam.
          </p>
        </div>
      </section>

      <section className="w-full py-6 text-left sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.28em] text-gold-light">
            EMBASAMENTO
          </span>
          <h2 className="mt-3 text-2xl font-black leading-tight text-zinc-50 sm:text-4xl">
            Metáforas construídas com base em
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Os maiores nomes da psicologia profunda, da neurociência e da terapia
            narrativa.
          </p>
        </div>

        <div className="relative -mx-4 mt-8 w-[calc(100%+2rem)] overflow-hidden px-4 pb-2 sm:mx-auto sm:w-full sm:px-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent sm:w-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent sm:w-20" />
          <div className="theorists-marquee flex w-max gap-4">
            {teoricosLoop.map((teorico, index) => (
              <article
                key={`${teorico.nome}-${index}`}
                className="w-36 shrink-0 text-center sm:w-32"
              >
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border border-gold/25 bg-zinc-900 shadow-[0_0_32px_rgba(212,184,120,0.12)]">
                  <Image
                    src={teorico.foto}
                    alt={teorico.nome}
                    fill
                    sizes="96px"
                    className="object-cover grayscale contrast-110 saturate-0"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/35" />
                </div>
                <h3 className="mt-3 text-sm font-black text-zinc-100">
                  {teorico.nome}
                </h3>
                <p className="mt-1 text-xs leading-snug text-zinc-500">
                  {teorico.abordagem}
                </p>
              </article>
            ))}
          </div>
        </div>

        <blockquote className="mx-auto mt-8 max-w-3xl border-y border-gold/20 py-7 text-center sm:mt-10 sm:py-8">
          <p className="font-serif text-2xl italic leading-snug text-gold-light sm:text-3xl">
            “A metáfora não descreve a experiência. Ela cria uma nova.”
          </p>
          <cite className="mt-4 block text-xs font-black uppercase not-italic tracking-[0.22em] text-gold">
            Milton Erickson
          </cite>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Não são histórias aleatórias. São imagens calibradas para acessar o
            que a mente racional protege — usando a linguagem que o inconsciente
            realmente entende.
          </p>
        </blockquote>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {ENTREGAVEIS.map((item) => (
          <article
            key={item.titulo}
            className="glass-card rounded-[24px] p-5 transition-transform hover:-translate-y-1 hover:border-emerald-400/35 sm:p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-2xl">
              {item.icon}
            </span>
            <h2 className="mt-4 text-xl font-black text-zinc-50">
              {item.titulo}
            </h2>
            {"selo" in item && item.selo && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-300">
                {item.selo}
              </span>
            )}
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {item.texto}
            </p>
          </article>
        ))}
      </section>

      <section id="oferta" className="scroll-mt-24 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass-card rounded-[28px] p-5 sm:p-7">
          <h2 className="font-serif text-2xl italic text-zinc-50">
            Valor real do pacote
          </h2>
          <div className="mt-5 divide-y divide-white/10">
            {VALUE_STACK.map(([item, valor]) => (
              <div key={item} className="flex items-start justify-between gap-4 py-3">
                <span className="text-sm leading-relaxed text-zinc-300">{item}</span>
                <strong className="shrink-0 text-sm text-gold-light">{valor}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Valor total do pacote
            </p>
            <p className="mt-1 text-3xl font-black text-zinc-400 line-through">
              R$ 835,00
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-emerald-400/30 bg-[#06130d] p-5 text-center shadow-[0_0_80px_rgba(16,185,129,0.16)] sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(52,211,153,0.28),transparent_45%)]" />
          <div className="relative">
            <p className="text-sm font-bold text-zinc-400">
              De <span className="line-through">R$ 197</span> por apenas:
            </p>
            <p className="mt-4 text-lg font-bold text-emerald-200">
              12x de
            </p>
            <div className="flex items-end justify-center gap-2">
              <span className="pb-2 text-2xl font-black text-emerald-300">R$</span>
              <strong className="text-7xl font-black leading-none text-emerald-300 sm:text-8xl">
                6,83
              </strong>
            </div>
            <p className="mt-3 text-sm font-semibold text-zinc-300">
              ou R$ 67,00 à vista
            </p>

            <a
              href={CHECKOUT_URL}
              className="relative mt-7 inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-emerald-400 px-6 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_42px_rgba(52,211,153,0.5)] transition-transform hover:scale-[1.03] sm:text-base"
            >
              <span className="absolute inset-0 animate-pulse bg-emerald-300/40" />
              <span className="shine-sweep absolute -left-16 top-0 h-full w-14 -skew-x-12 bg-white/50 shadow-[0_0_28px_rgba(255,255,255,0.7)]" />
              <span className="relative">Quero garantir meu acesso agora</span>
            </a>

            <p className="mt-4 text-xs leading-relaxed text-zinc-400">
              Garantindo hoje, você trava o acesso vitalício sem nenhuma
              mensalidade futura.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-gold/25 bg-gold/10 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-50">
              🛡️ 14 Dias de Garantia Incondicional
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
              Teste na sua próxima sessão. Se não transformar seu atendimento,
              devolvemos 100% do seu dinheiro.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-zinc-200">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
              ⚡ Acesso Imediato no E-mail
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
              🔒 Pagamento 100% Seguro
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
              ♾️ Sem Assinatura
            </span>
          </div>
        </div>
      </section>

      <section className="pb-6 pt-4 sm:pb-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-black text-zinc-50 sm:text-3xl">
            Perguntas Frequentes
          </h2>
          <div className="mt-6 divide-y divide-white/10 rounded-[28px] border border-white/10 bg-white/[0.03]">
            {[
              [
                "Preciso ser terapeuta para usar?",
                "Não. O material funciona nos dois sentidos: se você é terapeuta, psicólogo ou coach, cada vídeo vira um recurso pronto pra usar na próxima sessão. Se você busca autoconhecimento, cada metáfora é uma lente nova sobre algo que você já vive mas ainda não conseguiu nomear.",
              ],
              [
                "Como recebo o acesso?",
                "O acesso é imediato. Assim que a compra é confirmada, você recebe os dados de acesso no seu e-mail e já pode começar a assistir.",
              ],
              [
                "Por quanto tempo tenho acesso?",
                "O acesso é vitalício. Você compra uma vez e consulta a biblioteca sempre que precisar, sem mensalidade.",
              ],
              [
                "A biblioteca recebe novas metáforas?",
                "Sim. A biblioteca cresce continuamente — novas metáforas são adicionadas ao acervo ao longo do tempo. Quem compra hoje recebe todas elas automaticamente, sem custo adicional e sem prazo para acabar. Hoje são 147 disponíveis; amanhã, mais.",
              ],
              [
                "Os vídeos são longos?",
                "Não. Cada metáfora é um vídeo curto e direto — pensado pra você encontrar e aplicar em segundos, não pra assistir a uma aula.",
              ],
              [
                "E se eu não gostar?",
                "Você tem 14 dias de garantia incondicional. Se não sentir que ganhou um repertório novo, envie um e-mail e devolvemos cada centavo, sem perguntas.",
              ],
            ].map(([pergunta, resposta]) => (
              <details key={pergunta} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-zinc-50">
                  <span>{pergunta}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-gold-light transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  {resposta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
