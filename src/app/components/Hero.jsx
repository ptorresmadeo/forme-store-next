function Hero({ scrolled }) {
  return (
    <section className="hero" aria-label="Sección principal">
      <video className="hero-video" autoPlay muted loop playsInline>
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay"></div>

      <div className={`hero-logo-wrap ${scrolled ? 'scrolled' : ''}`}>
        <img src="/logo.png" alt="" aria-hidden="true" className="hero-logo-img" />
        <h1 className="hero-titulo">FOR <span>ME</span></h1>
      </div>

      <div className={`hero-content ${scrolled ? 'oculto' : ''}`}>
        <div className="drop-tag">
          <span className="dot"></span>DROP 004 — LIVE NOW
        </div>
        <p className="hero-sub">LIMITADO · LOCAL · 2026</p>
        <div className="hero-btns">
          <a href="#categorias" className="btn-primary">VER DROP</a>
          <a href="#contacto" className="btn-ghost">CONTACTO</a>
        </div>
      </div>
    </section>
  );
}

export default Hero;