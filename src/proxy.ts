import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ROTAS_ADMIN_PUBLICAS = ["/admin/login", "/admin/signup"];

export default async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isRotaAdmin = pathname.startsWith("/admin");
  const isRotaAdminPublica = ROTAS_ADMIN_PUBLICAS.some((rota) =>
    pathname.startsWith(rota)
  );

  if (isRotaAdmin && !isRotaAdminPublica && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
