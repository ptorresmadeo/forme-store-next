'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'forme-carrito';

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [hidratado, setHidratado] = useState(false);

  // Lectura de localStorage post-mount: evita mismatch de hidratación SSR/cliente.
  useEffect(() => {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      try {
        setCarrito(JSON.parse(guardado));
      } catch {
        // localStorage corrupto: se ignora y se sigue con carrito vacío.
      }
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
  }, [carrito, hidratado]);

  // Cada línea del carrito se identifica por (id, talla): el mismo producto
  // en talles distintos son líneas separadas, agrupables luego en la UI.
  const agregarAlCarrito = (producto, talla) => {
    if (!talla) return false;
    setCarrito(prev => {
      const existente = prev.find(i => i.id === producto.id && i.talla === talla);
      if (existente) {
        return prev.map(i =>
          i.id === producto.id && i.talla === talla ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...producto, talla, cantidad: 1 }];
    });
    return true;
  };

  const eliminarItem = (id, talla) => {
    setCarrito(prev => prev.filter(item => !(item.id === id && item.talla === talla)));
  };

  const incrementarCantidad = (id, talla) => {
    setCarrito(prev => prev.map(item =>
      item.id === id && item.talla === talla ? { ...item, cantidad: item.cantidad + 1 } : item
    ));
  };

  const decrementarCantidad = (id, talla) => {
    setCarrito(prev => prev.map(item =>
      item.id === id && item.talla === talla && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider value={{
      carrito,
      totalItems,
      agregarAlCarrito,
      eliminarItem,
      incrementarCantidad,
      decrementarCantidad,
      vaciarCarrito,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
