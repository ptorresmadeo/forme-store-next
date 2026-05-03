import { useState } from 'react';

function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
    if (!form.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'Ingresá un email válido.';
    }
    if (!form.mensaje.trim()) {
      nuevosErrores.mensaje = 'El mensaje es obligatorio.';
    } else if (form.mensaje.trim().length < 10) {
      nuevosErrores.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
    }
    return nuevosErrores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const erroresEncontrados = validar();
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados);
    } else {
      setErrores({});
      setEnviado(true);
      setForm({ nombre: '', email: '', mensaje: '' });
    }
  };

  return (
    <section className="contacto" id="contacto" aria-label="Formulario de contacto">
      <h2>CONTACTO</h2>
      {enviado ? (
        <p className="enviado">¡Mensaje enviado! Nos contactamos pronto.</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
            />
            {errores.nombre && <span className="error">{errores.nombre}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
            />
            {errores.email && <span className="error">{errores.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={form.mensaje}
              onChange={handleChange}
              placeholder="Tu mensaje..."
            />
            {errores.mensaje && <span className="error">{errores.mensaje}</span>}
          </div>
          <button type="submit" className="btn-primary">ENVIAR</button>
        </form>
      )}
    </section>
  );
}

export default Contacto;