# 🎲 Boardgame Social MVP

Un escaparate gamificado y plataforma de encuentro para amantes de los juegos de mesa. Permite a los jugadores unirse a partidas ("Mesas Abiertas" creadas por "Masters"), organizar eventos locales o sesiones de juego en línea, subir de nivel acumulando XP (Experiencia) por sus hazañas lúdicas, desbloquear logros y diseñar/exportar sus propios rankings y Tier Lists de juegos de mesa.

---

## 🚀 Características Principales

### 1. ⚔️ Sesiones de Juego y Radar de Partidas
- **Buscador y Feed Activo:** Encuentra partidas de juegos de mesa creadas en tu zona con filtros rápidos por estado, juego y fecha.
- **Radar Geográfico:** Vista interactiva de mesas cercanas con acceso directo en móviles mediante un Botón de Acción Flotante (FAB).
- **Sesiones Multijuego (1:N):** Transición del modelo original de "un juego por mesa" a **Sesiones Completas**. Un evento puede albergar múltiples juegos de mesa (por ejemplo, juegos base, *fillers*, expansiones) o quedar marcado como "Por decidir en el chat".
- **Modalidad Presencial u Online:** Selector al crear el evento para elegir entre modalidad física (localización en mapa) u online (Board Game Arena, TTS, etc.), que habilita campos específicos de plataforma y enlace de canal de voz (Discord/Meet).
- **Carrusel Deslizable en Mobile:** Las portadas de los juegos integran un carrusel táctil interactivo en las tarjetas de lista y el detalle de la partida, permitiendo **deslizar (swipe)** de forma fluida para ver los juegos planificados en la sesión.
- **Invitados "Shadow":** Facilita que los usuarios reserven plaza en una mesa añadiendo acompañantes e invitados indicando únicamente su nombre, sin necesidad de que tengan un registro de cuenta en la plataforma.
- **Chat Activo en Tiempo Real:** Canal de mensajes en tiempo real dentro del detalle de cada meetup con notificaciones automáticas y soporte responsivo móvil completo.

### 2. 👑 Perfil de Jugador Gamificado e Historial
- **Progresión de Niveles (XP):** Sube de nivel ganando XP por tus actividades lúdicas: jugar (+100 XP), ganar (+250 XP), masterear/organizar (+150 XP) y crear rankings (+200 XP). Títulos de nivel dinámicos desde *Novato del Meeple* 🌱 hasta *Mítico del Cartón* 👑 con un desglose animado de fuentes de experiencia.
- **Cierre de Partida e Historial:** Flujo interactivo para que el creador cierre la partida, registrando la asistencia real, el cálculo de Karma (tasa de asistencia) y marcando los ganadores de cada juego disputado en la sesión.
- **Sistema de Logros (Achievements):** Desbloquea insignias especiales como *Gran Anfitrión*, *Espada de Victoria*, *Veterano Lúdico*, *Karma de Acero* o *Crítico del Tablero* con un panel interactivo con los requisitos detallados.

### 3. 🎨 Creador de Rankings y Tier Lists (Tops Canvas)
- **Lienzo Interactivo Drag & Drop:** Arrastra y suelta juegos en filas de categorías (Tiers S, A, B, C, D) o en un Top 10 tradicional.
- **Personalización Estética:** Cambia fondos con degradados dinámicos (Cyberpunk, Volcanic, Abyss, Space, Forest) y relaciones de aspecto de lienzo (Cuadrada, Vertical Story, Horizontal Landscape).
- **Exportación Directa:** Genera y descarga imágenes de alta calidad (PNG) sin marca de agua para compartir directamente en redes sociales.

### 4. 📥 Ingesta Automatizada y Catálogo de BGG
- **Buscador Integrado con BoardGameGeek (BGG):** Consulta juegos en tiempo real mediante la Edge Function de búsqueda.
- **Ingestor por Lotes Programado (`bgg-ingest`):** Script CLI y Edge Function programada que descargan secuencialmente el catálogo completo de BGG evitando bloqueos de IP.
- **Detección de Edición en Español:** Filtra el nodo `versions` de BGG para extraer la editorial española y priorizar el arte y título de la edición nacional.
- **CDN y Almacenamiento Local de Portadas:** Descarga las imágenes de BGG, las optimiza y redimensiona (mediante `Jimp`) y las sube a un bucket público de Supabase Storage (`game-covers`) para servirlas a máxima velocidad desde su propio CDN.
- **Gestión de Expansiones y Juegos Base:** Estructura jerárquica que enlaza expansiones con su juego base (`base_game_id`), permitiendo seleccionar y desplegar expansiones al crear partidas de un juego principal.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite, React Router DOM v7.
- **Estilos y Animaciones:** Tailwind CSS, Framer Motion (para transiciones y arrastres multitáctiles en carruseles y rankings).
- **Base de Datos y Autenticación:** Supabase (PostgreSQL) con políticas de seguridad de nivel de fila (RLS) y canales en tiempo real.
- **Procesamiento de Imagen:** `html-to-image` en el cliente y `Jimp` (Node/Deno) en la Edge Function para el reescalado y optimización de portadas a JPG.
- **Automatizaciones y Cron:** Extensiones `pg_cron` y `pg_net` de Supabase para la ejecución por lotes periódica del script ingestor.

