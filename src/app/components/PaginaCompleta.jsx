'use client';
import { useState, useEffect } from 'react';
import Loader from './Loader';
import Hero from './Hero';
import Catalogo from './Catalogo';

export default function PaginaCompleta({ categoriaInicial = 'todos' }) {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [categoria, setCategoria] = useState(categoriaInicial);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const cambiarCategoria = (nuevaCategoria) => {
    setCategoria(nuevaCategoria);
  };

  return (
    <main>
      {loading && <Loader />}
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <Hero />
        <Catalogo
          categoria={categoria}
          cambiarCategoria={cambiarCategoria}
        />
      </div>
    </main>
  );
}
