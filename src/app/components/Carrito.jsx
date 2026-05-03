function Carrito({ carrito }) {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <section className="carrito" id="carrito" aria-label="Carrito de compras">
      <h2>TU CARRITO</h2>
      <div className="carrito-items">
        {carrito.length === 0 ? (
          <p className="carrito-vacio">Tu carrito está vacío.</p>
        ) : (
          carrito.map(item => (
            <div key={item.id} className="carrito-item">
              <span>{item.nombre} x{item.cantidad}</span>
              <span>${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
            </div>
          ))
        )}
      </div>
      <p className="carrito-total">TOTAL: ${total.toLocaleString('es-AR')}</p>
    </section>
  );
}

export default Carrito;