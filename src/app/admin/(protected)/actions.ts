"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigirAdminNaAcao } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function parseDores(bruto: string): string[] {
  return bruto
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
}

async function resolverCategoriaId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoriaId: string,
  novaCategoriaNome: string
): Promise<string> {
  if (categoriaId !== "__nova__") return categoriaId;

  const nome = novaCategoriaNome.trim();
  if (!nome) throw new Error("Informe o nome da nova categoria.");

  const { data: existente } = await supabase
    .from("categorias")
    .select("id")
    .eq("nome", nome)
    .maybeSingle();

  if (existente) return existente.id;

  const { data: contagem } = await supabase
    .from("categorias")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: novaCategoria, error } = await supabase
    .from("categorias")
    .insert({ nome, ordem: (contagem?.ordem ?? -1) + 1 })
    .select("id")
    .single();

  if (error) throw error;
  return novaCategoria.id;
}

// As perguntas chegam uma por linha, que e como o terapeuta le no modal.
// Virgula nao serve de separador aqui: pergunta clinica tem virgula dentro.
function parsePerguntas(bruto: string): string[] {
  return bruto
    .split("\n")
    .map((p) => p.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

function lerFichaClinica(formData: FormData) {
  const texto = (campo: string) =>
    String(formData.get(campo) ?? "").trim() || null;

  return {
    ficha_dor: texto("ficha_dor"),
    ficha_usar: texto("ficha_usar"),
    ficha_nao_usar: texto("ficha_nao_usar"),
    ficha_preparo: texto("ficha_preparo"),
    ficha_perguntas: parsePerguntas(String(formData.get("ficha_perguntas") ?? "")),
    ficha_ponte: texto("ficha_ponte"),
  };
}

function lerCamposFormulario(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const status = String(formData.get("status") ?? "em_breve") as
    | "liberado"
    | "em_breve";
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const thumbUrl = String(formData.get("thumb_url") ?? "").trim();
  const resumo = String(formData.get("resumo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoriaId = String(formData.get("categoria_id") ?? "");
  const novaCategoriaNome = String(formData.get("nova_categoria_nome") ?? "");
  const dores = parseDores(String(formData.get("dores") ?? ""));
  const ficha = lerFichaClinica(formData);
  const destaque = formData.get("destaque") === "on";
  const publicado = formData.get("publicado") === "on";
  const ordem = Number(formData.get("ordem") ?? 0);

  if (!titulo || !categoriaId) {
    throw new Error("Preencha ao menos o título e a categoria.");
  }

  if (status === "liberado" && !videoUrl) {
    throw new Error("Envie o vídeo antes de marcar como liberado.");
  }

  return {
    titulo,
    status,
    videoUrl: videoUrl || null,
    thumbUrl: thumbUrl || null,
    resumo: resumo || null,
    descricao: descricao || null,
    categoriaId,
    novaCategoriaNome,
    dores,
    ficha,
    destaque,
    publicado,
    ordem,
  };
}

export async function criarMetafora(formData: FormData) {
  const supabase = await createClient();
  await exigirAdminNaAcao(supabase);
  const campos = lerCamposFormulario(formData);

  const categoriaResolvidaId = await resolverCategoriaId(
    supabase,
    campos.categoriaId,
    campos.novaCategoriaNome
  );

  const slugBase = slugify(campos.titulo);
  let slug = slugBase;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const { data: existente } = await supabase
      .from("metaforas")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existente) break;
    slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { error } = await supabase.from("metaforas").insert({
    titulo: campos.titulo,
    slug,
    status: campos.status,
    video_url: campos.videoUrl,
    thumb_url: campos.thumbUrl,
    resumo: campos.resumo,
    descricao: campos.descricao,
    categoria_id: categoriaResolvidaId,
    dores: campos.dores,
    ...campos.ficha,
    destaque: campos.destaque,
    publicado: campos.publicado,
    ordem: campos.ordem,
  });

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/metaforas");
}

export async function atualizarMetafora(id: string, formData: FormData) {
  const supabase = await createClient();
  await exigirAdminNaAcao(supabase);
  const campos = lerCamposFormulario(formData);

  const categoriaResolvidaId = await resolverCategoriaId(
    supabase,
    campos.categoriaId,
    campos.novaCategoriaNome
  );

  const { error } = await supabase
    .from("metaforas")
    .update({
      titulo: campos.titulo,
      status: campos.status,
      video_url: campos.videoUrl,
      thumb_url: campos.thumbUrl,
      resumo: campos.resumo,
      descricao: campos.descricao,
      categoria_id: categoriaResolvidaId,
      dores: campos.dores,
      ...campos.ficha,
      destaque: campos.destaque,
      publicado: campos.publicado,
      ordem: campos.ordem,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/metaforas");
}

export async function excluirMetafora(id: string) {
  const supabase = await createClient();
  await exigirAdminNaAcao(supabase);
  const { error } = await supabase.from("metaforas").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/metaforas");
}
