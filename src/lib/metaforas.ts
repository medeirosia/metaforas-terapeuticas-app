export type Categoria = {
  id: string;
  nome: string;
  ordem: number;
};

export type StatusMetafora = "liberado" | "em_breve";

export type Metafora = {
  id: string;
  titulo: string;
  slug: string;
  video_url: string | null;
  thumb_url: string | null;
  resumo: string | null;
  descricao: string | null;
  categoria_id: string;
  dores: string[];
  status: StatusMetafora;
  destaque: boolean;
  publicado: boolean;
  ordem: number;
  created_at: string;
};

export type CategoriaComMetaforas = Categoria & {
  metaforas: Metafora[];
};

const LINK_VENDAS =
  process.env.NEXT_PUBLIC_LINK_VENDAS ??
  "https://terapeutadofuturo.com/video-metaforas/";

export function criarMensagemCompartilhar(titulo: string, resumo: string) {
  return `Olha esse vídeo sobre ${titulo.toLowerCase()}... 🎥\n\n${resumo}\n\nPara ver mais vídeos como esse, acesse: ${LINK_VENDAS}`;
}
