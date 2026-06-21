import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { USE_MOCKS } from '../lib/config'
import { Game } from '../types'

export interface GroupMember {
  user_id: string;
  username: string;
  avatar_url: string | null;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface MergedGame {
  game: Game;
  owners: {
    user_id: string;
    username: string;
    avatar_url: string | null;
  }[];
}

export interface PollOption {
  id: string;
  game_id: number;
  game: Game;
  votes: {
    user_id: string;
    username: string;
    avatar_url: string | null;
  }[];
}

export interface GroupPoll {
  id: string;
  title: string;
  description: string | null;
  meetup_date: string | null;
  status: 'open' | 'closed';
  created_at: string;
  options: PollOption[];
}

export function useGroupDetail(groupId: string | undefined) {
  const { user } = useAuth()
  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [mergedCollection, setMergedCollection] = useState<MergedGame[]>([])
  const [polls, setPolls] = useState<GroupPoll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFirstLoad = useRef(true)

  const fetchDetails = useCallback(async () => {
    if (!groupId || !user) {
      setLoading(false)
      return
    }

    if (isFirstLoad.current) {
      setLoading(true)
      isFirstLoad.current = false
    }
    setError(null)

    if (USE_MOCKS) {
      // Mock LocalStorage Implementation
      const mockGroupsKey = 'boardgame_social_mock_groups'
      const mockMembersKey = 'boardgame_social_mock_group_members'
      const mockPollsKey = 'boardgame_social_mock_group_polls'
      const mockPollOptionsKey = 'boardgame_social_mock_group_poll_options'
      const mockPollVotesKey = 'boardgame_social_mock_group_poll_votes'

      const storedGroups = JSON.parse(localStorage.getItem(mockGroupsKey) || '[]')
      const storedMembers = JSON.parse(localStorage.getItem(mockMembersKey) || '[]')

      const foundGroup = storedGroups.find((g: any) => g.id === groupId)
      if (!foundGroup) {
        setError('Grupo no encontrado')
        setLoading(false)
        return
      }

      setGroup(foundGroup)

      // Fetch Mock User Profiles
      const mockProfiles: Record<string, { username: string; avatar_url: string | null }> = {
        'mock-u1': { username: 'boardgamer_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        'mock-u2': { username: 'meeple_sara', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
        'mock-u3': { username: 'hex_and_counter', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter' },
        [user.id]: { username: user.user_metadata?.username || user.email?.split('@')[0] || 'Tú', avatar_url: user.user_metadata?.avatar_url || null }
      }

      // Filter members
      const activeMembers = storedMembers.filter((m: any) => m.group_id === groupId).map((m: any) => {
        const prof = mockProfiles[m.user_id] || { username: 'Usuario Anónimo', avatar_url: null }
        return {
          user_id: m.user_id,
          username: prof.username,
          avatar_url: prof.avatar_url,
          role: m.role,
          joined_at: m.joined_at || new Date().toISOString()
        }
      })
      setMembers(activeMembers)

      // Merge Collections of all group members
      const mockCollections: Record<string, number[]> = {
        'mock-u1': [224517, 13], // Brass: Birmingham, Catan
        'mock-u2': [37111, 13],  // Dixit, Catan
        'mock-u3': [12333, 167791], // Twilight Imperium, Terraforming Mars
        [user.id]: [224517, 37111] // Current user owns Brass and Dixit as well
      }

      // Database games pool
      const mockGamesPool: Record<number, Game> = {
        224517: { bgg_id: 224517, title: 'Brass: Birmingham', image_url: 'https://cf.geekdo-images.com/x3zx67yIQZGCE8uOiCL1Zg__micro/img/h7qV4LiJkH4c94W1_P5C41g_Jpg=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg' },
        13: { bgg_id: 13, title: 'Catan', image_url: 'https://cf.geekdo-images.com/S3ybV1LAw-8SnK9IPdJVmg__micro/img/7bM8c6P2dG22a1tN7s_b8JtQJ9k=/fit-in/64x64/filters:strip_icc()/pic2419375.jpg' },
        37111: { bgg_id: 37111, title: 'Dixit', image_url: 'https://cf.geekdo-images.com/Z4w23G4KjgVigGGD65y2og__micro/img/zO8vE1hHh2-yP1C3yK7WqQ96u-8=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg' },
        12333: { bgg_id: 12333, title: 'Twilight Imperium (Fourth Edition)', image_url: 'https://cf.geekdo-images.com/P-72pd19H4c94W1_P5C41g_Jpg=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg' },
        167791: { bgg_id: 167791, title: 'Terraforming Mars', image_url: 'https://cf.geekdo-images.com/7bM8c6P2dG22a1tN7s_b8JtQJ9k=/fit-in/64x64/filters:strip_icc()/pic2419375.jpg' }
      }

      const mergedMap: Record<number, { user_id: string; username: string; avatar_url: string | null }[]> = {}

      activeMembers.forEach((member: any) => {
        const gameIds = mockCollections[member.user_id] || []
        gameIds.forEach((gameId) => {
          if (!mergedMap[gameId]) {
            mergedMap[gameId] = []
          }
          mergedMap[gameId].push({
            user_id: member.user_id,
            username: member.username,
            avatar_url: member.avatar_url
          })
        })
      })

      const formattedMerged: MergedGame[] = Object.entries(mergedMap).map(([idStr, ownersList]) => {
        const bgg_id = parseInt(idStr, 10)
        const gameObj = mockGamesPool[bgg_id] || { bgg_id, title: `Juego #${bgg_id}`, image_url: null }
        return {
          game: gameObj,
          owners: ownersList
        }
      })

      setMergedCollection(formattedMerged)

      // Fetch Polls
      const storedPolls = JSON.parse(localStorage.getItem(mockPollsKey) || '[]')
      const storedOptions = JSON.parse(localStorage.getItem(mockPollOptionsKey) || '[]')
      const storedVotes = JSON.parse(localStorage.getItem(mockPollVotesKey) || '[]')

      const groupPolls = storedPolls.filter((p: any) => p.group_id === groupId).map((p: any) => {
        const pollOptions = storedOptions.filter((opt: any) => opt.poll_id === p.id).map((opt: any) => {
          const gameObj = mockGamesPool[opt.game_id] || { bgg_id: opt.game_id, title: `Juego #${opt.game_id}`, image_url: null }
          const gameVotes = storedVotes.filter((v: any) => v.poll_id === p.id && v.game_id === opt.game_id).map((v: any) => {
            const prof = mockProfiles[v.user_id] || { username: 'Anónimo', avatar_url: null }
            return {
              user_id: v.user_id,
              username: prof.username,
              avatar_url: prof.avatar_url
            }
          })

          return {
            id: opt.id,
            game_id: opt.game_id,
            game: gameObj,
            votes: gameVotes
          }
        })

        return {
          id: p.id,
          title: p.title,
          description: p.description || null,
          meetup_date: p.meetup_date || null,
          status: p.status,
          created_at: p.created_at,
          options: pollOptions
        }
      })

      setPolls(groupPolls)
      setLoading(false)
      return
    }

    // Live Supabase
    try {
      // 1. Fetch Group details
      const { data: groupData, error: groupErr } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupErr) throw groupErr
      setGroup(groupData)

      // 2. Fetch Members & profiles
      const { data: membersData, error: membersErr } = await supabase
        .from('group_members')
        .select('user_id, role, joined_at, users:users (username, avatar_url)')
        .eq('group_id', groupId)

      if (membersErr) throw membersErr

      const mappedMembers = (membersData || []).map((m: any) => ({
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        username: m.users?.username || 'Usuario',
        avatar_url: m.users?.avatar_url || null
      }))
      setMembers(mappedMembers)

      // 3. Merged Collection: fetch collections of all member IDs
      const memberIds = mappedMembers.map(m => m.user_id)
      const { data: collectionData, error: collectionErr } = await supabase
        .from('user_collection')
        .select('user_id, game_id, games:games (*)')
        .in('user_id', memberIds)

      if (collectionErr) throw collectionErr

      const gameOwnersMap: Record<number, { game: Game, owners: any[] }> = {}
      ;(collectionData || []).forEach((item: any) => {
        if (!item.games) return
        const gId = item.game_id
        const ownerProfile = mappedMembers.find(m => m.user_id === item.user_id)

        if (!gameOwnersMap[gId]) {
          gameOwnersMap[gId] = {
            game: item.games,
            owners: []
          }
        }
        if (ownerProfile) {
          gameOwnersMap[gId].owners.push({
            user_id: ownerProfile.user_id,
            username: ownerProfile.username,
            avatar_url: ownerProfile.avatar_url
          })
        }
      })

      setMergedCollection(Object.values(gameOwnersMap))

      // 4. Fetch Polls, options, and votes
      const { data: pollsData, error: pollsErr } = await supabase
        .from('group_polls')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (pollsErr) throw pollsErr

      if (!pollsData || pollsData.length === 0) {
        setPolls([])
      } else {
        const pollIds = pollsData.map((p: any) => p.id)

        // Fetch options and votes in parallel
        const [optionsRes, votesRes] = await Promise.all([
          supabase
            .from('group_poll_options')
            .select(`
              id,
              poll_id,
              game_id,
              game:games (*)
            `)
            .in('poll_id', pollIds),
          supabase
            .from('group_poll_votes')
            .select(`
              poll_id,
              user_id,
              game_id,
              users:users (username, avatar_url)
            `)
            .in('poll_id', pollIds)
        ])

        if (optionsRes.error) throw optionsRes.error
        if (votesRes.error) throw votesRes.error

        const optionsData = optionsRes.data || []
        const votesData = votesRes.data || []

        const formattedPolls = pollsData.map((p: any) => {
          const pollOptions = optionsData.filter((opt: any) => opt.poll_id === p.id)
          const pollVotes = votesData.filter((v: any) => v.poll_id === p.id)

          const formattedOptions = pollOptions.map((opt: any) => {
            const optVotes = pollVotes
              .filter((v: any) => v.game_id === opt.game_id)
              .map((v: any) => ({
                user_id: v.user_id,
                username: v.users?.username || 'Usuario',
                avatar_url: v.users?.avatar_url || null
              }))

            return {
              id: opt.id,
              game_id: opt.game_id,
              game: opt.game,
              votes: optVotes
            }
          })

          return {
            id: p.id,
            title: p.title,
            description: p.description,
            meetup_date: p.meetup_date,
            status: p.status,
            created_at: p.created_at,
            options: formattedOptions
          }
        })

        setPolls(formattedPolls)
      }
    } catch (err: any) {
      console.error('Error fetching group detail:', err)
      setError(err.message || 'Error al cargar detalles del grupo')
    } finally {
      setLoading(false)
    }
  }, [groupId, user])

  const createPoll = async (title: string, description: string, meetupDate: string | null, gameIds: number[]) => {
    if (!groupId || !user) throw new Error('No autorizado')

    if (USE_MOCKS) {
      const mockPollsKey = 'boardgame_social_mock_group_polls'
      const mockPollOptionsKey = 'boardgame_social_mock_group_poll_options'

      const storedPolls = JSON.parse(localStorage.getItem(mockPollsKey) || '[]')
      const storedOptions = JSON.parse(localStorage.getItem(mockPollOptionsKey) || '[]')

      const newPollId = `mock-p-${Date.now()}`
      const newPoll = {
        id: newPollId,
        group_id: groupId,
        title,
        description: description || null,
        meetup_date: meetupDate || null,
        status: 'open',
        created_at: new Date().toISOString()
      }

      const newOptions = gameIds.map(gId => ({
        id: `mock-opt-${Math.random()}`,
        poll_id: newPollId,
        game_id: gId
      }))

      localStorage.setItem(mockPollsKey, JSON.stringify([...storedPolls, newPoll]))
      localStorage.setItem(mockPollOptionsKey, JSON.stringify([...storedOptions, ...newOptions]))

      await fetchDetails()
      return
    }

    // Live Supabase
    // 1. Create Poll
    const { data: pollData, error: pollErr } = await supabase
      .from('group_polls')
      .insert({
        group_id: groupId,
        title,
        description: description || null,
        meetup_date: meetupDate || null
      })
      .select()
      .single()

    if (pollErr) throw pollErr

    // 2. Insert nominated options
    const optionRows = gameIds.map(gId => ({
      poll_id: pollData.id,
      game_id: gId
    }))

    const { error: optionsErr } = await supabase
      .from('group_poll_options')
      .insert(optionRows)

    if (optionsErr) throw optionsErr

    await fetchDetails()
  }

  const voteGame = async (pollId: string, gameId: number) => {
    if (!user) return

    if (USE_MOCKS) {
      const mockPollVotesKey = 'boardgame_social_mock_group_poll_votes'
      const storedVotes = JSON.parse(localStorage.getItem(mockPollVotesKey) || '[]')

      const existingIndex = storedVotes.findIndex((v: any) => v.poll_id === pollId && v.user_id === user.id && v.game_id === gameId)

      let updatedVotes = []
      if (existingIndex > -1) {
        updatedVotes = storedVotes.filter((_: any, i: number) => i !== existingIndex)
      } else {
        updatedVotes = [...storedVotes, { id: `mock-v-${Date.now()}`, poll_id: pollId, user_id: user.id, game_id: gameId }]
      }

      localStorage.setItem(mockPollVotesKey, JSON.stringify(updatedVotes))
      await fetchDetails()
      return
    }

    // Live Supabase
    // Check if user already voted for this game
    const { data: existingVote } = await supabase
      .from('group_poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .maybeSingle()

    if (existingVote) {
      // Remove vote
      await supabase
        .from('group_poll_votes')
        .delete()
        .eq('id', existingVote.id)
    } else {
      // Cast vote
      await supabase
        .from('group_poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          game_id: gameId
        })
    }

    await fetchDetails()
  }

  const closePoll = async (pollId: string) => {
    if (USE_MOCKS) {
      const mockPollsKey = 'boardgame_social_mock_group_polls'
      const storedPolls = JSON.parse(localStorage.getItem(mockPollsKey) || '[]')

      const updatedPolls = storedPolls.map((p: any) => {
        if (p.id === pollId) {
          return { ...p, status: 'closed' }
        }
        return p
      })

      localStorage.setItem(mockPollsKey, JSON.stringify(updatedPolls))
      await fetchDetails()
      return
    }

    // Live Supabase
    const { error } = await supabase
      .from('group_polls')
      .update({ status: 'closed' })
      .eq('id', pollId)

    if (error) throw error
    await fetchDetails()
  }

  const leaveGroup = async () => {
    if (!groupId || !user) return

    if (USE_MOCKS) {
      const mockMembersKey = 'boardgame_social_mock_group_members'
      const storedMembers = JSON.parse(localStorage.getItem(mockMembersKey) || '[]')

      const updatedMembers = storedMembers.filter((m: any) => !(m.group_id === groupId && m.user_id === user.id))
      localStorage.setItem(mockMembersKey, JSON.stringify(updatedMembers))
      return
    }

    // Live Supabase
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id)

    if (error) throw error
  }

  const kickMember = async (targetUserId: string) => {
    if (!groupId) return

    if (USE_MOCKS) {
      const mockMembersKey = 'boardgame_social_mock_group_members'
      const storedMembers = JSON.parse(localStorage.getItem(mockMembersKey) || '[]')

      const updatedMembers = storedMembers.filter((m: any) => !(m.group_id === groupId && m.user_id === targetUserId))
      localStorage.setItem(mockMembersKey, JSON.stringify(updatedMembers))
      await fetchDetails()
      return
    }

    // Live Supabase
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', targetUserId)

    if (error) throw error
    await fetchDetails()
  }

  const deleteGroup = async () => {
    if (!groupId) return

    if (USE_MOCKS) {
      const mockGroupsKey = 'boardgame_social_mock_groups'
      const mockMembersKey = 'boardgame_social_mock_group_members'

      const storedGroups = JSON.parse(localStorage.getItem(mockGroupsKey) || '[]')
      const storedMembers = JSON.parse(localStorage.getItem(mockMembersKey) || '[]')

      const updatedGroups = storedGroups.filter((g: any) => g.id !== groupId)
      const updatedMembers = storedMembers.filter((m: any) => m.group_id !== groupId)

      localStorage.setItem(mockGroupsKey, JSON.stringify(updatedGroups))
      localStorage.setItem(mockMembersKey, JSON.stringify(updatedMembers))
      return
    }

    // Live Supabase
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (error) throw error
  }

  useEffect(() => {
    isFirstLoad.current = true
  }, [groupId])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  return {
    group,
    members,
    mergedCollection,
    polls,
    loading,
    error,
    createPoll,
    voteGame,
    closePoll,
    leaveGroup,
    kickMember,
    deleteGroup,
    refresh: fetchDetails
  }
}
