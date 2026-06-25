'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TALLAS_POR_CATEGORIA = {
  him: ['S', 'M', 'L', 'XL'],
  her: ['XS', 'S', 'M', 'L'],
};

const FORM_VACIO = {
  titulo: '',
  precio: '',
  descripcion: '',
  categoria: 'him',
  imagen_url: '',
  stock_por_talle: { S: '', M: '', L: '', XL: '' },
};

function AdminPanel() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/productos');
      if (!res.ok) throw new Error('No se pudo cargar el catálogo.');
      setProductos(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleCategoriaChange = (categoria) => {
    const tallasNuevas = TALLAS_POR_CATEGORIA[categoria];
    const stockNuevo = {};
    tallasNuevas.forEach(t => { stockNuevo[t] = form.stock_por_talle[t] ?? ''; });
    setForm({ ...form, categoria, stock_por_talle: stockNuevo });
  };

  const handleStockChange = (talla, valor) => {
    setForm({ ...form, stock_por_talle: { ...form.stock_por_talle, [talla]: valor } });
  };

  const validarFormulario = () => {
    const errores = {};
    if (!form.titulo.trim()) errores.titulo = 'El título es obligatorio.';

    const precioNum = Number(form.precio);
    if (!form.precio || Number.isNaN(precioNum) || precioNum <= 0) {
      errores.precio = 'El precio debe ser un número mayor a 0.';
    }

    if (!['him', 'her'].includes(form.categoria)) {
      errores.categoria = 'Elegí una categoría.';
    }

    if (form.imagen_url && !/^(https?:\/\/|\/)/.test(form.imagen_url.trim())) {
      errores.imagen_url = 'Ingresá una URL válida (http(s)://... o una ruta que empiece con /).';
    }

    const tallasConStock = Object.values(form.stock_por_talle).filter(v => Number(v) > 0);
    if (tallasConStock.length === 0) {
      errores.stock_por_talle = 'Indicá stock para al menos un talle.';
    }

    return errores;
  };

  const resetForm = () => {
    setForm(FORM_VACIO);
    setEditingId(null);
    setFormErrors({});
  };

  const handleEditar = (producto) => {
    const tallas = TALLAS_POR_CATEGORIA[producto.categoria];
    const stock = {};
    tallas.forEach(t => { stock[t] = String(producto.stockPorTalla?.[t] ?? 0); });

    setForm({
      titulo: producto.nombre,
      precio: String(producto.precio),
      descripcion: producto.descripcion ?? '',
      categoria: producto.categoria,
      imagen_url: producto.img ?? '',
      stock_por_talle: stock,
    });
    setEditingId(producto.id);
    setFormErrors({});
    setMensaje('');
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;

    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'No se pudo eliminar el producto.');
      return;
    }
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = validarFormulario();
    setFormErrors(errores);
    if (Object.keys(errores).length > 0) return;

    setGuardando(true);
    setMensaje('');

    const stockLimpio = {};
    Object.entries(form.stock_por_talle).forEach(([talla, valor]) => {
      const n = Number(valor);
      if (n > 0) stockLimpio[talla] = n;
    });

    const payload = {
      titulo: form.titulo.trim(),
      precio: Number(form.precio),
      descripcion: form.descripcion.trim() || null,
      categoria: form.categoria,
      imagen_url: form.imagen_url.trim() || null,
      stock_por_talle: stockLimpio,
    };

    const url = editingId ? `/api/productos/${editingId}` : '/api/productos';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormErrors(data.errores || { _general: data.error || 'No se pudo guardar el producto.' });
        return;
      }

      setMensaje(editingId ? 'Producto actualizado.' : 'Producto creado.');
      resetForm();
      cargarProductos();
    } finally {
      setGuardando(false);
    }
  };

  const tallasFormulario = TALLAS_POR_CATEGORIA[form.categoria];

  return (
    <div className="admin-panel">
      <section className="admin-form-section">
        <h2>{editingId ? 'EDITAR PRODUCTO' : 'AGREGAR PRODUCTO'}</h2>
        <form onSubmit={handleSubmit} noValidate className="admin-form">
          <div className="form-group">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Zip Hoodie Forme"
            />
            {formErrors.titulo && <span className="error">{formErrors.titulo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <input
              id="precio"
              type="number"
              min="0"
              step="1"
              value={form.precio}
              onChange={e => setForm({ ...form, precio: e.target.value })}
              placeholder="89000"
            />
            {formErrors.precio && <span className="error">{formErrors.precio}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" value={form.categoria} onChange={e => handleCategoriaChange(e.target.value)}>
              <option value="him">FOR HIM</option>
              <option value="her">FOR HER</option>
            </select>
            {formErrors.categoria && <span className="error">{formErrors.categoria}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imagen_url">URL de imagen</label>
            <input
              id="imagen_url"
              type="text"
              value={form.imagen_url}
              onChange={e => setForm({ ...form, imagen_url: e.target.value })}
              placeholder="/hoodie-him.jpg o https://..."
            />
            {formErrors.imagen_url && <span className="error">{formErrors.imagen_url}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción del producto..."
            />
          </div>

          <fieldset className="form-group">
            <legend>Stock por talle</legend>
            <div className="admin-stock-grid">
              {tallasFormulario.map(talla => (
                <div key={talla} className="admin-stock-input">
                  <span>{talla}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock_por_talle[talla] ?? ''}
                    onChange={e => handleStockChange(talla, e.target.value)}
                    aria-label={`Stock talle ${talla}`}
                  />
                </div>
              ))}
            </div>
            {formErrors.stock_por_talle && <span className="error">{formErrors.stock_por_talle}</span>}
          </fieldset>

          {formErrors._general && <p className="error">{formErrors._general}</p>}
          {mensaje && <p className="admin-mensaje-ok">{mensaje}</p>}

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'GUARDANDO...' : editingId ? 'GUARDAR CAMBIOS' : 'AGREGAR PRODUCTO'}
            </button>
            {editingId && (
              <button type="button" className="btn-ghost" onClick={resetForm}>
                CANCELAR
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-lista-section">
        <h2>PRODUCTOS ({productos.length})</h2>
        {loading && <p>Cargando productos...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => {
                const stockTotal = Object.values(p.stockPorTalla ?? {}).reduce((a, b) => a + b, 0);
                return (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.categoria === 'him' ? 'FOR HIM' : 'FOR HER'}</td>
                    <td>${p.precio.toLocaleString('es-AR')}</td>
                    <td>{stockTotal}</td>
                    <td className="admin-tabla-acciones">
                      <button onClick={() => handleEditar(p)} aria-label={`Editar ${p.nombre}`}>EDITAR</button>
                      <button
                        onClick={() => handleEliminar(p.id)}
                        className="admin-btn-eliminar"
                        aria-label={`Eliminar ${p.nombre}`}
                      >
                        ELIMINAR
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminPanel;
