# ROADMAP DEL PROYECTO

### FASE 1: VIRALIDAD Y ADQUISICIÓN (Traer gente)

_Objetivo: Que la app se promocione orgánicamente mediante contenido interactivo y compartible._

- [x] **[GRATIS] Generador de "Tops/Tier Lists" Básico:** Pantalla para buscar juegos en la base de datos local (`games`), ordenarlos de forma interactiva y exportar una imagen nativa y estética (con el logo y estilo de la app) lista para compartir en redes.
- [x] **[GRATIS] Invitados "Shadow":** Permitir que los usuarios reserven plaza en una meetup poniendo solo su nombre, sin necesidad de registro completo inicial. Gestión en tabla `meetup_guests`.
- [x] **[PREMIUM] Generador de Tops "Pro":** Funcionalidad opcional para exportar las Tier Lists sin marca de agua, con fondos personalizados en alta resolución y formatos adaptados.

### FASE 2: RETENCIÓN Y UTILIDAD (Que se queden)

_Objetivo: Aumentar el valor de la app para el usuario frecuente en su día a día y construir su identidad._

- [x] **[INFRAESTRUCTURA] Ingesta Automática del Catálogo (Script BGG con canonicalname):** Script de migración (_scheduler_ diario) para descargar el catálogo de BGG por lotes, evitando baneos de IP. Incluye la conversión de XML a JSON y la descarga de las portadas físicas a Supabase Storage para servir desde CDN propio.
- [x] **[GRATIS] Soporte de Ediciones en Español (Extracción de editoriales):** Lógica en el script de ingesta para leer el nodo `versions`, extrayendo la editorial española y priorizando la descarga de la portada de la edición nacional.
- [x] **[GRATIS] Gestión de Expansiones y Juegos Base (Columna base_game_id):** Modificación de la tabla `games` (columna `base_game_id`) para relacionar expansiones. En la creación de eventos, permitir desplegar y seleccionar las expansiones asociadas al juego base elegido.
- [x] **[LEGAL] Atribución Legal de Datos BGG:** Inclusión de un texto discreto ("Datos proporcionados por BoardGameGeek") en el _footer_, perfil o vista de juego para cumplir estrictamente con los Términos de Servicio de la API.
- [x] **[GRATIS] Mi Ludoteca (Importador BGG):** Botón para importar la colección desde BoardGameGeek usando el nombre de usuario de BGG, poblando automáticamente la base de datos personal. Requiere la tabla `user_collection` y manejo del estado síncrono/asíncrono de la API de BGG.
- [x] **[GRATIS] Chat Activo por Partida:** Canal de mensajes en tiempo real dentro del detalle de cada meetup para la coordinación de los asistentes. Centralizado en una página dedicada con badges de notificaciones.
- [x] **[GRATIS] Escaparate de Jugador (Perfil Gamificado):** Perfil rediseñado con sistema de experiencia (XP) con desglose de rates, rango de jugador (Novato, Maestro, Leyenda), vitrina de logros interactiva y visualización/descarga de rankings guardados.
- [x] **[GRATIS] Cierre de Partida e Historial:** Registro de asistencia real, cálculo de karma y ganador en el cierre de meetups (asociado a iconos de espadas de victoria, no coronas).
- [x] **[GRATIS] Modalidad de Partida "Online":** Selector al crear el evento para elegir entre modalidad presencial u online (Board Game Arena, TTS, etc.), ocultando el campo de ubicación física y añadiendo campos para la plataforma y el enlace de voz (Discord/Meet).
- [x] **[GRATIS] Sesiones Multijuego (Relación 1:N en meetups):** Transición del modelo "1 partida = 1 juego" a un modelo de "Sesión". Modificación de la tabla de meetups para aceptar un array de juegos (relación 1:N) y adaptación del flujo para permitir decidir el juego en el chat o registrar varios _fillers_ distintos bajo un mismo evento.

### FASE 3: PULIDO Y GAMIFICACIÓN (BASE COMPLETADA)
- [x] **Dashboard de Exploración (Estilo Netflix):** Carruseles temáticos, portadas optimizadas, filtro por jugadores, complejidad e idioma en español.
- [x] **Ficha de Juego Viva:** Metadatos BGG, expansiones relacionadas, dueños en la comunidad y registro de partidas.
- [x] **Ludoteca de Grupo (Piedra Angular):** Creación de grupos cerrados con código de invitación, fusión de colecciones y encuestas básicas.
- [x] **Generador de Tops / Tier Lists:** Creación y exportación de rankings visuales para RRSS.
- [x] **Exportación de Resumen de Partida:** Tarjeta visual de ganador y puntos con temas estéticos.

---

### NUEVA ETAPA: PIVOT HACIA "TABLE COMPANION" (EL ASISTENTE DE MESA)

_Objetivo Estratégico: Eliminar la dependencia del "Radar de desconocidos" (evitando el síndrome del pueblo fantasma de Meeplay) y convertir la app en la herramienta indispensable para tu grupo habitual de juego cada fin de semana._

> **Dirección Artística y Visual: "The Grand Game Mat" (Neopreno Medianoche & Tapete Esmeralda)**
> - **Atmósfera:** Tapete de juego profesional de neopreno de alta gama donde los componentes y las portadas cobran vida visual sin distracciones.
> - **Paleta de diseño:** Fondo pizarra medianoche profundo (`#0A0F1D`), acento verde esmeralda vivo (`#10B981` / energía de juego activo y victoria). Sin similitud con Plex.
> - **Stack visual y cinético:** `framer-motion` para inercia, física de cartas y resortes elásticos, feedback háptico en móviles (`navigator.vibrate`), `canvas-confetti` temático y `react-countup` para contadores numéricos (estrictamente sin efectos sonoros).

