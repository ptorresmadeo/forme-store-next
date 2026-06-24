'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useScrolled } from '../hooks/useScrolled';

const BREAKPOINT_MOBILE = '(max-width: 768px)';

function Hero() {
  const scrolled = useScrolled(80);
  const videoRef = useRef(null);
  // null = todavía no se determinó (ni en SSR ni en el primer render del
  // cliente, así no hay mismatch de hidratación). Mientras sea null no se
  // renderiza ningún <source> — el navegador puede empezar a pedir el
  // recurso apenas se inserta el elemento en el DOM, antes de que llegue a
  // correr cualquier efecto, así que la única forma de garantizar que un
  // celular nunca pida el archivo pesado de escritorio (ni un instante) es
  // no darle ninguna URL hasta saber con certeza qué versión corresponde.
  const [esMobile, setEsMobile] = useState(null);

  useLayoutEffect(() => {
    const mq = window.matchMedia(BREAKPOINT_MOBILE);
    setEsMobile(mq.matches);
    const handler = (e) => setEsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
  }, [esMobile]);

  // Sin "controles" visibles, cualquier pausa (ej. un corte momentáneo de red)
  // es "no intencional" para un video de fondo decorativo — se reintenta solo.
  const handlePause = (e) => {
    e.currentTarget.play()?.catch(() => {});
  };

  // Respaldo real: si el sistema operativo bloquea el autoplay (Modo de Bajos
  // Datos / Ahorro de Datos / "Reducir movimiento" en iOS/Android pueden
  // hacerlo a nivel sistema, sin que ningún atributo HTML lo pueda evitar),
  // un toque genuino del usuario sí está siempre permitido por las políticas
  // de autoplay — esto hace que tocar el video efectivamente lo arranque.
  const handleTap = () => {
    videoRef.current?.play()?.catch(() => {});
  };

  return (
    <section className="hero" aria-label="Sección principal">
      <video
        key={esMobile === null ? 'pendiente' : esMobile ? 'mobile' : 'desktop'}
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        onPause={handlePause}
        onClick={handleTap}
      >
        {esMobile !== null && (
          <source src={esMobile ? '/hero-mobile.mp4' : '/hero.mp4'} type="video/mp4" />
        )}
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