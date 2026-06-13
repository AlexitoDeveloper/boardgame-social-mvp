import { supabase } from '../lib/supabaseClient'
import { BggSearchResult } from '../types'

interface SearchResponse {
  games: BggSearchResult[];
  error: string | null;
}

/**
 * Calls the Supabase Edge Function that searches BoardGameGeek,
 * normalizes the XML response, caches rows in games_cache, and returns results.
 */
export async function searchBoardGames(search: string): Promise<SearchResponse> {
  const normalizedSearch = String(search ?? '').trim()

  if (normalizedSearch.length < 2) {
    return { games: [], error: 'Write at least 2 characters.' }
  }

  const { data, error } = await supabase.functions.invoke('bgg-search', {
    body: { search: normalizedSearch },
  })

  if (error) {
    return { games: [], error: error.message || 'Failed to search BGG.' }
  }

  return { games: (data?.games as BggSearchResult[]) ?? [], error: null }
}
