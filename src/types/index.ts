export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  city?: string | null;
  created_at?: string;
  updated_at?: string;
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
  city: string;
  location: string;
  date: string;
  max_players: number;
  joined_players: string[];
  created_at?: string;
  updated_at?: string;
  users?: UserProfile;
  games?: Game | Game[];
  game_name?: string; // Usado en datos mock y compatibilidad
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
