import NetflixExplorer from "@/components/public/NetflixExplorer";
import { getCategoriasComMetaforas } from "@/lib/metaforas-queries";
import { getAccessState } from "@/lib/access";

export default async function MetaforasPage() {
  const [categorias, { isDemo }] = await Promise.all([
    getCategoriasComMetaforas(),
    getAccessState(),
  ]);

  return <NetflixExplorer categorias={categorias} isDemo={isDemo} />;
}
