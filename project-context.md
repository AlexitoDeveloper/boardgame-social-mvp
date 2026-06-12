# Contexto del Proyecto: Boardgame Social MVP

Este documento sirve como referencia centralizada para entender de qué trata el proyecto, las tecnologías que utiliza, su arquitectura, base de datos y las funcionalidades implementadas. **Deberá actualizarse de forma incremental** conforme se añadan, modifiquen o eliminen funcionalidades.

---

## 1. Descripción del Proyecto

**Boardgame Social MVP** es una red social y punto de encuentro (MVP - Producto Mínimo Viable) diseñado para amantes de los juegos de mesa. Su objetivo principal es facilitar a los jugadores la organización de partidas locales y la búsqueda de compañeros de juego en sus ciudades (Radar Local).

---

## 2. Stack Tecnológico

El proyecto está construido utilizando tecnologías modernas de desarrollo web frontend y backend serverless:

### Frontend
- **Framework Core**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) (para un entorno de desarrollo ultra-rápido).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para tipado estricto y robustez del código.
- **Enrutado**: [React Router DOM v7](https://reactrouter.com/) para la navegación SPA.
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) v3 para el diseño responsivo e interactivo.
- **Componentes de Interfaz**: [Radix UI](https://www.radix-ui.com/) y primitivas de Shadcn UI (popover, calendar, dialogs, form, etc.).
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones dinámicas y micro-animaciones fluidas.
- **Iconografía**: [Lucide React](https://lucide.dev/) para iconos consistentes y vectoriales.
- **Formularios y Validación**: [React Hook Form](https://react-hook-form.com/) junto con [Zod](https://zod.dev/) para esquemas de validación de datos de entrada.

### Backend y Base de Datos
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com/)
  - **Base de Datos**: PostgreSQL.
  - **Autenticación**: Supabase Auth (correo/contraseña, metadatos de usuario).
  - **Seguridad**: Row Level Security (RLS) policies para control de accesos granular a nivel de fila.
  - **Lógica de Base de Datos**: Triggers de PostgreSQL y PL/pgSQL para la automatización de procesos (creación automática de perfiles de usuario).
  - **Serverless**: Supabase Edge Functions para integraciones externas seguras.
- **APIs de Terceros**:
  - **BoardGameGeek (BGG) XMLAPI2**: Integrada mediante una Edge Function para buscar y obtener metadatos de juegos directamente desde la base de datos de BGG.

---

## 3. Arquitectura y Estructura del Código

El proyecto sigue una estructura limpia y modularizada:

```text
boardgame-social-mvp/
├── supabase/                      # Configuración de base de datos y Edge Functions
│   ├── functions/                 # Funciones Serverless de Supabase
│   │   └── bgg-search/            # Consulta de juegos en BoardGameGeek XMLAPI2
│   └── schema.sql                 # Estructura de tablas, triggers, RLS y accesos SQL
├── src/
│   ├── assets/                    # Recursos estáticos (imágenes, logos, etc.)
│   ├── components/                # Componentes reutilizables
│   │   ├── layout/                # Estructura del layout principal (AppShell)
│   │   ├── meetup-detail/         # Componentes específicos del detalle de meetup
│   │   └── ui/                    # Componentes base e interfaces comunes (Botones, inputs, etc.)
│   ├── hooks/                     # Custom Hooks de React (Extracción de lógica de negocio)
│   │   └── useMeetupDetail.ts     # Control del estado, asistentes, contador y acciones de Meetups
│   ├── lib/                       # Utilidades de configuración global
│   │   ├── authContext.tsx        # Proveedor y hook de autenticación en Supabase
│   │   ├── mockData.ts            # Datos mock de respaldo si falla la conexión a BD
│   │   ├── supabaseClient.ts      # Cliente de inicialización de Supabase
│   │   └── useTheme.ts            # Gestión y persistencia del tema oscuro/claro
│   ├── pages/                     # Páginas / Vistas completas de la aplicación (AuthPage, RadarPage, CreateMeetupPage, MeetupDetailPage)
│   ├── services/                  # Servicios de comunicación con APIs / BD
│   │   └── bggService.ts          # Integrador frontend con la Edge Function bgg-search
│   ├── types/                     # Interfaces y tipos de TypeScript globales
│   │   └── index.ts               # Definición de tipos (User, Game, Meetup)
│   ├── App.tsx                    # Enrutador principal y distribución de páginas
│   ├── index.css                  # Estilos globales y tokens del tema
│   └── main.tsx                   # Punto de entrada de la aplicación
├── project-rules.md               # Normas, estándares y guías de desarrollo
└── project-context.md             # Este archivo
```

---

## 4. Funcionalidades del MVP (Módulos)

### 4.1. Autenticación (`AuthPage.tsx` / `authContext.tsx`)
- Permite el registro de usuarios y el inicio de sesión a través de Supabase Auth.
- La sesión se mantiene de manera persistente.
- Al registrarse, se dispara un trigger en la base de datos (`on_auth_user_created`) que crea un registro correspondiente en la tabla pública `users`, guardando su `username` inicial.
- Las páginas restringidas (crear quedada) están envueltas en un componente `ProtectedRoute` que redirige a `/auth` si no hay sesión activa.

### 4.2. Radar Local - Reuniones / Meetups (`RadarPage.tsx` / `MeetupDetailPage.tsx` / `CreateMeetupPage.tsx`)
- **Radar (`RadarPage.tsx`)**: Página de inicio del proyecto (ruta `/`). Buscador y visualizador de quedadas planificadas en el futuro. Filtra por fecha (solo quedadas futuras) e incluye un botón rápido para unirse o abandonar la quedada de forma inmediata.
- **Detalle de Reunión (`MeetupDetailPage.tsx`)**: Visualización detallada de la quedada que incluye:
  - Información del juego de mesa consultado (jugadores recomendados, tiempo, año, etc.).
  - Mapa de ubicación y descripción.
  - Temporizador de cuenta atrás dinámico hasta el inicio del evento.
  - Lista de asistentes con avatares (con el organizador en primera posición).
  - Funcionalidad de "Compartir" que usa la Web Share API en dispositivos móviles o copia el enlace al portapapeles.
  - Botón de "Unirse" / "Salir" coordinado con la base de datos.
  - Botón de "Cancelar Reunión" exclusivo para el creador del evento.
- **Creación / Edición (`CreateMeetupPage.tsx`)**: Formulario interactivo para crear una nueva quedada o editar una existente. Incluye selección del juego (con búsqueda en la API de BGG), ciudad, ubicación, fecha/hora, límite de jugadores y descripción.

### 4.3. Soporte de Tema Oscuro (`useTheme.ts`)
- Sistema de tema Dual (Claro / Oscuro) persistido en `localStorage` y sincronizado con las preferencias del sistema operativo del usuario.
- Agrega/remueve la clase `.dark` del elemento `<html>` para activar las variables de Tailwind CSS correspondientes.

---

## 5. Modelo de Datos y Seguridad (Supabase)

La base de datos PostgreSQL contiene 3 tablas principales con relaciones definidas y políticas RLS activas:

### Tablas

1. **`users`**:
   - `id` (uuid, clave primaria, referencia a `auth.users`).
   - `username` (text, único, obligatorio).
   - `avatar_url` (text, opcional).
   - `city` (text, opcional).
   - `created_at` / `updated_at`.
2. **`games_cache`**:
   - `bgg_id` (integer, clave primaria, ID oficial de BoardGameGeek).
   - `title` (text, obligatorio).
   - `year` (integer, opcional).
   - `image_url` (text, opcional).
   - `created_at` / `updated_at`.
3. **`meetups`**:
   - `id` (uuid, clave primaria).
   - `creator_id` (uuid, clave foránea a `users`).
   - `game_id` (integer, clave foránea a `games_cache`).
   - `title` (text, obligatorio).
   - `description` (text, opcional).
   - `city` (text, obligatorio).
   - `location` (text, obligatorio).
   - `date` (timestamptz, obligatorio).
   - `max_players` (integer, constraint entre 2 y 50).
   - `joined_players` (array de uuids, guarda los IDs de los asistentes).
   - `created_at` / `updated_at`.
   - *Constraint*: La cantidad de elementos en `joined_players` no puede exceder `max_players`.

### Políticas RLS (Row Level Security)
- **`users`**: Lectura libre para cualquier usuario. Modificación/eliminación restringida únicamente al propietario del perfil (`id = auth.uid()`).
- **`games_cache`**: Lectura libre para cualquier usuario. Escritura permitida exclusivamente por el rol de servicio (`service_role`) para que las Edge Functions registren juegos buscados de forma segura.
- **`meetups`**: Lectura libre. Inserción y eliminación permitidas sólo al creador (`creator_id = auth.uid()`). Actualizaciones permitidas para usuarios autenticados para que puedan sumarse/restarse en la lista de jugadores.

---

## 6. Edge Functions

### `bgg-search`
- **Ruta**: `supabase/functions/bgg-search/index.ts`
- **Lógica**:
  1. Recibe un término de búsqueda (`search`).
  2. Consulta la API XML de BoardGameGeek (`https://boardgamegeek.com/xmlapi2/search?type=boardgame&query=...`).
  3. Procesa los detalles extendidos de los juegos de mesa (`https://boardgamegeek.com/xmlapi2/thing?id=...`).
  4. Transforma la respuesta XML a un JSON unificado.
  5. Realiza un `upsert` seguro en la tabla `games_cache` utilizando las credenciales de `service_role`.
  6. Retorna el listado de juegos estructurado.

---

## 7. Instrucciones para Desarrollo y Despliegue

### Requisitos Previos
- Node.js versión 20 o superior.
- Gestor de paquetes `pnpm` instalado.

### Configuración del Entorno Local
1. Copiar el archivo `.env.example` como `.env` o `.env.local`:
   ```bash
   cp .env.example .env
   ```
2. Completar las variables de entorno necesarias:
   - `VITE_SUPABASE_URL`: Endpoint de tu proyecto de Supabase.
   - `VITE_SUPABASE_ANON_KEY`: API Key pública (anon) del proyecto.

### Ejecución del Proyecto
1. Instalar dependencias:
   ```bash
   pnpm install
   ```
2. Ejecutar servidor de desarrollo local:
   ```bash
   pnpm dev
   ```
3. Construir para producción:
   ```bash
   pnpm build
   ```

### Despliegue de Base de Datos y Funciones
1. Ejecutar el contenido de `supabase/schema.sql` en el SQL Editor de tu panel de Supabase.
2. Iniciar sesión en la CLI de Supabase y desplegar la Edge Function:
   ```bash
   supabase functions deploy bgg-search
   ```
3. Configurar los secretos `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en la sección de funciones de Supabase.

---

## 8. Historial de Cambios en Contexto

*Cada desarrollador o agente de IA que incorpore, altere o remueva características esenciales del proyecto debe registrar una entrada en esta tabla:*

| Fecha | Autor | Tipo de Cambio | Descripción del Cambio / Funcionalidad Modificada |
| :--- | :--- | :--- | :--- |
| 2026-06-11 | Antigravity AI | Creación | Creación del documento inicial de contexto del proyecto. |
| 2026-06-11 | Antigravity AI | Eliminación | Eliminación de las funcionalidades de Reseñas y Perfil público. |
| 2026-06-11 | Antigravity AI | Actualización | Inclusión del Roadmap de Desarrollo de 3 Fases y reglas de ramificación. |

---

## 9. Roadmap de Desarrollo por Fases

El desarrollo del proyecto se realizará de forma incremental dividiéndose en las siguientes fases:

### FASE 1: VIRALIDAD Y ADQUISICIÓN (Traer gente)
*Objetivo: Que la app se promocione orgánicamente mediante contenido interactivo y compartible.*
- **[ ] Generador de "Tops/Tier Lists":** Pantalla para buscar juegos en nuestra base de datos local (`games`), ordenarlos de forma interactiva (ej. Tiers S, A, B, C o Top 1-10) y exportar una imagen nativa y estética (con el logo y estilo de la app) lista para compartir en Instagram/TikTok.
- **[ ] Invitados "Shadow":** Permitir que los usuarios reserven plaza en una meetup poniendo solo su nombre, sin necesidad de registro completo inicial. Se invitará a crear una cuenta después. Requiere una tabla nueva `meetup_guests`.

### FASE 2: RETENCIÓN Y UTILIDAD (Que se queden)
*Objetivo: Aumentar el valor de la app para el usuario frecuente en su día a día.*
- **[ ] Mi Ludoteca (Importador BGG):** Botón para importar la colección desde BoardGameGeek usando el nombre de usuario de BGG, poblando automáticamente la base de datos personal. Requiere la tabla `user_collection` y manejo del estado síncrono/asíncrono (HTTP 202) de la API de BGG.
- **[ ] Chat Activo por Partida:** Canal de mensajes en tiempo real dentro del detalle de cada meetup para la coordinación de los asistentes. Se implementará usando Supabase Realtime y políticas RLS avanzadas.

### FASE 3: PULIDO Y MONETIZACIÓN (Sostenibilidad)
*Objetivo: Añadir vías de ingresos pasivos y mejorar la experiencia de usuario final.*
- **[ ] Afiliación Transparente:** Botón de "Comprar" en la ficha del juego con enlaces de referido enlazando a Amazon o tiendas colaboradoras.
- **[ ] Filtros "Matchmaking":** Buscador avanzado de eventos locales filtrando por categorías y mecánicas de juegos de mesa guardadas en caché.
- **[ ] Historial y Cierre (Bucle Viral):** Posibilidad de marcar una quedada como "Completada", seleccionar ganadores/puntuaciones y generar una imagen resumen para compartir en redes.

