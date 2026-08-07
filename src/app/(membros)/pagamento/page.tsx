import { CHECKOUT_URL } from "@/lib/funil";

const ITENS_INCLUSOS = [
  "Acesso a mais de 50 metáforas terapêuticas em vídeo, prontas para usar em sessão",
  "Novas metáforas adicionadas constantemente à biblioteca",
  "Vídeos verticais, prontos para reproduzir na sessão ou compartilhar com o cliente",
  "Botão de compartilhamento direto no WhatsApp com texto pronto",
  "Gerador de metáforas personalizadas (em breve)",
  "Acesso pelo computador ou celular, quando e onde precisar",
];

export default function PagamentoPage() {
  return (
    <div className="animate-reveal mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          Metáforas Terapêuticas em Vídeo
        </span>
        <h1 className="mt-3 font-serif text-3xl italic text-zinc-50 sm:text-4xl">
          Tudo que você recebe ao entrar
        </h1>
      </div>

      <div className="glass-card rounded-[32px] p-6 sm:p-10">
        <ul className="flex flex-col gap-4">
          {ITENS_INCLUSOS.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-light">
                ✓
              </span>
              <span className="text-sm text-zinc-300 sm:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-3 pb-6 text-center">
        <a
          href={CHECKOUT_URL}
          className="gold-glow rounded-full bg-gold px-12 py-4 text-base font-semibold text-black shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105"
        >
          Quero garantir meu acesso
        </a>
        <p className="text-xs text-zinc-500">
          Acesso liberado por e-mail assim que a compra for confirmada.
        </p>
      </div>
    </div>
  );
}
