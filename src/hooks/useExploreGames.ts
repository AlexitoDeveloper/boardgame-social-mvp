import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Game } from '../types'

export function useExploreGames(
  search: string,
  playerFilter: string,
  complexityFilter: string,
  spanishOnly: boolean
) {
  const [loadingCarousels, setLoadingCarousels] = useState(true)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carousel categories state
  const [novedades, setNovedades] = useState<Game[]>([])
  const [paraDos, setParaDos] = useState<Game[]>([])
  const [classics, setClassics] = useState<Game[]>([])
  const [top10, setTop10] = useState<Game[]>([])

  // Search grid results state
  const [searchResults, setSearchResults] = useState<Game[]>([])

  const isFiltering = !!(search.trim() || playerFilter || complexityFilter || spanishOnly)

  // 1. Fetch idle carousels data once on mount
  useEffect(() => {
    async function fetchCarousels() {
      setLoadingCarousels(true)
      setError(null)
      try {
        // Novedades en España: year_published DESC, has_spanish_edition = true
        const novedadesQuery = supabase
          .from('games')
          .select('*')
          .eq('has_spanish_edition', true)
          .order('year_published', { ascending: false })
          .limit(15)

        // Juegos para 2: min_players <= 2, max_players >= 2
        const paraDosQuery = supabase
          .from('games')
          .select('*')
          .lte('min_players', 2)
          .gte('max_players', 2)
          .order('bgg_rank', { ascending: true, nullsFirst: false })
          .limit(15)

        // Top Clásicos: rating_geek DESC
        const classicsQuery = supabase
          .from('games')
          .select('*')
          .not('rating_geek', 'is', null)
          .order('rating_geek', { ascending: false })
          .limit(15)

        // Top 10 de la semana: bgg_rank ASC
        const top10Query = supabase
          .from('games')
          .select('*')
          .not('bgg_rank', 'is', null)
          .order('bgg_rank', { ascending: true })
          .limit(10)

        const [novRes, dosRes, claRes, top10Res] = await Promise.all([
          novedadesQuery,
          paraDosQuery,
          classicsQuery,
          top10Query
        ])

        if (novRes.error) throw novRes.error
        if (dosRes.error) throw dosRes.error
        if (claRes.error) throw claRes.error
        if (top10Res.error) throw top10Res.error

        setNovedades(novRes.data || [])
        setParaDos(dosRes.data || [])
        setClassics(claRes.data || [])
        setTop10(top10Res.data || [])
      } catch (err: any) {
        console.error('Error fetching carousels:', err)
        setError(err.message || 'Error al cargar carruseles')
      } finally {
        setLoadingCarousels(false)
      }
    }

    fetchCarousels()
  }, [])

  // 2. Fetch filtered query with debounce for text search and filter pills
  const fetchFilteredGames = useCallback(async () => {
    setLoadingSearch(true)
    setError(null)
    try {
      let query = supabase.from('games').select('*')

      if (search.trim()) {
        query = query.or(`title.ilike.%${search.trim()}%,title_es.ilike.%${search.trim()}%`)
      }

      if (spanishOnly) {
        query = query.eq('has_spanish_edition', true)
      }

      if (playerFilter) {
        if (playerFilter === '1') {
          query = query.lte('min_players', 1).gte('max_players', 1)
        } else if (playerFilter === '2') {
          query = query.lte('min_players', 2).gte('max_players', 2)
        } else if (playerFilter === '3-4') {
          query = query.or('and(min_players.lte.3,max_players.gte.3),and(min_players.lte.4,max_players.gte.4)')
        } else if (playerFilter === '5+') {
          query = query.gte('max_players', 5)
        }
      }

      if (complexityFilter) {
        if (complexityFilter === 'familiar') {
          query = query.lte('complexity', 2.2)
        } else if (complexityFilter === 'medio') {
          query = query.gt('complexity', 2.2).lte('complexity', 3.5)
        } else if (complexityFilter === 'experto') {
          query = query.gt('complexity', 3.5)
        }
      }

      // Order by rank first, then geek rating
      query = query.order('bgg_rank', { ascending: true, nullsFirst: false }).limit(40)

      const { data, error: fetchErr } = await query
      if (fetchErr) throw fetchErr

      setSearchResults(data || [])
    } catch (err: any) {
      console.error('Error fetching search results:', err)
      setError(err.message || 'Error en la búsqueda')
    } finally {
      setLoadingSearch(false)
    }
  }, [search, playerFilter, complexityFilter, spanishOnly])

  useEffect(() => {
    if (isFiltering) {
      const handler = setTimeout(() => {
        fetchFilteredGames()
      }, 300) // 300ms debounce
      return () => clearTimeout(handler)
    } else {
      setSearchResults([])
    }
  }, [isFiltering, fetchFilteredGames])

  return {
    loadingCarousels,
    loadingSearch,
    error,
    novedades,
    paraDos,
    classics,
    top10,
    searchResults,
    isFiltering
  }
}
