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

### FASE 3: PULIDO Y GAMIFICACIÓN (ESTAMOS AQUÍ)

_Objetivo: Cerrar el bucle viral de los eventos y mejorar la experiencia de usuario final explotando los datos._

- [x] **[GRATIS] Dashboard de Exploración (Estilo "Netflix" con carruseles y filtros):** Experiencia premium con carruseles horizontales dinámicos, sección del "TOP 10 de la Semana" con números gigantes en outline, y cabecera pegajosa de filtros avanzados (búsqueda de texto, jugadores, complejidad e idioma) que se contrae automáticamente al hacer scroll para ahorrar espacio en móviles y escritorio.
- [x] **[GRATIS] Ficha de Juego "Viva" (Detalles + Estadísticas en tiempo real)**
- [x] **[GRATIS] Acciones Rápidas desde la Ficha (Botón "Organizar Partida")**
- [x] **[GRATIS] Ludoteca de Grupo:** Creación de "Grupos de Juego" privados donde la app fusiona virtualmente las colecciones de los miembros para votar a qué jugar en la próxima quedada.
- [ ] **[VIRALIDAD] Resumen de Partida (Exportable a RRSS):** Generación de una imagen automática y visualmente atractiva tras el cierre de la partida con el ganador y la puntuación, lista para compartir en Instagram/TikTok.
- [ ] **[PREMIUM] Cierre de Partida "Pro" y Hojas de Puntuación:** Permite introducir la puntuación exacta de cada jugador en cada categoría usando plantillas específicas por juego (y sus expansiones).
- [ ] **[PREMIUM] Estadísticas Avanzadas (Némesis, Radar, etc.):** Desbloqueo de vistas SQL analíticas ("Némesis" y "Víctimas", Títulos Dinámicos automáticos, y Radar de Estilo de Jugador).

### FASE 4: EXPANSIÓN B2B

_Objetivo: Convertir la app en la herramienta definitiva del ecosistema de juegos de mesa._

- [ ] **[B2B MONETIZACIÓN] Perfiles Verificados para Tiendas/Asociaciones:** Suscripción mensual para comercios locales. Les permite publicar torneos oficiales, eventos de demostración y enviar notificaciones _push_ a los usuarios de su ciudad.
- [ ] **[COMUNIDAD] Mercadillo Integrado (Compra/Venta local):** Sección geolocalizada donde los usuarios pueden marcar juegos de su ludoteca como "Vende/Cambia" y hacer _match_ con otros usuarios interesados en su misma zona.
