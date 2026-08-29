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
  // Ficha de uso clinico: como levar a metafora pra dentro da sessao.
  // Opcional por metafora — o bloco so aparece quando ha conteudo.
  ficha_dor: string | null;
  ficha_usar: string | null;
  ficha_nao_usar: string | null;
  ficha_preparo: string | null;
  ficha_perguntas: string[];
  ficha_ponte: string | null;
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
  process.env.NEXT_PUBLIC_LINK_VENDAS ?? "metaforasterapeuticas.video";

export function criarMensagemCompartilhar(titulo: string, resumo: string) {
  const corpo = resumo?.trim()
    ? `${titulo}\n\n${resumo.trim()}`
    : `${titulo}`;
  return `${corpo}\n\nPara mais metáforas como essa, acesse: ${LINK_VENDAS}`;
}
