// ────────────────────────────────────────────────────────────
//  Mock data – used while waiting for live data / BGG API key
// ────────────────────────────────────────────────────────────

export const MOCK_REVIEWS = [
  {
    id: 'mock-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    rating: 9,
    review_text:
      'Una obra maestra. La gestión de recursos junto con la mecánica de cartas te mantiene en tensión hasta el último turno. Muy rejugable con la miniexpansión.',
    photo_url: '/mock_terraforming_mars.png',
    users: {
      username: 'boardgamer_alex',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    games_cache: { name: 'Terraforming Mars' },
  },
  {
    id: 'mock-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    rating: 8,
    review_text:
      'Perfecto para noches de grupo. Normalizar quién coloca el ladrón siempre es el debate principal 😂. Edición de aniversario preciosa.',
    photo_url: '/mock_catan_session.png',
    users: {
      username: 'meeple_sara',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    },
    games_cache: { name: 'Catan' },
  },
  {
    id: 'mock-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    rating: 10,
    review_text:
      'No tiene comparación en su categoría. La profundidad estratégica, los eventos políticos y las razas únicas hacen que cada partida sea un universo distinto. Un must absoluto.',
    photo_url: '/mock_twilight_imperium.png',
    users: {
      username: 'hex_and_counter',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter',
    },
    games_cache: { name: 'Twilight Imperium IV' },
  },
]

export const MOCK_MEETUPS = [
  {
    id: 'mock-m1',
    title: 'Tarde de Euros en el barrio',
    game_name: 'Brass: Birmingham',
    description:
      'Quedamos para estrenar Brass Birmingham edición coleccionista. Plazas limitadas, traed algo para picar 🍕.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    location: 'Café Central, Madrid',
    users: { username: 'boardgamer_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  },
  {
    id: 'mock-m2',
    title: 'Partida abierta – wargames',
    game_name: 'Twilight Struggle',
    description:
      'Búscame en la sala de la izquierda, siempre llevo el tablero. Jugaremos Twilight Struggle y si sobra tiempo, algún filler.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    location: 'Asociación Lúdica Norte, Bilbao',
    users: { username: 'hex_and_counter', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter' },
  },
  {
    id: 'mock-m3',
    title: 'Noche de familiar + party',
    game_name: 'Dixit / Codenames',
    description:
      'Sesión para todos los niveles. Empezamos con Dixit para los novatos y cerramos con Código Secreto (Duet). ¡Apuntaos sin miedo!',
    date: new Date(Date.now() + 1000 * 60 * 60 * 200).toISOString(),
    location: 'Bar El Tablero, Barcelona',
    users: { username: 'meeple_sara', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
  },
]

export const MOCK_BGG_GAMES = [
  { id: 'mock-g1', bgg_id: '167791', name: 'Terraforming Mars',                  year: 2016, image_url: '/mock_terraforming_mars.png' },
  { id: 'mock-g2', bgg_id: '13',     name: 'Catan',                              year: 1995, image_url: '/mock_catan_session.png' },
  { id: 'mock-g3', bgg_id: '12333',  name: 'Twilight Imperium (Fourth Edition)', year: 2017, image_url: '/mock_twilight_imperium.png' },
  { id: 'mock-g4', bgg_id: '224517', name: 'Brass: Birmingham',                  year: 2018, image_url: '/mock_brass_birmingham.png' },
  { id: 'mock-g5', bgg_id: '37111',  name: 'Dixit',                              year: 2008, image_url: '/mock_dixit.png' },
]
