## Descripción

<!-- Qué cambia este PR y por qué. -->

## Tipo de cambio

- [ ] Fix
- [ ] Feature nueva
- [ ] Refactor / estilos
- [ ] Configuración / infraestructura (CI, migraciones, env vars)

## Checklist de revisión

### General
- [ ] `npm run build` corre sin errores ni warnings
- [ ] El CI (`.github/workflows/ci.yml`) pasó en este PR
- [ ] No se commiteó ningún secreto (`.env.local`, tokens, keys)

### Base de datos (Supabase)
- [ ] Si se agregó/modificó una tabla, hay una migración nueva en `supabase/migrations/`
- [ ] Las políticas RLS de las tablas tocadas siguen siendo correctas (lectura pública vs. acceso autenticado, según corresponda)

### Checkout / pagos
- [ ] Probé el flujo de carrito → checkout → Mercado Pago de punta a punta
- [ ] El precio y el stock se siguen validando server-side (nunca confiar en lo que manda el cliente)
- [ ] El webhook (`/api/webhook`) sigue marcando la orden como pagada y descontando stock correctamente

### Responsive / mobile
- [ ] Probé en un viewport mobile real (no solo achicando la ventana de escritorio)
- [ ] La animación del logo (navbar y hero) se ve fluida, sin saltos
- [ ] El video de fondo autoplay/loopea correctamente en mobile

### Accesibilidad
- [ ] Las imágenes nuevas tienen `alt` descriptivo (o `alt=""` + `aria-hidden` si son decorativas)
- [ ] Los inputs nuevos tienen `<label htmlFor>` asociado
- [ ] Los botones sin texto visible (íconos) tienen `aria-label`

### Estética
- [ ] El cambio respeta la paleta y tipografías existentes (sin Tailwind: estilos en `globals.css`)
- [ ] No quedaron textos de prueba, `console.log` ni código comentado de debug
