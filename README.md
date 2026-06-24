# For Me Studios

E-commerce de streetwear construido con **Next.js (App Router)**: catálogo dinámico, carrito persistente, checkout real con **Mercado Pago** y un panel de administración protegido respaldado por **Supabase** (base de datos + autenticación).

Proyecto final — ITBA.

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Instrucciones de setup](#instrucciones-de-setup)
- [Flujo de checkout](#flujo-de-checkout)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Route Handlers, Server/Client Components) |
| UI | React 19, CSS plano con variables nativas (`:root`) — sin frameworks de utilidades |
| Base de datos | [Supabase](https://supabase.com/) (PostgreSQL administrado) |
| Autenticación | Supabase Auth vía `@supabase/ssr` — protege el panel `/admin` |
| Pagos | [Mercado Pago](https://www.mercadopago.com.ar/developers) — SDK oficial `mercadopago` (Checkout Pro + Webhooks) |
| Hosting | Vercel |

> **Nota:** el proyecto **no usa Tailwind CSS**. Los estilos están escritos a mano en `globals.css` y `logo-responsive.css`, usando variables CSS nativas para mantener una identidad visual consistente sin una capa de utilidades adicional.

## Arquitectura

### Modelo de datos

Tres tablas en Supabase, versionadas en `supabase/migrations/`:

- **`productos`** — catálogo. `stock_por_talle` es una columna `jsonb` (ej. `{"S": 8, "M": 12}`) que modela el stock disponible por talle.
- **`ordenes`** — una fila por intento de compra: `estado` (`pendiente` → `pagado` | `cancelado`) y `total`.
- **`orden_items`** — el detalle de cada orden (producto, talle, cantidad y precio unitario *al momento de la compra*).

**Row Level Security (RLS)** está activado en las tres tablas:

- `productos`: lectura pública (rol `anon`), escritura solo para usuarios autenticados (el admin).
- `ordenes` / `orden_items`: sin acceso público en absoluto — toda operación requiere rol `authenticated`.

El checkout público y el webhook de Mercado Pago son flujos **sin sesión de usuario** (nadie está logueado comprando, y Mercado Pago tampoco lo está), así que no pueden cumplir esa policy por sí solos. Para esos dos casos puntuales se usa un cliente de Supabase inicializado con la `service_role_key` (`src/lib/supabase/admin.js`), que bypassea RLS **de forma controlada**: la autorización ahí no depende de RLS sino de la validación que hace el propio código del servidor (recalcular precio y stock contra la base antes de cobrar, y verificar el pago real contra la API de Mercado Pago antes de escribir nada).

### Función SQL atómica (idempotencia de stock)

Confirmar un pago implica dos cosas que tienen que pasar juntas o no pasar ninguna: marcar la orden como `pagado` y descontar el stock de cada item. Eso vive en una única función PL/pgSQL (`supabase/migrations/0003_confirmar_pago.sql`):

```sql
create or replace function confirmar_pago_orden(p_orden_id uuid)
returns void
language plpgsql
as $$
declare
  item record;
  filas_actualizadas int;
begin
  update ordenes set estado = 'pagado' where id = p_orden_id and estado <> 'pagado';
  get diagnostics filas_actualizadas = row_count;

  if filas_actualizadas = 0 then
    return; -- ya estaba pagada (o no existe): no se vuelve a descontar stock
  end if;

  for item in
    select producto_id, talla, cantidad from orden_items where orden_id = p_orden_id
  loop
    update productos
    set stock_por_talle = jsonb_set(
      stock_por_talle, array[item.talla],
      to_jsonb(greatest(coalesce((stock_por_talle ->> item.talla)::int, 0) - item.cantidad, 0))
    )
    where id = item.producto_id;
  end loop;
end;
$$;
```

**Por qué importa:** Mercado Pago puede reintentar o duplicar la notificación de un mismo pago. El `UPDATE ... WHERE estado <> 'pagado'` toma un lock de fila a nivel de base de datos: si dos llamadas llegaran casi en simultáneo, solo la primera afecta una fila y descuenta stock — la segunda ve `0` filas afectadas y no hace nada. La idempotencia queda garantizada por Postgres, no únicamente por una validación del lado de la aplicación.

### Webhooks

`POST /api/webhook` nunca confía en el body de la notificación. El flujo es:

1. Filtra por `type`/`topic === "payment"` (ignora otros eventos, como `merchant_order`).
2. Con el `id` recibido, vuelve a consultar el pago **directo contra la API de Mercado Pago** (`GET /v1/payments/:id`) usando el Access Token.
3. Solo si esa respuesta dice `status === "approved"`, busca la orden por `external_reference` y llama a `confirmar_pago_orden`.
4. Cualquier error (orden no encontrada, fallo de red, etc.) se registra con `console.error`, pero el endpoint **siempre responde `200`** para no generar reintentos innecesarios de Mercado Pago.

## Estructura del proyecto

```
src/
├── app/
│   ├── admin/                    # Panel admin (login + CRUD de productos), protegido por proxy.js
│   ├── api/
│   │   ├── productos/            # CRUD de catálogo
│   │   ├── ordenes/               # CRUD de órdenes
│   │   ├── checkout/              # Crea la orden + la preferencia de Mercado Pago
│   │   └── webhook/               # Recibe y valida las notificaciones de pago
│   ├── producto/[id]/             # Detalle de producto
│   ├── productos/                 # Catálogo (con filtro por categoría)
│   ├── cart/                      # Carrito
│   ├── success | failure | pending/  # Vuelta del checkout de Mercado Pago
│   ├── components/                # Componentes de UI
│   ├── context/                   # CartContext (estado del carrito + localStorage)
│   └── hooks/                     # Hooks compartidos (ej. useScrolled)
├── lib/
│   ├── supabase/                  # Clientes de Supabase (browser, server, server component, admin)
│   ├── productos.js                # Mapeo DB → frontend + validación
│   ├── ordenes.js                  # Validación y creación de órdenes
│   ├── checkout.js                 # Validación del payload de checkout
│   ├── mercadopago.js              # Cliente del SDK de Mercado Pago
│   └── apiErrors.js                # Traduce errores de Postgres/RLS a respuestas HTTP
└── proxy.js                        # Protege /admin (reemplaza a "middleware.js" desde Next 16)

supabase/migrations/                # Esquema SQL + RLS + función de confirmación de pago
```

## Variables de entorno

Creá un archivo `.env.local` en la raíz del proyecto (ya está en `.gitignore` — **nunca se commitea**) con estas variables. El repositorio no provee ninguna: cada quien debe completarlas con sus propias credenciales de Supabase y Mercado Pago.

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Clave pública (`anon`), respeta RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor | Bypassea RLS — usada únicamente en `/api/checkout` y `/api/webhook` |
| `MERCADOPAGO_ACCESS_TOKEN` | Solo servidor | Crea preferencias de pago y consulta pagos contra la API de Mercado Pago |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Cliente (reservada) | Public key de Mercado Pago, lista para un futuro Checkout Bricks |
| `NEXT_PUBLIC_SITE_URL` | Servidor | URL base del sitio, usada en `back_urls` y `notification_url` de Mercado Pago |

> ⚠️ **`SUPABASE_SERVICE_ROLE_KEY` y `MERCADOPAGO_ACCESS_TOKEN` son secretos de servidor.** Nunca deben llevar el prefijo `NEXT_PUBLIC_`, nunca deben subirse al repositorio, y nunca deben compartirse en chats, issues o capturas de pantalla públicas.

## Instrucciones de setup

1. **Cloná el repo e instalá las dependencias:**

   ```bash
   git clone <url-del-repo>
   cd forme-store-next
   npm install
   ```

2. **Creá un proyecto en [Supabase](https://supabase.com/dashboard)** y copiá la URL y las API keys (`Project Settings → API`).

3. **Corré las migraciones SQL**, en orden, pegando el contenido de cada archivo de `supabase/migrations/` en el SQL Editor de Supabase:

   ```
   0001_init.sql            # esquema + RLS
   0002_seed.sql            # productos de ejemplo
   0003_confirmar_pago.sql  # función atómica de confirmación de pago
   ```

4. **Creá el usuario admin** manualmente: `Supabase Dashboard → Authentication → Users → Add user` (email + contraseña). Es el único login que existe para `/admin` — no hay alta pública.

5. **Conseguí credenciales de Mercado Pago** en [Developers → Tus integraciones](https://www.mercadopago.com.ar/developers/panel). Se recomienda usar las credenciales de **prueba** (prefijo `TEST-`) mientras se desarrolla, para no operar con dinero real.

6. **Completá `.env.local`** en la raíz del proyecto con las variables descriptas arriba.

7. **Levantá el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   Abrí [http://localhost:3000](http://localhost:3000).

## Flujo de checkout

```
Usuario en /cart
   │  click "FINALIZAR COMPRA"
   ▼
POST /api/checkout   { items: [{ id, talla, cantidad }] }   ← nunca se manda el precio
   │
   ├─ vuelve a buscar precio y stock REAL de cada producto en Supabase
   ├─ rechaza con 409 si no hay stock suficiente
   ├─ crea la orden ("pendiente") + sus items, con el precio verificado server-side
   └─ crea la preferencia en Mercado Pago (external_reference = id de la orden)
   ▼
Redirección del navegador a Mercado Pago (init_point)
   │  el usuario paga (o abandona) en el dominio de Mercado Pago
   ▼
Mercado Pago redirige de vuelta a /success, /failure o /pending
   (el carrito solo se vacía en /success; en /failure y /pending se conserva
    para que el usuario pueda reintentar la compra)

   ...en paralelo, de forma asincrónica...

Mercado Pago llama POST /api/webhook
   │
   ├─ ignora notificaciones que no son de tipo "payment"
   ├─ vuelve a consultar el pago contra la API de Mercado Pago (nunca confía en el body)
   ├─ si el pago está "approved", busca la orden por external_reference
   └─ llama a confirmar_pago_orden() → orden = "pagado" + stock descontado, todo atómico
```

La confirmación real de la compra (orden pagada y stock actualizado) **siempre depende del webhook**, nunca de que el navegador llegue a `/success` — el sistema queda consistente incluso si el usuario cierra la pestaña antes de volver al sitio.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Linter (ESLint) |

## Despliegue

El proyecto está desplegado en [Vercel](https://vercel.com/), con deploy automático en cada push a `main`. Las variables de entorno de la sección anterior deben configurarse también en **Vercel → Project Settings → Environment Variables** (no viajan por git) — ahí, `NEXT_PUBLIC_SITE_URL` debe ser el dominio público real (`https://...`), no `http://localhost:3000`.
