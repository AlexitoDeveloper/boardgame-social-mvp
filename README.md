# Boardgame Social MVP

Fase 1 del MVP: base de React + Vite conectada a Supabase y script SQL completo con RLS.

## Requisitos

- Node.js 20+
- Supabase project creado

## Setup local (pnpm)

Si `pnpm` no esta instalado globalmente, usa `npx pnpm`.

1. Instala dependencias:

```bash
npx pnpm install
```

2. Crea `.env` desde `.env.example` y completa:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Ejecuta desarrollo:

```bash
npx pnpm dev
```

## Base de datos

Ejecuta `supabase/schema.sql` en Supabase SQL Editor.

Incluye:

- Tablas: `users`, `games_cache`, `reviews`, `meetups`
- Indices de consulta para feed/radar
- Trigger para crear perfil automaticamente al registrarse en `auth.users`
- RLS con politicas seguras por rol y propiedad del registro

## Edge Function (Fase 2)

Se incluyo la funcion `bgg-search` en `supabase/functions/bgg-search/index.ts`.

Responsabilidades:

- Recibe `POST` con `{ "search": "..." }`
- Consulta BoardGameGeek XMLAPI2 (`search` + `thing`)
- Convierte XML a JSON
- Hace `upsert` en `games_cache`
- Devuelve `{ query, count, games }`

Variables requeridas en el entorno de la funcion:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Deploy (cuando tengas Supabase CLI instalado y logueado):

```bash
supabase functions deploy bgg-search
```

Invocacion desde frontend:

- Helper listo en `src/services/bggService.js` con `searchBoardGames(search)`.