#### FASE 1: PODA DE NAVEGACIÓN, ONBOARDING Y SANEAMIENTO DE FLUJOS (COMPLETADA)
- [x] **Ocultar Radar Público (`/tablero`):** Retirar la pestaña de quedadas públicas de la barra de navegación para evitar pantallas vacías en ciudades con pocos usuarios.
- [x] **Reestructurar `AppShell` a 4 pestañas limpias:**
  - 🏠 **Explorar:** Catálogo BGG en español con filtros potentes.
  - 🎲 **A Jugar:** El motor de decisión y partida rápida.
  - 👥 **Mis Grupos:** Ludotecas fusionadas y Salón de la Fama.
  - 👤 **Mi Perfil:** Colección, victorias y medallas.
- [x] **Onboarding BGG Express:** Prompt inicial tras registrarse para importar colección de BGG en 5 segundos por nombre de usuario.
- [x] **Invitación a Grupos por Enlace Corto de WhatsApp:** Flujo de unión en 1 toque.
- [x] **[ARTE & UI] Sistema de Tokens "The Grand Game Mat":**
  - Fondo pizarra medianoche (`#0A0F1D`) y acento esmeralda tapete (`#10B981`) con ratios WCAG 2.2 AAA.
  - Tipografía display editorial (`Outfit` / `Plus Jakarta Sans`) + números tabulares (`JetBrains Mono`).
- [x] **Saneamiento Total de Flujos Legacy (Cero fugas a `/tablero`):**
  - Eliminado definitivamente el archivo huérfano `RadarPage.tsx`.
  - Reemplazadas todas las rutas y llamadas residuales a `/tablero/*` por `/mesa/*` en toda la aplicación.
  - En `CreateMeetupPage`: Suprimido el límite artificial de 5 partidas, navegación directa a `/mesa/:id` al abrir mesa y persistencia de `groupId`.
  - En `GameDetailPage`: Conectado el botón "Organizar partida" directo a `/mesa/nueva?gameId=...`.

#### FASE 2: MOTOR DE DECISIÓN ("¿A QUÉ JUGAMOS HOY?") (COMPLETADA)
- [x] **Selector Paramétrico de Mesa:**
  - Selector numérico limpio y neutral de número de jugadores (2, 3, 4, 5, 6+), sin saturación de meeples de color en los filtros.
  - Selector de tiempo disponible (<30 min, 45-60 min, 90-120 min).
  - Filtro "Estantería de la Vergüenza" con toggle para priorizar juegos no estrenados.
- [x] **Modo Votación Exprés (30 segundos):** Modal accesible con cuenta atrás visual de 30s, sellado de votos y proclamación automática del juego ganador con confeti.
- [x] **Modo Ruleta Háptica e Inercial:** Ruleta física con desaceleración mecánica realista (curva de 40ms a 430ms), vibración háptica en móviles y parada triunfal con confeti (sin efectos de audio).

#### FASE 3: ASISTENTE DE PUNTUACIÓN Y CIERRE CON TARJETA DE WHATSAPP (COMPLETADA)
- [x] **Selector de Primer Jugador Multitáctil ("Chwazi" Tabletop):** Superficie multitáctil donde los jugadores colocan los dedos en pantalla, se iluminan anillos con colores distintivos y tras 2.2s se elige al azar con háptica quién empieza (con soporte de tirada accesible con un clic en PC, sin sonidos).
- [x] **Contador de Puntos en Vivo para la Mesa:**
  - Marcador de tanteo continuo integrado en `/mesa/:id` con tipografía monoespaciada tabular.
  - Botones de ajuste rápido (+1, +5, -1, -5) y edición de puntuación directa.
  - Asignación de corona 👑 al líder de la partida.
  - Soporte de invitados *shadow* (amigos presentes en la mesa sin cuenta) y persistencia en tiempo real en Supabase.
- [x] **Foto del Tablero Final:** Captura directa con cámara móvil y compresión optimizada en cliente mediante canvas para la foto de la mesa terminada.
- [x] **Tarjeta de Victoria para WhatsApp:**
  - Generación de imagen en alta resolución con `html-to-image` (diseño cartel con carátula del juego, podio de puntuaciones, fecha y foto final).
  - Envío en 1 toque al chat de WhatsApp del grupo mediante Web Share API (`navigator.share`) o enlace nativo `https://wa.me/` con el acta formateada y descarga en PNG.

#### FASE 4: EL "SALÓN DE LA FAMA" Y RIVALIDADES DE GRUPO
- [ ] **Podio de Campeones:** Escenario minimalista con los avatares en podio escalonado al consultar el ranking histórico del grupo.
- [ ] **Estadísticas de Enfrentamiento Directo:** Detección de "Némesis" y "Víctima favorita" con animaciones dinámicas (espadas cruzadas ⚔️).
- [ ] **Récords por Juego:** Máxima puntuación histórica registrada por juego en el grupo con efecto de medalla pulida.
- [ ] **Rachas de Victoria:** Indicador de racha activa con fuego vectorial animado (🔥).

#### FASE 5: DISTRIBUCIÓN MÓVIL Y MONETIZACIÓN B2C/B2B
- [ ] **PWA Standalone & Capacitor Android:** Empaquetado pulido para instalación en pantalla completa sin barras de navegador.
- [ ] **Suscripción "Host Pro":** Estadísticas analíticas avanzadas, personalización de temas visuales para tarjetas de WhatsApp y hojas de puntuación por categorías.
- [ ] **Piloto B2B Cafeterías de Juegos:** Modo menú QR para mesas de locales y bares de juegos de mesa.



