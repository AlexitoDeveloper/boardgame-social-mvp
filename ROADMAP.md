# ROADMAP DEL PROYECTO

### FASE 1: VIRALIDAD Y ADQUISICIÓN (Traer gente)

_Objetivo: Que la app se promocione orgánicamente mediante contenido interactivo y compartible._

- [x] **[GRATIS] Generador de "Tops/Tier Lists" Básico:** Pantalla para buscar juegos en la base de datos local (`games`), ordenarlos de forma interactiva y exportar una imagen nativa y estética (con el logo y estilo de la app) lista para compartir en redes.
- [x] **[GRATIS] Invitados "Shadow":** Permitir que los usuarios reserven plaza en una meetup poniendo solo su nombre, sin necesidad de registro completo inicial. Gestión en tabla `meetup_guests`.
- [x] **[PREMIUM] Generador de Tops "Pro":** Funcionalidad opcional para exportar las Tier Lists sin marca de agua, con fondos personalizados en alta resolución y formatos adaptados.

### FASE 2: RETENCIÓN Y UTILIDAD (Que se queden)

_Objetivo: Aumentar el valor de la app para el usuario frecuente en su día a día y construir su identidad._

- [ ] **[GRATIS] Mi Ludoteca (Importador BGG):** Botón para importar la colección desde BoardGameGeek usando el nombre de usuario de BGG, poblando automáticamente la base de datos personal. Requiere la tabla `user_collection` y manejo del estado síncrono/asíncrono de la API de BGG.
- [x] **[GRATIS] Chat Activo por Partida:** Canal de mensajes en tiempo real dentro del detalle de cada meetup para la coordinación de los asistentes. Centralizado en una página dedicada con badges de notificaciones.
- [x] **[GRATIS] Escaparate de Jugador (Perfil Gamificado):** Perfil rediseñado con sistema de experiencia (XP) con desglose de rates, rango de jugador (Novato, Maestro, Leyenda), vitrina de logros interactiva y visualización/descarga de rankings guardados.
- [x] **[GRATIS] Cierre de Partida e Historial:** Registro de asistencia real, cálculo de karma y ganador en el cierre de meetups (asociado a iconos de espadas de victoria, no coronas).

### FASE 3: PULIDO Y GAMIFICACIÓN (El Pique Sano)

_Objetivo: Cerrar el bucle viral de los eventos y mejorar la experiencia de usuario final explotando los datos._

- [ ] **[GRATIS] Filtros "Matchmaking" Locales:** Buscador avanzado de eventos locales filtrando por categorías y mecánicas en caché.
- [ ] **[GRATIS] Ludoteca de Grupo:** Creación de "Grupos de Juego" privados donde la app fusiona virtualmente las colecciones de los miembros para votar a qué jugar en la próxima quedada.
- [ ] **[VIRALIDAD] Resumen de Partida (Exportable):** Generación de una imagen automática y visualmente atractiva tras el cierre de la partida con el ganador y la puntuación, lista para compartir en Instagram/TikTok.
- [ ] **[PREMIUM] Cierre de Partida "Pro" y Hojas de Puntuación:** Permite introducir la puntuación exacta de cada jugador en cada categoría usando plantillas específicas por juego.
- [ ] **[PREMIUM] Estadísticas Avanzadas:** Desbloqueo de vistas SQL analíticas ("Némesis" y "Víctimas", Títulos Dinámicos automáticos, y Radar de Estilo de Jugador).

### FASE 4: EXPANSIÓN Y ECOSISTEMA LOCAL (Visión a largo plazo)

_Objetivo: Convertir la app en la herramienta definitiva del ecosistema de juegos de mesa._

- [ ] **[B2B MONETIZACIÓN] Perfiles Verificados para Tiendas/Asociaciones:** Suscripción mensual para comercios locales. Les permite publicar torneos oficiales, eventos de demostración y enviar notificaciones _push_ a los usuarios de su ciudad (por ejemplo, fidelizando a la comunidad actual y preparando el terreno para futuras expansiones hacia zonas como Alicante).
- [ ] **[COMUNIDAD] Mercadillo Integrado (Compra/Venta):** Sección geolocalizada donde los usuarios pueden marcar juegos de su ludoteca como "Vende/Cambia" y hacer _match_ con otros usuarios interesados en su misma zona.
