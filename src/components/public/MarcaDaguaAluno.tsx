"use client";

import { useEffect, useState } from "react";

// O e-mail de quem comprou, desenhado por cima do vídeo. Troca de posição a
// cada 8s alternando lado e altura: quem grava a tela pra revender leva o
// próprio e-mail junto, e não consegue cortar fora sem cortar a cena.
const POSICOES = [
  "left-3 top-[18%]",
  "right-3 top-[34%]",
  "left-3 top-[50%]",
  "right-3 top-[24%]",
  "left-3 top-[42%]",
  "right-3 top-[56%]",
];

const JANELA_MS = 8000;

export default function MarcaDaguaAluno({ email }: { email: string | null }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (!email) return;
    const id = setInterval(
      () => setIndice((i) => (i + 1) % POSICOES.length),
      JANELA_MS
    );
    return () => clearInterval(id);
  }, [email]);

  if (!email) return null;

  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-20 select-none text-[10px] font-medium tracking-wide text-white/35 transition-all duration-700 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] sm:text-[11px] ${POSICOES[indice]}`}
    >
      {email}
    </span>
  );
}
