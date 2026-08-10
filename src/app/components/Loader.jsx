// pantallaCompleta=true (default) reproduce el splash original de carga inicial
// (overlay fijo a pantalla completa). pantallaCompleta=false renderiza el mismo
// logo animado pero contenido dentro de su elemento padre, para reusarlo en
// lugares como el catálogo sin tapar toda la pantalla.
function Loader({ pantallaCompleta = true }) {
  return (
    <div className={pantallaCompleta ? 'loader' : 'loader-contenido'}>
      <img src="/logo-forme.png" alt="For Me Studios" className="loader-logo" />
    </div>
  );
}

export default Loader;