function Carrito({ carrito, setCarrito }) {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const eliminarItem = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

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
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <span>${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                <button className="btn-eliminar" onClick={() => eliminarItem(item.id)}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>
      {carrito.length > 0 && (
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px'}}>
          <p className="carrito-total">TOTAL: ${total.toLocaleString('es-AR')}</p>
          <button className="btn-vaciar" onClick={vaciarCarrito}>VACIAR CARRITO</button>
        </div>
      )}
    </section>
  );
}

export default Carrito;