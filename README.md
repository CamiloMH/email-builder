# Constructor de Email Templates

Herramienta web para diseñar correos electrónicos responsivos mediante un constructor visual por bloques. Permite arrastrar, ordenar y configurar secciones del email, previsualizar el resultado en tiempo real y exportarlo en varios formatos (HTML, texto plano, componente React, Handlebars, `.eml` y JSON), sin necesidad de escribir código.

## Para qué sirve

El usuario puede componer un email combinando bloques predefinidos —encabezado, texto, imagen, botón, tarjeta, divisor, espaciador, columnas, redes sociales y pie de página— y personalizarlo con una paleta de colores y tipografía propias. Cada bloque tiene sus propias opciones (alineación, estilo del botón, fondo de la tarjeta, etc.). La vista previa es idéntica al archivo exportado, tanto en escritorio como en móvil.

Cada visitante accede sin registro. En la versión actual las plantillas se guardan en el propio navegador (`localStorage`), por lo que son privadas de cada dispositivo.

## Cómo está construido

El proyecto es un monorepo con dos aplicaciones y dos paquetes compartidos:

```
apps/
  frontend/   SPA (React 19 + Vite) — constructor visual por bloques (app principal)
  backend/    API REST (NestJS 11) — persistencia en servidor  ·  próxima versión
packages/
  core/       @email/core   — modelo de dominio con Zod (tipos, esquemas, factories)
  emails/     @email/emails — componentes react-email y motor de render
```

> **Nota sobre el backend (próxima versión).** La versión actual funciona **sin backend**: el frontend es una SPA estática que guarda las plantillas en el navegador (`localStorage`) y genera la exportación en el cliente con `@email/emails`; el envío de correos de prueba usa una función _serverless_ (`apps/frontend/api/send-test.ts`, Resend). El backend NestJS —persistencia en servidor, multiusuario, API pública documentada con Scalar en `/reference`— está incluido en el repositorio pero **se habilitará en la siguiente versión** para sincronización entre dispositivos y cuentas reales.

El modelo de dominio (`@email/core`) y el motor de render (`@email/emails`) son la única fuente de verdad: el frontend los usa tanto para la vista previa en vivo como para la exportación, evitando duplicar lógica entre capas.

## Stack

| Capa       | Tecnologias                                                        |
| ---------- | ------------------------------------------------------------------ |
| Monorepo   | pnpm workspaces, Turborepo                                         |
| Backend    | NestJS 11, TypeORM, MariaDB (mysql2), Scalar                       |
| Frontend   | React 19, Vite, Tailwind CSS, Zustand, TanStack Query, dnd-kit     |
| Emails     | @react-email/components, @react-email/render                       |
| Validacion | Zod                                                                |
| Pruebas    | Vitest + React Testing Library (frontend y paquetes), Jest (backend)|
| Tooling    | TypeScript 5, ESLint 9 (flat config), Prettier, Husky, commitlint  |

## Primeros pasos

Requiere **Node >= 20** y **pnpm**.

```bash
pnpm install
pnpm dev          # solo el frontend (app actual)
pnpm dev:full     # frontend + backend (próxima versión)
pnpm build        # compila paquetes y apps
pnpm test         # ejecuta todas las suites de pruebas
pnpm test:cov     # pruebas con reporte de cobertura
pnpm lint
pnpm typecheck
pnpm format
```

### Backend con Docker (próxima versión)

> Estos pasos aplican al backend NestJS, que **se habilitará en la siguiente versión**. La app actual no lo necesita.

Solo la base de datos:

```bash
docker compose up -d mariadb   # MariaDB en localhost:3306
cp apps/backend/.env.example apps/backend/.env
pnpm dev:full
```

Stack completo:

```bash
docker compose up --build
```

Levanta MariaDB, el backend en `localhost:3005` (Scalar en `/reference`), el frontend en `localhost:8080` y Adminer en `localhost:8081`.

## Despliegue

La versión actual se despliega como **sitio estático + una función serverless** (p. ej. en Vercel), sin servidor ni base de datos:

- **Frontend**: build estático del SPA (`apps/frontend`). Las plantillas viven en `localStorage` y la exportación se genera en el cliente.
- **Email**: la función `apps/frontend/api/send-test.ts` envía con Resend. Configura `RESEND_API_KEY` y `MAIL_FROM` como variables de entorno del proveedor (sin la key, el envío es no-op). Incluye _rate limit_ por IP.

En Vercel: importa el repo con **Root Directory = `apps/frontend`** y define `RESEND_API_KEY`/`MAIL_FROM` en las variables de entorno del proyecto.

## Licencia

MIT
