export const productos = {
  him: [
    { id: 1, nombre: 'Zip Hoodie Forme', precio: 89000, img: '/hoodie-him.jpg', imgHover: null, badge: 'NUEVO', tallas: ['S', 'M', 'L', 'XL'], categoria: 'him' },
    { id: 2, nombre: 'Short Cuadrillé', precio: 65000, img: '/short-him.jpg', imgHover: '/short-him-back.jpg', badge: 'NUEVO', tallas: ['S', 'M', 'L', 'XL'], categoria: 'him' },
  ],
  her: [
    { id: 3, nombre: 'Zip Hoodie Forme', precio: 89000, img: '/campera-her.jpg', imgHover: null, badge: 'NUEVO', tallas: ['XS', 'S', 'M', 'L'], categoria: 'her' },
    { id: 4, nombre: 'Short Cuadrillé', precio: 65000, img: '/short-her.jpg', imgHover: null, badge: 'NUEVO', tallas: ['XS', 'S', 'M', 'L'], categoria: 'her' },
  ],
};

export const todosLosProductos = [...productos.him, ...productos.her];

export function getProductoPorId(id) {
  const idNum = Number(id);
  return todosLosProductos.find(p => p.id === idNum) ?? null;
}
