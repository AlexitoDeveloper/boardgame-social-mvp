import { supabase } from './supabaseClient'
import { USE_MOCKS } from './config'

export interface SimpleGame {
  bgg_id: number
  title: string
  title_es?: string | null
  image_url?: string | null
  image_url_es?: string | null
  year_published?: number | null
  min_players?: number | null
  max_players?: number | null
  playing_time?: number | null
  complexity?: number | null
  is_expansion?: boolean | null
  base_game_id?: string | null
  bgg_base_game_id?: number | null
  is_unplayed?: boolean
}

export function isGameExpansion(game: SimpleGame): boolean {
  if (game.is_expansion === true) return true
  if (game.base_game_id || game.bgg_base_game_id) return true
  const lowerTitle = (game.title || '').toLowerCase()
  const lowerEsTitle = (game.title_es || '').toLowerCase()
  const expRegex = /\b(expansi[oó]n|expansion)\b|\(exp\.?\)/i
  return expRegex.test(lowerTitle) || expRegex.test(lowerEsTitle)
}

export function mapToSimpleGame(g: any, unplayedOverride?: boolean): SimpleGame {
  let isUnplayed = false
  if (unplayedOverride !== undefined) {
    isUnplayed = unplayedOverride
  } else if (g.is_unplayed !== undefined) {
    isUnplayed = Boolean(g.is_unplayed)
  } else if (g.play_count !== undefined) {
    isUnplayed = g.play_count === 0
  }

  return {
    bgg_id: Number(g.bgg_id),
    title: g.title,
    title_es: g.title_es,
    image_url: g.image_url,
    image_url_es: g.image_url_es,
    year_published: g.year_published,
    min_players: g.min_players || 2,
    max_players: g.max_players || 5,
    playing_time: g.playing_time || 45,
    complexity: g.complexity,
    is_expansion: g.is_expansion ?? false,
    base_game_id: g.base_game_id,
    bgg_base_game_id: g.bgg_base_game_id,
    is_unplayed: isUnplayed,
  }
}

