// ────────────────────────────────────────────────────────────
//  Mock data – used while waiting for live data / BGG API key
// ────────────────────────────────────────────────────────────
import { Meetup } from '../types'

export interface MockMeetup {
  id: string;
  title: string;
  game_name: string;
  description: string;
  date: string;
  location: string;
  users: {
    username: string;
    avatar_url: string;
  };
}

export function getMockMeetupsForList(): Meetup[] {
  const mockGuestsKey = 'boardgame_social_mock_guests'
  const allMockGuestsStr = typeof window !== 'undefined' ? localStorage.getItem(mockGuestsKey) : null
  const allMockGuests = allMockGuestsStr ? JSON.parse(allMockGuestsStr) : {}

  return MOCK_MEETUPS.map(m => {
    const meetupMockGuests = allMockGuests[m.id] || []
    const guestsList = meetupMockGuests.map((g: any) => ({
      id: g.id,
      guest_name: g.guest_name
    }))
    
    const mockMaxPlayers = m.id === 'mock-m1' ? 4 : m.id === 'mock-m2' ? 2 : 6
    const initialRegistered = m.id === 'mock-m1' ? ['mock-u1', 'mock-u2', 'mock-u3', 'mock-u4'] : m.id === 'mock-m2' ? ['mock-u3', 'mock-u1'] : ['mock-u1']

    return {
      id: m.id,
      creator_id: m.id === 'mock-m1' ? 'mock-u1' : m.id === 'mock-m2' ? 'mock-u3' : 'mock-u2',
      game_id: 1,
      title: m.title,
      description: m.description,
      city: 'Madrid',
      location: m.location,
      date: m.date,
      max_players: mockMaxPlayers,
      joined_players: initialRegistered,
      users: {
        id: m.id === 'mock-m1' ? 'mock-u1' : m.id === 'mock-m2' ? 'mock-u3' : 'mock-u2',
        username: m.users?.username || 'anónimo',
        avatar_url: m.users?.avatar_url || null
      },
      games: {
        bgg_id: 1,
        title: m.game_name,
        image_url: null
      },
      meetup_guests: guestsList
    }
  })
}


export interface MockBggGame {
  id: string;
  bgg_id: string;
  name: string;
  year: number;
  image_url: string;
  min_players?: number;
  max_players?: number;
  playing_time?: number;
}

export const MOCK_MEETUPS: MockMeetup[] = [
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

export const MOCK_BGG_GAMES: MockBggGame[] = [
  { id: 'mock-g1', bgg_id: '167791', name: 'Terraforming Mars',                  year: 2016, image_url: '/mock_terraforming_mars.png' },
  { id: 'mock-g2', bgg_id: '13',     name: 'Catan',                              year: 1995, image_url: '/mock_catan_session.png' },
  { id: 'mock-g3', bgg_id: '12333',  name: 'Twilight Imperium (Fourth Edition)', year: 2017, image_url: '/mock_twilight_imperium.png' },
  { id: 'mock-g4', bgg_id: '224517', name: 'Brass: Birmingham',                  year: 2018, image_url: '/mock_brass_birmingham.png' },
  { id: 'mock-g5', bgg_id: '37111',  name: 'Dixit',                              year: 2008, image_url: '/mock_dixit.png' },
]
