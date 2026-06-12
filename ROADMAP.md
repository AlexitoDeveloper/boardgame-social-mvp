# ROADMAP DEL PROYECTO

### FASE 1: VIRALIDAD Y ADQUISICIÓN (Traer gente)
*Objetivo: Que la app se promocione orgánicamente mediante contenido interactivo y compartible.*
- [x] **[GRATIS] Generador de "Tops/Tier Lists" Básico:** Pantalla para buscar juegos en la base de datos local (`games`), ordenarlos de forma interactiva y exportar una imagen nativa y estética (con el logo y estilo de la app) lista para compartir en redes.
- [x] **[GRATIS] Invitados "Shadow":** Permitir que los usuarios reserven plaza en una meetup poniendo solo su nombre, sin necesidad de registro completo inicial. Gestión en tabla `meetup_guests`.
- [x] **[PREMIUM] Generador de Tops "Pro":** Funcionalidad opcional para exportar las Tier Lists sin marca de agua, con fondos personalizados en alta resolución y formatos adaptados.

### FASE 2: RETENCIÓN Y UTILIDAD (Que se queden)
*Objetivo: Aumentar el valor de la app para el usuario frecuente en su día a día y construir su identidad.*
- [ ] **[GRATIS] Mi Ludoteca (Importador BGG):** Botón para importar la colección desde BoardGameGeek usando el nombre de usuario de BGG, poblando automáticamente la base de datos personal. Requiere la tabla `user_collection` y manejo del estado síncrono/asíncrono de la API de BGG.
- [ ] **[GRATIS] Chat Activo por Partida:** Canal de mensajes en tiempo real dentro del detalle de cada meetup para la coordinación de los asistentes. Implementado con Supabase Realtime y políticas RLS.
- [ ] **[GRATIS] Perfil Básico y Cierre de Partida:** Posibilidad de marcar una quedada como "Completada" eligiendo al ganador. El perfil mostrará el porcentaje de victorias global y el Karma (porcentaje de asistencia real).

### FASE 3: PULIDO Y MONETIZACIÓN (Sostenibilidad)
*Objetivo: Añadir vías de ingresos pasivos y mejorar la experiencia de usuario final.*
- [ ] **[SOSTENIBILIDAD] Afiliación Transparente:** Botón de "Comprar" en la ficha del juego con enlaces de referido a tiendas colaboradoras.
- [ ] **[GRATIS] Filtros "Matchmaking":** Buscador avanzado de eventos locales filtrando por categorías y mecánicas en caché.
- [ ] **[PREMIUM] Cierre de Partida "Pro" y Hojas de Puntuación:** Permite introducir la puntuación exacta de cada jugador en cada categoría usando plantillas específicas.
- [ ] **[PREMIUM] Estadísticas Avanzadas (El Pique Sano):** Desbloqueo de vistas SQL analíticas ("Némesis" y "Víctimas", Títulos Dinámicos automáticos, y Radar de Estilo de Jugador).
