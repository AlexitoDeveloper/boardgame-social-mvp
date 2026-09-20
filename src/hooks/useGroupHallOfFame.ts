import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { USE_MOCKS } from '../lib/config'
import { HallOfFameMember, RivalryStat, GameRecord, WinStreakRecord, PlayerScore } from '../types'

export interface HallOfFameData {
  membersLeaderboard: HallOfFameMember[];
  nemesis: RivalryStat | null;
  favoriteVictim: RivalryStat | null;
  gameRecords: GameRecord[];
  activeStreaks: WinStreakRecord[];
  totalSessionsPlayed: number;
  totalUniqueGames: number;
}

export function useGroupHallOfFame(groupId: string | undefined) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HallOfFameData>({
    membersLeaderboard: [],
    nemesis: null,
    favoriteVictim: null,
    gameRecords: [],
    activeStreaks: [],
    totalSessionsPlayed: 0,
    totalUniqueGames: 0
  })

  const fetchHallOfFame = useCallback(async () => {
    if (!groupId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (USE_MOCKS) {
        // Realistic mock statistics for immediate preview
        const mockMembers: HallOfFameMember[] = [
          {
            userId: user?.id || 'mock-u1',
            username: user?.user_metadata?.username || 'Tú (LudoMaster)',
            avatarUrl: user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            wins: 14,
            totalPlayed: 22,
            winRate: 64,
            currentStreak: 3,
            maxStreak: 5
          },
          {
            userId: 'mock-u2',
            username: 'Sara_Meeples',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
            wins: 11,
            totalPlayed: 20,
            winRate: 55,
            currentStreak: 0,
            maxStreak: 4
          },
          {
            userId: 'mock-u3',
            username: 'HexStrategist',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter',
            wins: 8,
            totalPlayed: 18,
            winRate: 44,
            currentStreak: 1,
            maxStreak: 3
          },
          {
            userId: 'mock-u4',
            username: 'Carlos_Dice',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
            wins: 4,
            totalPlayed: 15,
            winRate: 27,
            currentStreak: 0,
            maxStreak: 2
          }
        ]

        const mockNemesis: RivalryStat = {
          opponentId: 'mock-u2',
          opponentName: 'Sara_Meeples',
          opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
          count: 5,
          totalMatchesTogether: 14
        }

        const mockVictim: RivalryStat = {
          opponentId: 'mock-u3',
          opponentName: 'HexStrategist',
          opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter',
          count: 7,
          totalMatchesTogether: 12
        }

        const mockGameRecords: GameRecord[] = [
          {
            gameId: 13,
            gameTitle: 'Catan',
            gameImage: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/M_3swc5662Pmsr8eb8m-tOHFqAE=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg',
            highScore: 12,
            holderName: user?.user_metadata?.username || 'Tú (LudoMaster)',
            holderAvatar: user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            holderId: user?.id || 'mock-u1',
            date: '2026-08-14'
          },
          {
            gameId: 30549,
            gameTitle: 'Pandemic',
            gameImage: 'https://cf.geekdo-images.com/S3ybV1_xDY4NeaIIXdTXmA__thumb/img/h7K4yV0-fUq6gX_pEa3P31M4230=/fit-in/200x150/filters:strip_icc()/pic1534148.jpg',
            highScore: 4,
            holderName: 'Sara_Meeples',
            holderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
            holderId: 'mock-u2',
            date: '2026-07-28'
          },
          {
            gameId: 167791,
            gameTitle: 'Terraforming Mars',
            gameImage: 'https://cf.geekdo-images.com/wg9oOLcsKvDesqGGneUyRw__thumb/img/mK9kK2mK2oH1Kz-Wq1W5o_V7zY0=/fit-in/200x150/filters:strip_icc()/pic3536616.jpg',
            highScore: 114,
            holderName: user?.user_metadata?.username || 'Tú (LudoMaster)',
            holderAvatar: user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            holderId: user?.id || 'mock-u1',
            date: '2026-09-02'
          }
        ]

        const mockStreaks: WinStreakRecord[] = [
          {
            userId: user?.id || 'mock-u1',
            username: user?.user_metadata?.username || 'Tú (LudoMaster)',
            avatarUrl: user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            streakCount: 3,
            isActive: true
          }
        ]

        setData({
          membersLeaderboard: mockMembers,
          nemesis: mockNemesis,
          favoriteVictim: mockVictim,
          gameRecords: mockGameRecords,
          activeStreaks: mockStreaks,
          totalSessionsPlayed: 24,
          totalUniqueGames: 6
        })
        setLoading(false)
        return
      }

      // 1. Fetch group members with user profile details
      const { data: membersRows, error: membersErr } = await supabase
        .from('group_members')
        .select(`
          user_id,
          role,
          users:users!group_members_user_id_fkey (id, username, avatar_url)
        `)
        .eq('group_id', groupId)

      if (membersErr) throw membersErr

      // 1b. Fetch habitual group guests
      const { data: groupGuestsRows } = await supabase
        .from('group_guests')
        .select('id, name, avatar_url, associated_user_id')
        .eq('group_id', groupId)

      const memberProfilesMap = new Map<string, { username: string; avatar_url: string | null; isGuest: boolean }>()
      const guestNameToIdMap = new Map<string, string>()
      const guestIdToTargetIdMap = new Map<string, string>()

      membersRows?.forEach((row: any) => {
        if (row.users) {
          memberProfilesMap.set(row.user_id, {
            username: row.users.username || 'Jugador',
            avatar_url: row.users.avatar_url || null,
            isGuest: false,
          })
        }
      })

      groupGuestsRows?.forEach((g: any) => {
        const normName = g.name.toLowerCase().trim()
        if (g.associated_user_id && memberProfilesMap.has(g.associated_user_id)) {
          // If associated with a registered member, map all guest activity to that member
          guestIdToTargetIdMap.set(g.id, g.associated_user_id)
          guestNameToIdMap.set(normName, g.associated_user_id)
        } else {
          memberProfilesMap.set(g.id, {
            username: `${g.name} (Invitado)`,
            avatar_url: g.avatar_url || null,
            isGuest: true,
          })
          guestIdToTargetIdMap.set(g.id, g.id)
          guestNameToIdMap.set(normName, g.id)
        }
      })

      // Helper to resolve player IDs (registered or guests) to canonical profile
      const resolvePlayerId = (id: string | null | undefined, name?: string | null): string | null => {
        if (!id && !name) return null
        if (id && guestIdToTargetIdMap.has(id)) {
          return guestIdToTargetIdMap.get(id)!
        }
        if (id && memberProfilesMap.has(id)) {
          return id
        }
        if (name) {
          const norm = name.toLowerCase().trim()
          if (guestNameToIdMap.has(norm)) {
            const mappedId = guestNameToIdMap.get(norm)!
            if (id) guestIdToTargetIdMap.set(id, mappedId)
            return mappedId
          }
        }
        const fallbackId = id || `guest-name-${name}`
        if (!memberProfilesMap.has(fallbackId)) {
          const cleanName = name ? (name.includes('(Invitado)') ? name : `${name} (Invitado)`) : 'Invitado'
          memberProfilesMap.set(fallbackId, {
            username: cleanName,
            avatar_url: null,
            isGuest: true,
          })
          if (name) guestNameToIdMap.set(name.toLowerCase().trim(), fallbackId)
          if (id) guestIdToTargetIdMap.set(id, fallbackId)
        }
        return fallbackId
      }

      // 2. Fetch meetups for this group
      const { data: meetupsRows, error: meetupsErr } = await supabase
        .from('meetups')
        .select(`
          id,
          group_id,
          date,
          created_at,
          title,
          completed,
          player_scores,
          joined_players,
          attended_players,
          attended_guests,
          meetup_guests (
            id,
            guest_name
          ),
          meetup_games (
            game_id,
            winner_user_id,
            winner_guest_id,
            winner_score,
            games:games (
              bgg_id,
              title,
              title_es,
              image_url,
              image_url_es,
              is_expansion
            )
          )
        `)
        .eq('group_id', groupId)
        .order('date', { ascending: true })

      if (meetupsErr) throw meetupsErr

      // Maps for tracking statistics
      const winsMap = new Map<string, number>()
      const playedMap = new Map<string, number>()
      const playerGameHistory = new Map<string, { date: string; won: boolean }[]>()

      // Head-to-head tracking for logged-in user
      const currentUserId = user?.id
      const lossesAgainst = new Map<string, { count: number; name: string; avatar: string | null }>()
      const winsAgainst = new Map<string, { count: number; name: string; avatar: string | null }>()
      const matchesTogether = new Map<string, number>()

      // Game records map: gameId -> Best Record
      const recordsByGame = new Map<number, GameRecord>()
      const uniqueGameIds = new Set<number>()
      let totalSessions = 0

      meetupsRows?.forEach((meetup: any) => {
        const scores: PlayerScore[] = Array.isArray(meetup.player_scores) ? meetup.player_scores : []
        const gamesInMeetup: any[] = meetup.meetup_games || []
        const nonExpansionGames = gamesInMeetup.filter(mg => !mg.games?.is_expansion)
        const meetupDate = meetup.date || meetup.created_at

        // Map meetup_guests to canonical guest IDs
        if (Array.isArray(meetup.meetup_guests)) {
          meetup.meetup_guests.forEach((mg: any) => {
            if (mg.id && mg.guest_name) {
              const canonical = resolvePlayerId(mg.id, mg.guest_name)
              if (canonical) guestIdToTargetIdMap.set(mg.id, canonical)
            }
          })
        }

        // Only count finished matches with results
        const hasResults =
          meetup.completed === true ||
          scores.length > 0 ||
          gamesInMeetup.some(mg => mg.winner_user_id || mg.winner_guest_id || mg.winner_score)

        if (!hasResults) return

        // Extract winner(s) and participants
        const sessionParticipants = new Set<string>()

        // Add participants from player_scores
        scores.forEach(s => {
          const rawId = s.userId || s.guestId || s.name
          const pid = resolvePlayerId(rawId, s.name)
          if (pid) sessionParticipants.add(pid)
        })

        // Add participants from attended_players, joined_players, attended_guests, meetup_guests
        if (Array.isArray(meetup.attended_players)) {
          meetup.attended_players.forEach((pid: string) => {
            const resolved = resolvePlayerId(pid)
            if (resolved) sessionParticipants.add(resolved)
          })
        }
        if (Array.isArray(meetup.joined_players)) {
          meetup.joined_players.forEach((pid: string) => {
            const resolved = resolvePlayerId(pid)
            if (resolved) sessionParticipants.add(resolved)
          })
        }
        if (Array.isArray(meetup.attended_guests)) {
          meetup.attended_guests.forEach((gid: string) => {
            const resolved = resolvePlayerId(gid)
            if (resolved) sessionParticipants.add(resolved)
          })
        }
        if (Array.isArray(meetup.meetup_guests)) {
          meetup.meetup_guests.forEach((mg: any) => {
            const resolved = resolvePlayerId(mg.id, mg.guest_name)
            if (resolved) sessionParticipants.add(resolved)
          })
        }

        gamesInMeetup.forEach((mg: any) => {
          const rawWinner = mg.winner_user_id || mg.winner_guest_id
          const guestObj = meetup.meetup_guests?.find((g: any) => g.id === rawWinner)
          const resolved = resolvePlayerId(rawWinner, guestObj?.guest_name)
          if (resolved) sessionParticipants.add(resolved)
        })

        if (sessionParticipants.size > 0 || gamesInMeetup.length > 0) {
          totalSessions++
        }

        const effectiveGames = nonExpansionGames.length > 0
          ? nonExpansionGames
          : gamesInMeetup

        // Check each base game in session (expansions filtered out)
        effectiveGames.forEach((mg: any) => {
          const gameMeta = mg.games
          const gameId = mg.game_id || gameMeta?.bgg_id
          if (gameId) uniqueGameIds.add(gameId)

          const rawWinner = mg.winner_user_id || mg.winner_guest_id
          const guestObj = meetup.meetup_guests?.find((g: any) => g.id === rawWinner)
          const winnerId = resolvePlayerId(rawWinner, guestObj?.guest_name)
          const winnerScoreNum = mg.winner_score ? parseFloat(mg.winner_score) : null

          // Update game record if winner_score exists
          if (gameId && winnerScoreNum !== null && !isNaN(winnerScoreNum) && winnerId) {
            const currentRec = recordsByGame.get(gameId)
            const holderProfile = memberProfilesMap.get(winnerId)
            const candidateHolder = holderProfile?.username || guestObj?.guest_name || 'Anónimo'

            if (!currentRec || winnerScoreNum > currentRec.highScore) {
              recordsByGame.set(gameId, {
                gameId,
                gameTitle: gameMeta?.title_es || gameMeta?.title || meetup.title || 'Juego',
                gameImage: gameMeta?.image_url_es || gameMeta?.image_url || null,
                highScore: winnerScoreNum,
                holderName: candidateHolder,
                holderAvatar: holderProfile?.avatar_url || null,
                holderId: winnerId,
                date: meetupDate
              })
            }
          }

          // Register win for winner (registered user OR guest)
          if (winnerId) {
            winsMap.set(winnerId, (winsMap.get(winnerId) || 0) + 1)
          }
        })

        // Also check scores array for winners & game records
        scores.forEach(s => {
          const rawId = s.userId || s.guestId || s.name
          const pid = resolvePlayerId(rawId, s.name)
          if (!pid) return

          if (s.isWinner) {
            const alreadyCounted = effectiveGames.some((mg: any) => {
              const rawWinner = mg.winner_user_id || mg.winner_guest_id
              return resolvePlayerId(rawWinner) === pid
            })
            if (!alreadyCounted) {
              winsMap.set(pid, (winsMap.get(pid) || 0) + 1)
            }
          }

          if (s.score !== undefined && s.score !== null && !isNaN(Number(s.score)) && Number(s.score) > 0) {
            const numScore = Number(s.score)
            effectiveGames.forEach((mg: any) => {
              const gameId = mg.game_id || mg.games?.bgg_id
              if (gameId) {
                const currentRec = recordsByGame.get(gameId)
                if (!currentRec || numScore > currentRec.highScore) {
                  const prof = memberProfilesMap.get(pid)
                  recordsByGame.set(gameId, {
                    gameId,
                    gameTitle: mg.games?.title_es || mg.games?.title || meetup.title || 'Juego',
                    gameImage: mg.games?.image_url_es || mg.games?.image_url || null,
                    highScore: numScore,
                    holderName: prof?.username || s.name || 'Jugador',
                    holderAvatar: prof?.avatar_url || null,
                    holderId: pid,
                    date: meetupDate
                  })
                }
              }
            })
          }
        })

        // Track participation count and chronology for streaks
        sessionParticipants.forEach(pid => {
          playedMap.set(pid, (playedMap.get(pid) || 0) + 1)

          const wonInMeetup = effectiveGames.some((mg: any) => {
            const rawWinner = mg.winner_user_id || mg.winner_guest_id
            return resolvePlayerId(rawWinner) === pid
          }) || scores.some(s => {
            const spid = resolvePlayerId(s.userId || s.guestId || s.name, s.name)
            return spid === pid && s.isWinner
          })

          const history = playerGameHistory.get(pid) || []
          history.push({ date: meetupDate, won: wonInMeetup })
          playerGameHistory.set(pid, history)
        })

        // Head-to-Head calculations (Nemesis & Favorite Victim)
        if (currentUserId && sessionParticipants.has(currentUserId)) {
          const userWon = effectiveGames.some((mg: any) => {
            const rawWinner = mg.winner_user_id || mg.winner_guest_id
            return resolvePlayerId(rawWinner) === currentUserId
          }) || scores.some(s => {
            const spid = resolvePlayerId(s.userId || s.guestId || s.name, s.name)
            return spid === currentUserId && s.isWinner
          })

          sessionParticipants.forEach(otherPid => {
            if (otherPid === currentUserId) return
            matchesTogether.set(otherPid, (matchesTogether.get(otherPid) || 0) + 1)

            const prof = memberProfilesMap.get(otherPid)
            const otherName = prof?.username || otherPid
            const otherAvatar = prof?.avatar_url || null

            const otherWon = effectiveGames.some((mg: any) => {
              const rawWinner = mg.winner_user_id || mg.winner_guest_id
              return resolvePlayerId(rawWinner) === otherPid
            }) || scores.some(s => {
              const spid = resolvePlayerId(s.userId || s.guestId || s.name, s.name)
              return spid === otherPid && s.isWinner
            })

            if (userWon && !otherWon) {
              const prev = winsAgainst.get(otherPid) || { count: 0, name: otherName, avatar: otherAvatar }
              winsAgainst.set(otherPid, { ...prev, count: prev.count + 1 })
            } else if (!userWon && otherWon) {
              const prev = lossesAgainst.get(otherPid) || { count: 0, name: otherName, avatar: otherAvatar }
              lossesAgainst.set(otherPid, { ...prev, count: prev.count + 1 })
            }
          })
        }
      })

      // Calculate streaks per player
      const streaksMap = new Map<string, { current: number; max: number }>()
      playerGameHistory.forEach((history, pid) => {
        let max = 0
        let tempStreak = 0

        history.forEach(item => {
          if (item.won) {
            tempStreak++
            if (tempStreak > max) max = tempStreak
          } else {
            tempStreak = 0
          }
        })
        const current = tempStreak
        streaksMap.set(pid, { current, max })
      })

      // Build Members Leaderboard (including active guests who played)
      const allKnownPlayers = new Set<string>([
        ...Array.from(memberProfilesMap.keys()),
        ...Array.from(playedMap.keys())
      ])

      const membersLeaderboard: HallOfFameMember[] = Array.from(allKnownPlayers)
        .map(pid => {
          const profile = memberProfilesMap.get(pid) || { username: 'Jugador', avatar_url: null, isGuest: false }
          const wins = winsMap.get(pid) || 0
          const totalPlayed = playedMap.get(pid) || 0
          const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0
          const streakInfo = streaksMap.get(pid) || { current: 0, max: 0 }

          return {
            userId: pid,
            username: profile.username,
            avatarUrl: profile.avatar_url,
            wins,
            totalPlayed,
            winRate,
            currentStreak: streakInfo.current,
            maxStreak: streakInfo.max,
            isGuest: profile.isGuest
          }
        })
        .filter(m => m.totalPlayed > 0 || (memberProfilesMap.has(m.userId) && !m.isGuest))
        .sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins
          if (b.winRate !== a.winRate) return b.winRate - a.winRate
          return b.totalPlayed - a.totalPlayed
        })

      // Find Nemesis
      let nemesis: RivalryStat | null = null
      let maxLossCount = 0
      lossesAgainst.forEach((info, opId) => {
        if (info.count > maxLossCount) {
          maxLossCount = info.count
          nemesis = {
            opponentId: opId,
            opponentName: info.name,
            opponentAvatar: info.avatar,
            count: info.count,
            totalMatchesTogether: matchesTogether.get(opId) || info.count
          }
        }
      })

      // Find Favorite Victim
      let favoriteVictim: RivalryStat | null = null
      let maxWinCount = 0
      winsAgainst.forEach((info, opId) => {
        if (info.count > maxWinCount) {
          maxWinCount = info.count
          favoriteVictim = {
            opponentId: opId,
            opponentName: info.name,
            opponentAvatar: info.avatar,
            count: info.count,
            totalMatchesTogether: matchesTogether.get(opId) || info.count
          }
        }
      })

      // Active streaks
      const activeStreaks: WinStreakRecord[] = membersLeaderboard
        .filter(m => m.currentStreak >= 2)
        .map(m => ({
          userId: m.userId,
          username: m.username,
          avatarUrl: m.avatarUrl,
          streakCount: m.currentStreak,
          isActive: true
        }))
        .sort((a, b) => b.streakCount - a.streakCount)

      setData({
        membersLeaderboard,
        nemesis,
        favoriteVictim,
        gameRecords: Array.from(recordsByGame.values()),
        activeStreaks,
        totalSessionsPlayed: totalSessions,
        totalUniqueGames: uniqueGameIds.size
      })
    } catch (err: any) {
      console.error('Error fetching group hall of fame:', err)
      setError(err?.message || 'Error al cargar estadísticas del Salón de la Fama')
    } finally {
      setLoading(false)
    }
  }, [groupId, user?.id, user?.user_metadata])

  useEffect(() => {
    fetchHallOfFame()
  }, [fetchHallOfFame])

  return {
    ...data,
    loading,
    error,
    refreshHallOfFame: fetchHallOfFame
  }
}
