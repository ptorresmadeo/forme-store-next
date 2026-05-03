'use client';
import { useState, useEffect } from 'react';
import Contacto from './Contacto';
import Loader from './Loader';
import Navbar from './Navbar';
import Hero from './Hero';
import Catalogo from './Catalogo';
import Carrito from './Carrito';
import Footer from './Footer';

export default function PaginaCompleta({ categoriaInicial = 'todos' }) {
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [carrito, setCarrito] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cambiarCategoria = (nuevaCategoria) => {
    setCategoria(nuevaCategoria);
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existente = prev.find(i => i.id === producto.id);
      if (existente) {
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  return (
    <main>
      {loading && <Loader />}
      <Navbar carrito={carrito} scrolled={scrolled} />
      <Hero scrolled={scrolled} />
      <Catalogo
        categoria={categoria}
        cambiarCategoria={cambiarCategoria}
        agregarAlCarrito={agregarAlCarrito}
      />
      <Carrito carrito={carrito} />
      <Contacto />
      <Footer />
    </main>
  );
}