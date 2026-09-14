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

> **Dirección Artística y Sensorial: "Scandi Craft & Tactile Tabletop Lounge"**
> - **Atmósfera:** Estilo Stonemaier / nórdico editorial cálido. Sensación de accesorio físico de lujo sobre el tapete (madera, lino, dados de resina y piezas troqueladas).
> - **Paleta de diseño:** Fondo grafito nogal mate (`#16181B`), acento latón/ámbar (`#E5A93C`) y cuarteto canónico de meeples de madera (Rojo, Azul, Amarillo, Verde) para los jugadores.
> - **Stack sensorial integrado:** Three.js / WebGL para componentes 3D físicos, `framer-motion` para inercia y física de cartas, `use-sound` para clicks de madera y dados, `canvas-confetti` temático y `react-countup` para contadores mecánicos.

#### FASE 1: PODA DE NAVEGACIÓN, ONBOARDING Y FUNDACIÓN DE DISEÑO TÁCTIL (COMPLETADA)
- [x] **Ocultar Radar Público (`/tablero`):** Retirar la pestaña de quedadas públicas de la barra de navegación para evitar pantallas vacías en ciudades con pocos usuarios.
- [x] **Reestructurar `AppShell` a 4 pestañas limpias:**
  - 🏠 **Explorar:** Catálogo BGG en español con filtros potentes.
  - 🎲 **A Jugar:** El motor de decisión y partida rápida.
  - 👥 **Mis Grupos:** Ludotecas fusionadas y Salón de la Fama.
  - 👤 **Mi Perfil:** Colección, victorias y medallas.
- [x] **Onboarding BGG Express:** Prompt inicial tras registrarse para importar colección de BGG en 5 segundos por nombre de usuario.
- [x] **Invitación a Grupos por Enlace Corto de WhatsApp:** Flujo de unión en 1 toque.
- [x] **[ARTE & UI] Sistema de Tokens Scandi Tabletop:**
  - Migración cromática a fondo grafito nogal cálido mate (`#16181B`) anti-fatiga en salón.
  - Tipografía display editorial de caja moderna (`Outfit` / `Plus Jakarta Sans`) + números tabulares (`JetBrains Mono`).
  - Capa de acabado lino mate (*linen finish* procedural con filtro SVG) en tarjetas y modales.
  - Paisaje sonoro base (`use-sound`): Clack de madera sordo en botones táctiles principales.

#### FASE 2: MOTOR DE DECISIÓN SENSORIAL ("¿A QUÉ JUGAMOS HOY?")
- [ ] **Selector Paramétrico de Mesa:**
  - Selector táctil de número de jugadores con fichas de madera interactivas (2, 3, 4, 5, 6+).
  - Selector de tiempo disponible (<30 min, 60 min, 90-120 min, tarde entera).
  - Filtro "Estantería de la Vergüenza" (priorizar juegos no estrenados del grupo).
- [ ] **Modo Votación Exprés (30 segundos):** Despliegue elástico de cartas en abanico (`framer-motion`) donde los presentes tocan sus 3 favoritos con feedback háptico.
- [ ] **Modo Ruleta 3D / Háptica:** Ruleta física de mesa con desaceleración inercial realista, freno elástico, vibración háptica (`navigator.vibrate`) en cada diente y sonido de carraca de madera.

#### FASE 3: ASISTENTE DE PUNTUACIÓN Y CIERRE CON TARJETA DE WHATSAPP
- [ ] **Selector de Primer Jugador 3D / Táctil:** Dado poliédrico 3D físico con WebGL (`three` / `@react-three/fiber`) que rueda por la pantalla o ruleta circular táctil de dedos para decidir quién empieza.
- [ ] **Contador de Puntos en Vivo Mecánico:**
  - Asignación de color de meeple y avatar procedimental por jugador (@dicebear).
  - Marcador numérico rodante continuo (`react-countup`) con feedback sonoro al incrementar puntos.
  - Soporte de invitados *shadow* (amigos sin cuenta).
- [ ] **Foto del Tablero Final:** Captura y subida optimizada de la foto de la partida terminada.
- [ ] **Cierre de Partida con Celebración:** Lluvia de confeti temático (`canvas-confetti`) simulando troqueles de cartón y gemas acrílicas cayendo, con fanfarria sutil de victoria.
- [ ] **Tarjeta Viral de WhatsApp "Scandi Editorial":**
  - Generación de imagen con `html-to-image` en alta resolución (diseño tipo cartel con foto de la mesa, badge de latón de campeón y puntuaciones gigantes).
  - Envío en 1 clic a través de Web Share API al chat de WhatsApp del grupo.

#### FASE 4: EL "SALÓN DE LA FAMA" Y RIVALIDADES DE GRUPO
- [ ] **Podio 3D de Campeones:** Escenario 3D minimalista (`three`) con los avatares en podio escalonado al consultar el ranking histórico del grupo.
- [ ] **Estadísticas de Enfrentamiento Directo:** Detección de "Némesis" y "Víctima favorita" con animaciones dinámicas (espadas cruzadas ⚔️ con Twemoji vectoriales).
- [ ] **Récords por Juego:** Máxima puntuación histórica registrada por juego en el grupo con efecto de medalla de latón pulido.
- [ ] **Rachas de Victoria:** Indicador de racha activa con fuego vectorial animado (🔥).

#### FASE 5: DISTRIBUCIÓN MÓVIL Y MONETIZACIÓN B2C/B2B
- [ ] **PWA Standalone & Capacitor Android:** Empaquetado pulido para instalación en pantalla completa sin barras de navegador.
- [ ] **Suscripción "Host Pro":** Estadísticas analíticas avanzadas, personalización de temas visuales para tarjetas de WhatsApp y hojas de puntuación por categorías.
- [ ] **Piloto B2B Cafeterías de Juegos:** Modo menú QR para mesas de locales y bares de juegos de mesa.


