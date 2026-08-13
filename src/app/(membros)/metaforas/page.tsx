import NetflixExplorer from "@/components/public/NetflixExplorer";
import { getCategoriasComMetaforas } from "@/lib/metaforas-queries";
import { getAccessState } from "@/lib/access";

export default async function MetaforasPage() {
  const [categorias, { isDemo, userEmail, licencaRedes }] = await Promise.all([
    getCategoriasComMetaforas(),
    getAccessState(),
  ]);

  return (
    <NetflixExplorer
      categorias={categorias}
      isDemo={isDemo}
      // Quem comprou a licença de uso nas redes assiste sem a marca d'água.
      emailAluno={licencaRedes ? null : userEmail}
    />
  );
}
