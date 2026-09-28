import PaginaCompleta from '../components/PaginaCompleta';

// El catálogo completo (antes en "/") queda funcional acá mientras la home
// muestra la landing de "Próximamente". No está enlazado desde la landing y
// se excluye de los buscadores hasta el lanzamiento.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function CatalogoPage() {
  return <PaginaCompleta categoriaInicial="todos" />;
}
