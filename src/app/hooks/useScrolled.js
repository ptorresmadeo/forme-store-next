'use client';
import { useEffect, useState } from 'react';

// Compartido entre Navbar y Hero: ambos animan en conjunto al mismo threshold
// (el logo del Hero "aterriza" en la posición del logo del Navbar).
export function useScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
