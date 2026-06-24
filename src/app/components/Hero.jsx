'use client';
import { useEffect, useRef } from 'react';
import { useScrolled } from '../hooks/useScrolled';

function Hero() {
  const scrolled = useScrolled(80);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // React no siempre sincroniza la PROPIEDAD "muted" del DOM con el atributo
    // HTML durante la hidratación SSR — algunos navegadores mobile chequean
    // la propiedad real (no el atributo) antes de permitir el autoplay.
    // Forzarla explícitamente y reintentar play() es lo que lo hace confiable
    // en iOS/Android en vez de depender solo de los atributos.
    video.muted = true;
    video.play()?.catch(() => {
      // Si el navegador lo bloquea igual, el video queda pausado en su primer
      // frame sin romper nada más; no hace falta UI de fallback acá.
    });
  }, []);

  return (
    <section className="hero" aria-label="Sección principal">
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
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