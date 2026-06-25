'use client';
import { useState } from 'react';

function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroresEncontrados = validar();
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados);
      return;
    }

    setErrores({});
    setErrorEnvio('');
    setEnviando(true);

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorEnvio(data.error || 'No pudimos enviar tu mensaje. Intentá de nuevo.');
        return;
      }

      setEnviado(true);
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch {
      setErrorEnvio('No pudimos conectar con el servidor. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="contacto" id="contacto" aria-label="Formulario de contacto">
      <div className="contacto-inner">
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
            {errorEnvio && <p className="error" role="alert">{errorEnvio}</p>}
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? 'ENVIANDO...' : 'ENVIAR'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default Contacto;