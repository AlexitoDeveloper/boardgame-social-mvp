export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  city?: string | null;
  created_at?: string;
  updated_at?: string;
  is_guest?: boolean; // Identifica si el usuario es un invitado shadow
}

export interface Game {
  bgg_id: number;
  title: string;
  year?: number | null;
  year_published?: number | null;
  image_url: string | null;
  min_players?: number | null;
  max_players?: number | null;
  playing_time?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Meetup {
  id: string;
  creator_id: string;
  game_id: number;
  title: string;
  description: string | null;
  city: string | null;
  location: string | null;
  date: string;
  max_players: number;
  joined_players: string[];
  created_at?: string;
  updated_at?: string;
  users?: UserProfile;
  games?: Game | Game[];
  game_name?: string; // Usado en datos mock y compatibilidad
  meetup_guests?: { id: string; guest_name: string }[];
  completed?: boolean;
  winner_user_id?: string | null;
  winner_guest_id?: string | null;
  attended_players?: string[];
  attended_guests?: string[];
  is_online?: boolean;
  platform?: string | null;
  voice_link?: string | null;
}

export interface BggSearchResult {
  bgg_id: string;
  name: string;
  year?: number;
  image_url?: string | null;
  min_players?: number;
  max_players?: number;
  playing_time?: number;
}

export interface MeetupMessage {
  id: string;
  meetup_id: string;
  user_id: string | null;
  guest_id: string | null;
  sender_name: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
}

