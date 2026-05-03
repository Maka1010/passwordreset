# Recuperación de contraseña (SchoolTask) — Supabase + Vercel

Flujo profesional usando **solo Supabase Auth** y páginas estáticas (**HTML/CSS/JS** + **supabase-js** vía **esm.sh**). Sin backend propio y sin sistema manual de tokens.

## Archivos

| Archivo            | Función                                                                     |
|--------------------|------------------------------------------------------------------------------|
| `forgot.html`      | Solicitud de correo (`resetPasswordForEmail`)                               |
| `reset.html`       | Pantalla nueva contraseña (`updateUser`), tras redirect del correo          |
| `styles.css`       | Diseño centrado (#FFFFFF / #F7F3EC / botones #E6D3B3)                       |
| `supabaseClient.js`| Cliente configurado por la build desde variables de entorno                 |

## Desarrollo local

1. Copia `.env.example` a `.env.local` y rellena tus valores:

   ```bash
   cp .env.example .env.local
   ```

2. Instala dependencias y genera `supabaseClient.js`:

   ```bash
   npm install
   npm run build
   ```

3. Sirve la carpeta con cualquier servidor estático (**HTTPS recomendado**). Ejemplo rápido con `npx serve` (solo pruebas):

   ```bash
   npx serve .
   ```

   En producción siempre HTTPS (Vercel lo incluye).

---

## Variables de entorno y Vercel (punto 6)

### Qué necesitas

- `SUPABASE_URL` — Ej: `https://abcdefgh.supabase.co`
- `SUPABASE_ANON_KEY` — Clave **anon** pública (no la `service_role`)

### Crear proyecto en Vercel

1. Repo con la carpeta `password-recovery` (o esta carpeta como raíz del repo).
2. **New Project → Import**.
3. **Root Directory** (si todo el mono-repo incluye también la app móvil):
   - Ajusta a la carpeta `password-recovery` para que el build use solo estos archivos.

### Inyectar variables

1. Vercel → tu proyecto → **Settings → Environment Variables**.
2. Añade:
   - **Name:** `SUPABASE_URL` · **Value:** tu URL · **Production** (y *Preview* si quieres).
   - **Name:** `SUPABASE_ANON_KEY` · **Value:** tu anon key · **Production** (y *Preview*).

### Comando de build

Este paquete define:

```json
"scripts": {
  "build": "node ./scripts/write-supabase-config.mjs",
  "vercel-build": "npm run build"
}
```

En Vercel, en **Settings → Build & Deployment**:

- **Build Command:** `npm run build` **o** deja por defecto si detecta automáticamente (puedes usar `vercel-build` explicitamente).
- **Output Directory:** **.** (directorio actual; son HTML estáticos en la raíz de esta carpeta).

Tras cada deploy, Vercel inyectará las variables durante `npm run build` y reescribirá `supabaseClient.js`.

**HTTPS:** Tu sitio debe servirse con HTTPS (`https://…`) para usar Auth de forma estándar y seguir buenas prácticas.

---

## Configuración en Supabase (punto 7)

### 1) Crear proyecto

1. [Supabase](https://supabase.com) → **New project**.
2. Anota **Project URL** y **anon public key** (Settings → API).

### 2) Auth activado

En **Authentication** el proveedor Email suele estar activo por defecto; confírmalo en **Providers**.

### 3) Site URL y Redirect URLs

1. Ve a **Authentication → URL Configuration**.
2. **Site URL:** la URL principal de usuarios cuando no hay redirect especial, ej.  
   `https://tu-app.vercel.app/` o la URL donde está `forgot.html`.
3. **Redirect URLs:** añade **exactamente** las URLs donde Supabase puede redirigir tras el clic en el correo, por ejemplo:

   ```text
   https://TU-DEPLOY.vercel.app/reset.html
   http://localhost:3000/reset.html
   ```

   También válido si sirves rutas sin `.html` según tu hosting; debe coincidir con lo que pasa **`redirectTo`** en `forgot.html` (este proyecto usa `./reset.html` resuelto a absoluto del mismo dominio).

### 4) Email de recuperación

En **Authentication → Email Templates → Reset password**:

- Opcionalmente ajusta asunto/texto/HTML del correo manteniendo el **enlace** que provee Supabase (no borres los tokens/incrustaciones que usa el sistema).
- Comprueba el remitente (SMTP configurado si usas uno propio).

### 5) Comportamiento de seguridad que ya tienes aquí

- Tras **`resetPasswordForEmail`**, siempre mismo mensaje al usuario cuando la petición llega bien (no revela si el correo existe).
- En error de servidor/red, mensaje neutro (“intenta más tarde”).
- Nueva contraseña mínimo 8 caracteres y confirmación igual en cliente; la sesión es la que entrega Supabase desde el correo.

---

## Conexión con la app móvil (punto 8)

### Flujo recomendado (lo que tienes montado ya)

1. En la app, el usuario toca **“Recuperar contraseña”** → se abre el navegador en **`forgot.html`** (URL pública en Vercel).
2. Introduce correo y recibe el email de Supabase.
3. Abre el enlace del correo (**sigue en navegador**); Supabase redirige a **`reset.html`** del mismo dominio.
4. Establece la nueva contraseña con **`updateUser`** → la app puede volver a **Login** con esa contraseña.

En el repo de Expo, establece:

`config/externalLinks.js` → `PASSWORD_RESET_WEB_URL = 'https://TU-DEPLOY.vercel.app/forgot.html'`

(Reemplaza por tu dominio real.)

### Alternativa con deep linking (opcional)

- Configura una **Universal Link / App Link** (iOS/Android) para un path tipo `https://tu-dominio.com/app/reset` que abra tu app cuando el usuario pulse el correo desde el móvil.
- Supabase igualmente debe tener esa URL permitida en **Redirect URLs**.
- Dentro de la app (React Native / Expo), usa **expo-auth-session**, **deep links** (`Linking`), o el flujo de **Supabase** para cliente nativo (**email callback** interceptado por la app). Esto ya es infraestructura nativa más avanzada: el mismo **Supabase Auth** sigue emitiendo la sesión cuando el cliente intercambia el código; la diferencia es *quién* navega (`WebView`/navegador vs app).

Para la primera versión en producción, el flujo **navegador → forgot → email → reset** es el más estable y compatible sin publicar binaries.

---

## Comprobaciones rápidas

- **`resetPasswordForEmail`** debe usar un `redirectTo` que exista literalmente en **Redirect URLs**.
- Producción solo **HTTPS**.
- La **anon key** en cliente es habitual; seguridad viene de **RLS** en base de datos y de las políticas de Auth; **nunca** expongas `service_role` en frontend.