---

## 📂 Estructura del Proyecto

```
boardgame-social-mvp/
├── .github/workflows/             # Workflows de GitHub Actions (Ingesta de BGG)
├── scripts/
│   └── ingest-bgg.cjs             # Script Node.js local de ingesta por lotes
├── src/
│   ├── components/
│   │   ├── layout/                # AppShell y navegación del sitio
│   │   ├── meetup-detail/         # Chat, hero y paneles de detalle de mesas
│   │   ├── tops/                  # Canvas, bandeja y buscador de rankings
│   │   └── ui/                    # Componentes base (Button, Card, Dialog...)
│   ├── hooks/                     # Custom Hooks (useTops, useMeetupChat...)
│   ├── lib/                       # Configuración global, authContext y supabaseClient
│   ├── pages/                     # Vistas (Radar, Tops, Profile, Chats...)
│   ├── services/                  # Servicios de comunicación con APIs / BD (bggService)
│   └── types/                     # Tipados de TypeScript
├── supabase/
│   ├── functions/                 # Supabase Edge Functions (bgg-search y bgg-ingest)
│   ├── *.sql                      # Scripts SQL incrementales de migración
│   └── schema.sql                 # Esquema base inicial de la base de datos
├── vercel.json                    # Reglas SPA para despliegue en Vercel
└── package.json                   # Dependencias de npm/pnpm
```

---

## 🚀 Instalación y Setup Local

### Requisitos previos
- Node.js versión 20 o superior.
- Gestor de paquetes `pnpm` (o `npm`).

### Pasos
1. **Clona el repositorio** e ingresa a la carpeta del proyecto.
2. **Instala las dependencias:**
   ```bash
   pnpm install
   ```
3. **Configura el entorno:**
   Crea un archivo `.env` en la raíz copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```
   Rellena las credenciales de tu proyecto Supabase:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
4. **Ejecuta el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```

### Ejecutar Ingesta de Juegos Local
Puedes alimentar la base de datos de juegos ejecutando el script CLI desde la raíz:
```bash
# Limita la ingesta a los primeros 100 juegos de BGG
node scripts/ingest-bgg.cjs --limit=100
```

---

## 📦 Inicialización de Base de Datos (Supabase)

Asegúrate de aplicar los scripts SQL de la carpeta `/supabase` en tu SQL Editor en el siguiente orden para preparar el esquema completo:

1. `schema.sql` (Esquema inicial de perfiles de usuario, juegos y quedadas).
2. `add_user_rankings.sql` (Persistencia de rankings y tops).
3. `add_meetup_guests.sql` (Soporte para invitados shadow).
4. `add_meetup_chat.sql` (Tablas y permisos para el chat de quedadas).
5. `add_online_meetup_modality.sql` (Campos para modalidad online y plataformas).
6. `add_multigame_sessions.sql` (Soporte multijuego 1:N y tabla intermedia).
7. `add_bgg_catalog_ingestion_fields.sql` (Campos adicionales de edición en español y expansiones).
8. `create_storage_bucket_covers.sql` (Bucket para almacenar las portadas de juegos localmente).
9. `close_meetup_and_profile_stats.sql` (Cálculo de Karma, XP y estadísticas del perfil).
10. `add_meetup_games_winners.sql` (Soporte de ganadores múltiples por sesión).
11. `schedule_bgg_ingest.sql` (Automatización por lotes horaria/diaria con `pg_cron` y `pg_net`).

### Despliegue de Edge Functions
Inicia sesión en la CLI de Supabase y despliega las funciones:
```bash
supabase functions deploy bgg-search
supabase functions deploy bgg-ingest
```

Configura las variables de entorno necesarias en Supabase:
- `BGG_API_KEY` (opcional, si tienes un token de la API de BGG).
- Asegúrate de que las variables del sistema `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén disponibles en la pestaña de Edge Functions.

---

## ⚖️ Atribución de Datos

Esta aplicación hace uso de la API XML2 de BoardGameGeek. Los datos de los juegos de mesa, años de publicación, duraciones, número de jugadores y portadas originales son propiedad de sus respectivos autores y editoriales, provistos mediante la base de datos abierta de [BoardGameGeek](https://boardgamegeek.com).
