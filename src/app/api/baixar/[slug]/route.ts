import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getAccessState } from "@/lib/access";

// Download do vídeo LIMPO (sem logo), exclusivo de quem comprou a licença de
// uso nas redes. O arquivo mora num bucket privado: ninguém chega nele por
// URL. Aqui a gente confere a sessão, confere a licença e só então assina um
// link de curta duração.
//
// Quem não tem licença nem passa por aqui — o botão do player aponta direto
// pro arquivo público, que sai com o logo queimado.

const EXPIRA_SEGUNDOS = 120;

// Um client separado logado como o admin do site: é ele quem tem permissão de
// ler o bucket privado. Mesma arquitetura do webhook — sem service role.
async function clientComoAdmin() {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error } = await client.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  });
  if (error) throw new Error(`login do admin falhou: ${error.message}`);
  return client;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

  const { acessoPago, licencaRedes } = await getAccessState();
  if (!acessoPago) {
    return NextResponse.json({ erro: "acesso não liberado" }, { status: 401 });
  }
  if (!licencaRedes) {
    return NextResponse.json(
      { erro: "sem licença de uso nas redes" },
      { status: 403 }
    );
  }

  try {
    const admin = await clientComoAdmin();
    const { data, error } = await admin.storage
      .from("videos-limpos")
      .createSignedUrl(`${slug}.mp4`, EXPIRA_SEGUNDOS, {
        download: `${slug}.mp4`,
      });
    if (error || !data?.signedUrl) {
      console.error("[baixar] assinatura falhou:", error);
      return NextResponse.json({ erro: "vídeo indisponível" }, { status: 404 });
    }
    return NextResponse.redirect(data.signedUrl);
  } catch (erro) {
    console.error("[baixar] erro inesperado:", erro);
    return NextResponse.json({ erro: "falha ao gerar link" }, { status: 500 });
  }
}
