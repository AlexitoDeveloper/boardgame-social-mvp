# 🎲 Boardgame Social MVP

Un escaparate gamificado y plataforma de encuentro para amantes de los juegos de mesa. Permite a los jugadores unirse a partidas ("Mesas Abiertas" creadas por "Masters"), organizar eventos locales, subir de nivel acumulando XP (Experiencia), desbloquear logros y diseñar/exportar sus propios rankings y Tier Lists de juegos de mesa.

---

## 🚀 Características Principales

### 1. ⚔️ Mesas Abiertas y Radar de Partidas
- **Buscador y Feed Activo:** Encuentra partidas de juegos de mesa creadas en tu zona. Filtros rápidos por estado, juego y fecha.
- **Radar Geográfico:** Vista interactiva de mesas cercanas con acceso directo en móviles mediante un Botón de Acción Flotante (FAB).
- **Detalle de Partidas:** Visualiza el juego a jugar, el "Master" (organizador), los jugadores apuntados y reserva plazas de invitados.
- **Chat en Tiempo Real:** Canal de chat dedicado por mesa para coordinar el punto de reunión y reglas, con notificaciones y soporte responsivo completo en móviles.

### 2. 👑 Escaparate y Perfil de Jugador (Gamificado)
- **Progresión de Niveles (XP):** Sube de nivel ganando XP por jugar (+100 XP), ganar (+250 XP), masterear (+150 XP) y crear rankings (+200 XP). Títulos de nivel dinámicos, desde *Novato del Meeple* 🌱 hasta *Mítico del Cartón* 👑.
- **Barra de Progreso Interactiva:** Desglose animado de fuentes de experiencia disponible mediante un desplegable de ayuda de XP.
- **Sistema de Logros (Achievements):** Desbloquea insignias especiales como *Gran Anfitrión*, *Espada de Victoria*, *Veterano Lúdico*, *Karma de Acero* o *Crítico del Tablero*. Cuenta con un panel interactivo de detalles que explica los requisitos para conseguir cada logro.
- **Métricas de Rendimiento:** KPIs visibles de tasa de victoria (Win Rate), partidas jugadas y porcentaje de asistencia (Karma).

### 3. 🎨 Creador de Rankings y Tier Lists (Tops Canvas)
- **Buscador Integrado con BoardGameGeek (BGG):** Busca e importa cualquier juego de mesa del mundo usando la API de BGG.
- **Bandeja de Arrastre:** Mantén tus juegos listos para clasificar.
- **Lienzo Interactivo:** Arrastra y suelta juegos en filas de categorías (Tiers S, A, B, C, D) o en un Top 10 tradicional.
- **Personalización Estética:** Cambia fondos con degradados dinámicos (Cyberpunk, Volcanic, Abyss, Space, Forest) y relaciones de aspecto de lienzo (Cuadrada, Vertical Story, Horizontal Landscape).
- **Exportación en un Clic:** Genera y descarga imágenes de alta calidad (PNG) usando `html-to-image` para compartir en Instagram, Twitter o WhatsApp.
- **Previsualización en Pantalla Completa:** Mira los rankings guardados en tu perfil a pantalla completa en móvil y tablet para una visualización limpia estilo app nativa.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React (hooks personalizados, context API), TypeScript, Vite.
- **Estilos y Animaciones:** Tailwind CSS, Framer Motion (para transiciones y micro-interacciones fluidas).
- **Base de Datos y Autenticación:** Supabase (PostgreSQL) con políticas de seguridad de nivel de fila (RLS) y listeners en tiempo real.
- **Integración BGG:** Supabase Edge Functions que procesan peticiones XML y devuelven respuestas JSON rápidas con guardado en caché (`games_cache`).
- **Renderizado de Imagen:** `html-to-image` para capturar el lienzo de rankings.
- **Despliegue:** Optimizado para Vercel (incluye reglas de reescritura para URLs SPA en `vercel.json`).

---

## 📂 Estructura del Proyecto

```
boardgame-social-mvp/
├── src/
│   ├── components/
│   │   ├── layout/            # AppShell y navegación del sitio
│   │   ├── meetup-detail/     # Chat, hero y paneles de detalle de mesas
│   │   ├── tops/              # Canvas, bandeja y buscador de rankings
│   │   └── ui/                # Componentes atómicos (Button, Card, Dialog...)
│   ├── hooks/                 # Lógica compartida (useTops, useMeetupChat...)
│   ├── lib/                   # Autenticación, cliente Supabase y mock fallbacks
│   ├── pages/                 # Páginas (Dashboard, Radar, Tops, Profile, Chats...)
│   ├── services/              # Cliente para la Edge Function de BGG
│   └── types/                 # Interfaces de TypeScript
├── supabase/
│   ├── migration files/       # Scripts SQL para inicializar esquemas, triggers e índices
│   └── functions/             # Supabase Edge Functions (bgg-search)
├── vercel.json                # Configuración de redirecciones SPA
└── package.json               # Configuración de dependencias de node
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
   Crea un archivo `.env` en la raíz del proyecto copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```
   Rellena las credenciales con tu servidor de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
4. **Ejecuta el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📦 Inicialización de Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Entra al editor SQL de Supabase y ejecuta los archivos ubicados en la carpeta `/supabase`:
   - `schema.sql` (crea tablas de usuarios, meetups, chats y cachés).
   - `add_user_rankings.sql` (habilita la persistencia de los rankings en el perfil).
3. Asegúrate de activar el soporte en tiempo real (Realtime) en la tabla `meetup_messages` para el chat.
4. Despliega la Edge Function para buscar juegos:
   ```bash
   supabase functions deploy bgg-search
   ```

---

## 🌐 Despliegue en Producción (Gratuito)

Este proyecto está configurado para desplegarse de manera totalmente gratuita:

- **Base de Datos:** El plan gratuito de **Supabase** cubre holgadamente la base de datos PostgreSQL, la autenticación de usuarios y el tráfico en tiempo real del chat.
- **Frontend:** Se recomienda **Vercel** por su integración con Vite. Gracias al archivo [vercel.json](vercel.json) incluido, las rutas SPA del navegador no romperán el refrescado de pantalla. Solo conecta tu repositorio de GitHub, añade las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, ¡y tu app estará lista para compartir en segundos!
