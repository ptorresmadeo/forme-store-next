import PaginaCompleta from '../../components/PaginaCompleta';

export default async function ProductosPorCategoria({ params }) {
  const { categoria } = await params;
  return <PaginaCompleta categoriaInicial={categoria} />;
}