export async function fetchPlayGamesPool(
  userId: string | undefined,
  selectedGroupId: string
): Promise<SimpleGame[]> {
  const loadedGames: SimpleGame[] = []

  if (selectedGroupId === 'personal') {
    // 1. Mock storage
    if (userId) {
      const localStored = localStorage.getItem(`ludiclub_mock_collection_${userId}`) || localStorage.getItem(`boardgame_social_mock_collection_${userId}`)
      if (localStored) {
        try {
          const parsed = JSON.parse(localStored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((g: any) => {
              const isUnplayed = g.is_unplayed !== undefined ? Boolean(g.is_unplayed) : (g.play_count !== undefined ? g.play_count === 0 : true)
              loadedGames.push(mapToSimpleGame(g, isUnplayed))
            })
          }
        } catch {}
      }
    }

    // 2. Supabase user_collection
    if (userId && !USE_MOCKS) {
      try {
        const { data: collData, error: collErr } = await supabase
          .from('user_collection')
          .select('game_id, is_unplayed, play_count, games (*)')
          .eq('user_id', userId)

        if (!collErr && collData && collData.length > 0) {
          const joined = collData
            .map((item: any) => {
              const g = Array.isArray(item.games) ? item.games[0] : item.games
              if (!g) return null
              const isUnplayed = item.is_unplayed === true || item.play_count === 0
              return mapToSimpleGame(g, isUnplayed)
            })
            .filter(Boolean) as SimpleGame[]

          if (joined.length > 0) {
            joined.forEach((g) => {
              if (!loadedGames.some(existing => existing.bgg_id === g.bgg_id)) {
                loadedGames.push(g)
              }
            })
          } else {
            const gameIds = Array.from(new Set(collData.map((item: any) => item.game_id).filter(Boolean)))
            if (gameIds.length > 0) {
              const { data: directGames } = await supabase
                .from('games')
                .select('*')
                .in('bgg_id', gameIds)

              if (directGames) {
                directGames.forEach((g: any) => {
                  if (!loadedGames.some(existing => existing.bgg_id === g.bgg_id)) {
                    loadedGames.push(mapToSimpleGame(g))
                  }
                })
              }
            }
          }
        }
      } catch (supabaseErr) {
        console.warn('Error fetching user_collection:', supabaseErr)
      }
    }

    // 3. Fallback mock games
    if (USE_MOCKS && loadedGames.length === 0) {
      return [
        { bgg_id: 37111, title: 'Dixit', min_players: 3, max_players: 8, playing_time: 30, image_url: 'https://cf.geekdo-images.com/39A865b4-B6BE-4b82-9022-7935E5B9FE6C.png', is_unplayed: false },
        { bgg_id: 13, title: 'Catan', min_players: 3, max_players: 4, playing_time: 75, image_url: 'https://cf.geekdo-images.com/40B7E05C-CC71-460B-A5DF-F2803CE10599.png', is_unplayed: false },
        { bgg_id: 30549, title: 'Pandemic', min_players: 2, max_players: 4, playing_time: 45, image_url: 'https://cf.geekdo-images.com/S3ybV1LAp-028x9-v1pd3A__itemrep/img/1m_2n6f4Jz_eFwI8PzM0y6lq5e0=/fit-in/246x300/filters:strip_icc()/pic1534148.jpg', is_unplayed: true },
        { bgg_id: 68448, title: '7 Wonders', min_players: 2, max_players: 7, playing_time: 30, image_url: 'https://cf.geekdo-images.com/35h9Za_Ka8i0yHiVbIsG8g__itemrep/img/bBqA4d9_kMfsY93p8e_V_o2nCqo=/fit-in/246x300/filters:strip_icc()/pic860217.jpg', is_unplayed: true },
        { bgg_id: 9209, title: 'Ticket to Ride', min_players: 2, max_players: 5, playing_time: 60, image_url: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__itemrep/img/8c9iJ5BvI4i_w89L8Lp8rM_aM_0=/fit-in/246x300/filters:strip_icc()/pic3727516.jpg', is_unplayed: true },
      ]
    }

    // 4. Catalog fallback
    if (loadedGames.length === 0) {
      try {
        const { data: catalogGames } = await supabase
          .from('games')
          .select('*')
          .not('image_url', 'is', null)
          .order('bgg_rank', { ascending: true, nullsFirst: false })
          .limit(25)

        if (catalogGames && catalogGames.length > 0) {
          return catalogGames.map((g: any) => mapToSimpleGame(g))
        }
      } catch {}
    }

    return loadedGames
  }

  // Group collection
  if (USE_MOCKS) {
    const mockMembersStr = localStorage.getItem('ludiclub_mock_group_members') || localStorage.getItem('boardgame_social_mock_group_members')
    const allMembers = mockMembersStr ? JSON.parse(mockMembersStr) : []
    const groupMemberIds = allMembers.filter((m: any) => m.group_id === selectedGroupId).map((m: any) => m.user_id)
    if (userId && !groupMemberIds.includes(userId)) groupMemberIds.push(userId)

    const groupGamesMap = new Map<number, SimpleGame>()
    ;[
      { bgg_id: 224517, title: 'Brass: Birmingham', min_players: 2, max_players: 4, playing_time: 120, image_url: 'https://cf.geekdo-images.com/x3zxztFbRYCgssNZ55ZMnw__micro/img/QDuQwi75tL54enp_8_93K3s97d0=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg', is_unplayed: false },
      { bgg_id: 13, title: 'Catan', min_players: 3, max_players: 4, playing_time: 75, image_url: 'https://cf.geekdo-images.com/40B7E05C-CC71-460B-A5DF-F2803CE10599.png', is_unplayed: false },
      { bgg_id: 37111, title: 'Dixit', min_players: 3, max_players: 8, playing_time: 30, image_url: 'https://cf.geekdo-images.com/39A865b4-B6BE-4b82-9022-7935E5B9FE6C.png', is_unplayed: false },
      { bgg_id: 167791, title: 'Terraforming Mars', min_players: 1, max_players: 5, playing_time: 120, image_url: 'https://cf.geekdo-images.com/yLZJCDgC7y0uJUWSpFd58A__micro/img/z7A4g4dG6NqH2fT0zJc2j6m9V-g=/fit-in/64x64/filters:strip_icc()/pic3536616.png', is_unplayed: true },
    ].forEach(g => groupGamesMap.set(g.bgg_id, mapToSimpleGame(g, g.is_unplayed)))

    groupMemberIds.forEach((mId: string) => {
      const mStr = localStorage.getItem(`ludiclub_mock_collection_${mId}`) || localStorage.getItem(`boardgame_social_mock_collection_${mId}`)
      if (mStr) {
        try {
          JSON.parse(mStr).forEach((g: any) => groupGamesMap.set(Number(g.bgg_id), mapToSimpleGame(g)))
        } catch {}
      }
    })

    return Array.from(groupGamesMap.values())
  }

  // Live Supabase group collection
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', selectedGroupId)

  if (members && members.length > 0) {
    const memberIds = members.map((m: any) => m.user_id)
    const { data: colData } = await supabase
      .from('user_collection')
      .select('game_id, is_unplayed, play_count, games (*)')
      .in('user_id', memberIds)

    if (colData && colData.length > 0) {
      const joined = colData
        .map((item: any) => {
          const g = Array.isArray(item.games) ? item.games[0] : item.games
          if (!g) return null
          const isUnplayed = item.is_unplayed === true || item.play_count === 0
          return mapToSimpleGame(g, isUnplayed)
        })
        .filter(Boolean) as SimpleGame[]

      if (joined.length > 0) {
        const uniqueMap = new Map<number, SimpleGame>()
        joined.forEach((g) => uniqueMap.set(g.bgg_id, g))
        return Array.from(uniqueMap.values())
      } else {
        const gameIds = Array.from(new Set(colData.map((item: any) => item.game_id).filter(Boolean)))
        if (gameIds.length > 0) {
          const { data: directGames } = await supabase
            .from('games')
            .select('*')
            .in('bgg_id', gameIds)

          if (directGames) {
            return directGames.map((g: any) => mapToSimpleGame(g))
          }
        }
      }
    }
  }

  return loadedGames
}
