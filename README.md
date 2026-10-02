# Curiosiika · Tienda de detalles para fechas especiales

Tienda web de **Curiosiika** (cuadros personalizados, detalles, manualidades y curiosidades — San Vicente, Lima).
Los clientes eligen sus detalles, **separan la fecha en un calendario** usando solo su **número de celular** y todo se
confirma por **WhatsApp (912 470 219)**.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion (animaciones) · Supabase (base de datos, login y archivos).

---

## ✨ Qué incluye

### Web pública
| Página | Qué hace |
| --- | --- |
| `/` | Portada animada (cuadro con polaroids, foco, regalo; o tu video), próxima fecha especial con cuenta regresiva, categorías, destacados, línea de tiempo de fechas, “historia” animada del proceso, recordatorios y preguntas frecuentes. |
| `/tienda` | Catálogo con búsqueda, filtros por categoría y ocasión, y orden por precio. |
| `/producto/[slug]` | Galería de fotos + video, nota de personalización, “Agregar a mi lista”, “Separar ahora” y consulta por WhatsApp. |
| `/ocasiones` y `/ocasiones/[slug]` | Fechas reales del calendario peruano (San Valentín, Día de la Madre, Día del Padre, Día del Novio, Navidad…) con cuenta regresiva, ideas y productos de esa fecha. |
| `/calendario` | Calendario con disponibilidad en vivo (disponible / pocos cupos / completo / cerrado) y fechas especiales de los próximos 12 meses. |
| `/separar` | Separación en 4 pasos: lista → fecha → entrega y dedicatoria → nombre y celular. Genera un código (`CK-XXXXX`) y abre WhatsApp con el pedido completo. |
| `/personalizado` | Pedido 100 % a medida (idea, presupuesto, fecha) → WhatsApp. |
| `/mis-fechas` | El cliente guarda cumpleaños/aniversarios con su celular; tú le escribes por WhatsApp unos días antes. |
| `/seguimiento` | El cliente ve el estado de su pedido con código + celular. |

> El **celular es la identidad**: un número = una persona (sin cuentas ni contraseñas).
> Si la base de datos no responde, el pedido **igual** se envía por WhatsApp: nunca se pierde una venta.

### Panel `/admin`
- **Resumen:** pendientes, entregas de hoy y de la semana, próxima fecha especial, recordatorios cercanos.
- **Pedidos:** filtros por estado y fecha, detalle completo, cambio de estado y **mensaje de WhatsApp listo** para avisar al cliente. **Precios editables** (para lo que estaba “a cotizar”) y **registro de pagos** (adelanto / pagado completo) con mensajes de cobro listos.
- **Calendario:** pedidos por día, cerrar/abrir días (feriados, agenda llena).
- **Productos:** crear/editar con **subida de fotos y video**, precio (o “a cotizar”), ocasiones, destacados, stock, días de anticipación. Categorías editables.
- **Clientes:** historial por número de celular.
- **Recordatorios:** lista **“Por escribir”** (fechas de clientes en los próximos 7 días) con mensaje de WhatsApp listo; al enviarlo queda marcado. Contador en el menú + **campaña** para la próxima fecha especial.
- **Ajustes:** **Yape** (número, titular, QR y % de adelanto), WhatsApp, capacidad diaria, anticipación mínima, anuncio superior, redes y **video de portada**.
- **Respuesta rápida:** copia un mensaje con el link de la tienda o de un producto para responder en Facebook/Instagram.

---

## 🚀 Puesta en marcha (una sola vez)

### 1. Instalar
```bash
npm install
```
El archivo `.env.local` ya tiene la URL y la llave pública de tu proyecto Supabase.

### 2. Crear la base de datos
1. Entra a [supabase.com](https://supabase.com) → tu proyecto → **SQL Editor** → **New query**.
2. Copia **todo** el archivo [`supabase/schema.sql`](supabase/schema.sql), pégalo y pulsa **Run**.
   Crea las tablas, la seguridad (RLS), las funciones para separar pedidos y el espacio para fotos/videos.
   Puedes volver a ejecutarlo sin problema.

### 2b. Actualización de pagos (si tu base ya existía)
Si ejecutaste `schema.sql` antes del 2 de octubre de 2026, ejecuta también [`supabase/002_pagos_yape.sql`](supabase/002_pagos_yape.sql) en el SQL Editor (una vez). En instalaciones nuevas ya va incluido en `schema.sql`.

### 3. Crear tu acceso al panel
1. En Supabase → **Authentication → Users → Add user → Create new user**: tu correo y una contraseña (marca *Auto Confirm User*).
2. En el **SQL Editor** ejecuta (con tu correo):
   ```sql
   insert into public.admins (email) values ('TU_CORREO@gmail.com');
   ```

### 4. Arrancar
```bash
npm run dev
```
- Tienda: http://localhost:3000
- Panel: http://localhost:3000/admin

### 5. Cargar tu catálogo
En **Panel → Productos → Nuevo producto** sube **fotos reales** de tus trabajos (y si quieres un video corto tipo reel).
La web no trae productos inventados: la tienda muestra un estado elegante de “pronto” hasta que publiques los tuyos.

**Video de portada:** en **Panel → Ajustes** sube un video (MP4, máx. 50 MB). Puede ser un video real de tus detalles
o uno generado con IA a partir de tus fotos. Se reproduce dentro del cuadro animado de la portada.

---

## 🌐 Publicar en internet (Vercel, gratis)
1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repositorio.
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → tu dominio final (ej. `https://curiosiika.com`)
4. **Deploy**.

---

## 🎨 Personalizar
| Qué | Dónde |
| --- | --- |
| Nombre, textos de marca, WhatsApp por defecto | `src/lib/config.ts` |
| Fechas especiales (reglas, colores, ideas) | `src/lib/occasions.ts` |
| Colores y tipografías | `src/app/globals.css` (`@theme`) y `src/app/layout.tsx` |
| Logo | `public/brand/logo.webp` y `src/app/icon.png` |

El número de WhatsApp, la capacidad diaria y la anticipación también se cambian desde **Panel → Ajustes** sin tocar código.

## 🗂️ Estructura
```
src/
  app/(site)/        páginas públicas
  app/admin/         panel (login + secciones)
  components/        UI, portada, calendario, formularios, panel
  lib/               fechas (hora de Lima), ocasiones, WhatsApp, Supabase
  proxy.ts           protege /admin y refresca la sesión
supabase/schema.sql  base de datos completa
```
