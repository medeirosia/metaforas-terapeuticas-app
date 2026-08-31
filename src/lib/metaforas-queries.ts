import { createClient } from "@/lib/supabase/server";
import type { CategoriaComMetaforas, Metafora } from "@/lib/metaforas";

const THUMBS_LOCAIS = new Set([
  "guarda-chuva-aberto",
  "divida-quitada",
  "tribunal-vazio",
  "balde-furado",
  "espelho-rachado",
  "casaco-de-inverno",
  "sala-de-espera",
  "cofre-sem-senha",
  "mapa-de-outra-cidade",
  "cadeira-vazia-da-plateia",
  "porta-trancada-por-dentro",
  "mascara-de-teatro",
  "muralha-de-vidro",
  "chave-perdida",
  "recibo-rasgado",
  "conta-que-ja-foi-paga",
  "carta-de-perdao-nao-enviada",
  "balanca-emperrada",
  "rascunho-riscado-de-vermelho",
  "espelho-do-juiz",
  "prova-sem-gabarito",
  "quadro-nunca-terminado",
  "copo-sempre-pela-metade",
  "etiqueta-de-preco-apagada",
  "sombra-maior-que-o-corpo",
  "holofote-que-so-mostra-falhas",
  "foto-amassada-na-gaveta",
  "retrato-pintado-por-outro",
  "vidro-embacado",
  "cicatriz-que-virou-mapa",
  "roteiro-decorado-na-infancia",
  "trilho-de-trem-antigo",
  "roupa-que-nao-serve-mais",
  "disco-riscado",
  "roupa-emprestada-que-nao-serve",
  "espelho-com-o-rosto-de-outro",
  "estrada-com-placas-trocadas",
  "personagem-copiado",
  "mala-pronta-ha-anos",
  "relogio-sem-ponteiros",
  "trem-que-nunca-parte",
  "semaforo-sempre-amarelo",
  "carta-lacrada-ha-anos",
  "sotao-fechado",
  "rio-represado",
  "caixa-de-sapato-no-armario",
  "prato-extra-na-mesa",
  "carta-sem-endereco-de-volta",
  "foto-que-ninguem-tira-da-parede",
  "relogio-parado-na-hora-certa",
  "panela-no-fogo-baixo",
  "pedra-no-sapato",
  "cerca-dentro-do-tronco",
  "poco-que-serve-a-rua",
  "ponte-de-um-lado-so",
  "ensaio-da-queda",
  "caixas-nunca-abertas",
  "planta-virada-pra-janela",
  "regua-de-outra-casa",
  "muro-baixo-do-vizinho",
  "teto-que-ele-baixou",
  "vigia-nunca-rendido",
  "armario-que-enche-sozinho",
  "mesa-de-oito-lugares",
  "troco-contado-na-mao",
  "calendario-de-uma-folha",
  "duas-trilhas-no-carpete",
  "uniforme-atras-da-porta",
  "corrimao-da-casa-do-pai",
  "garrafa-guardada",
  "xicara-colada",
  "cano-na-parede-errada",
  "estante-vazia",
  "caderno-que-ninguem-le",
  "gaveta-de-baixo",
  "prego-na-parede",
  "fotos-sem-nome-atras",
  "vidro-que-acaba-antes",
  "sala-com-porta",
  "casa-que-ninguem-vende",
  "pao-que-nao-tem-aqui",
  "bicicleta-pendurada",
  "quarto-que-voltou",
  "botas-que-so-uma-gastou",
  "envelope-que-ele-nao-abre",
  "capacete-que-sobrou",
  "louca-lavada-duas-vezes",
  "nota-errada-no-meio",
  "rodape-que-falta",
  "cadeira-que-balanca",
  "pedaco-queimado",
  "acerto-que-veio-a-menos",
  "dez-minutos-na-garagem",
  "mao-no-ombro",
  "restaurante-de-outro-bairro",
  "tapete-que-nao-gastou",
  "garfo-que-nao-solta",
  "mao-na-boca-ao-rir",
  "viagem-que-ele-nao-conta",
  "exame-na-mochila",
]);

function thumbLocalPorSlug(slug: string) {
  const nomeArquivo =
    slug === "caixa-de-sapato-no-fundo-do-armario"
      ? "caixa-de-sapato-no-armario"
      : slug;

  if (!THUMBS_LOCAIS.has(nomeArquivo)) return null;

  return `/metaforas-thumbs/${nomeArquivo}.jpg`;
}

export async function getCategoriasComMetaforas(): Promise<
  CategoriaComMetaforas[]
> {
  const supabase = await createClient();

  const { data: categorias, error: erroCategorias } = await supabase
    .from("categorias")
    .select("id, nome, ordem")
    .order("ordem", { ascending: true });

  if (erroCategorias) throw erroCategorias;

  const { data: metaforas, error: erroMetaforas } = await supabase
    .from("metaforas")
    .select(
      "id, titulo, slug, video_url, thumb_url, resumo, descricao, categoria_id, dores, ficha_dor, ficha_usar, ficha_nao_usar, ficha_preparo, ficha_perguntas, ficha_ponte, status, destaque, publicado, ordem, created_at"
    )
    .eq("publicado", true)
    .order("ordem", { ascending: true });

  if (erroMetaforas) throw erroMetaforas;

  const metaforasComThumbLocal: Metafora[] = (metaforas ?? []).map((metafora) => ({
    ...metafora,
    thumb_url: thumbLocalPorSlug(metafora.slug) ?? metafora.thumb_url,
  }));

  return (categorias ?? [])
    .map((categoria) => ({
      ...categoria,
      metaforas: metaforasComThumbLocal.filter(
        (m) => m.categoria_id === categoria.id
      ),
    }))
    .filter((categoria) => categoria.metaforas.length > 0);
}
