import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { USE_MOCKS } from '../lib/config'

export interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  created_at: string;
  member_count?: number;
}

export function useGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFirstLoad = useRef(true)

  const fetchGroups = useCallback(async () => {
    if (!user) {
      setGroups([])
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

      // Initialize defaults if they don't exist
      if (!localStorage.getItem(mockGroupsKey)) {
        const defaultGroups: Group[] = [
          {
            id: 'mock-gp1',
            name: 'Club del Dado de Madrid',
            description: 'Grupo para quedadas semanales de juegos de estrategia y euros pesados.',
            invite_code: 'GP-DADO12',
            creator_id: 'mock-u1',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-gp2',
            name: 'Los Frikis de los Fillers',
            description: 'Quedadas rápidas para party games y juegos de cartas los viernes por la tarde.',
            invite_code: 'GP-CARTAS',
            creator_id: 'mock-u2',
            created_at: new Date().toISOString()
          }
        ]
        localStorage.setItem(mockGroupsKey, JSON.stringify(defaultGroups))

        // Creator (u1 / u2) are automatically members, and current user joins both as member
        const defaultMembers = [
          { group_id: 'mock-gp1', user_id: 'mock-u1', role: 'admin' },
          { group_id: 'mock-gp1', user_id: 'mock-u2', role: 'member' },
          { group_id: 'mock-gp1', user_id: 'mock-u3', role: 'member' },
          { group_id: 'mock-gp1', user_id: user.id, role: 'member' },

          { group_id: 'mock-gp2', user_id: 'mock-u2', role: 'admin' },
          { group_id: 'mock-gp2', user_id: 'mock-u1', role: 'member' },
          { group_id: 'mock-gp2', user_id: user.id, role: 'member' }
        ]
        localStorage.setItem(mockMembersKey, JSON.stringify(defaultMembers))
      }

      const storedGroups: Group[] = JSON.parse(localStorage.getItem(mockGroupsKey) || '[]')
      const storedMembers = JSON.parse(localStorage.getItem(mockMembersKey) || '[]')

      // Filter groups where current user is a member
      const myGroups = storedGroups.filter(g => 
        storedMembers.some((m: any) => m.group_id === g.id && m.user_id === user.id)
      ).map(g => {
        const memberCount = storedMembers.filter((m: any) => m.group_id === g.id).length
        return { ...g, member_count: memberCount }
      })

      setGroups(myGroups)
      setLoading(false)
      return
    }

    try {
      // 1. Fetch group IDs where the user is a member
      const { data: memberRelations, error: relationsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      if (relationsError) throw relationsError

      if (!memberRelations || memberRelations.length === 0) {
        setGroups([])
        setLoading(false)
        return
      }

      const groupIds = memberRelations.map(m => m.group_id)

      // 2. Fetch those groups details
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)

      if (groupsError) throw groupsError

      // 3. For each group, count the members
      const { data: allMembers, error: membersError } = await supabase
        .from('group_members')
        .select('group_id')
        .in('group_id', groupIds)

      if (membersError) throw membersError

      const formattedGroups = (groupsData || []).map(g => {
        const count = (allMembers || []).filter(m => m.group_id === g.id).length
        return {
          ...g,
          member_count: count
        }
      })

      setGroups(formattedGroups)
    } catch (err: any) {
      console.error('Error fetching groups:', err)
      setError(err.message || 'Error al obtener los grupos')
    } finally {
      setLoading(false)
    }
  }, [user])

  const createGroup = async (name: string, description: string) => {
    if (!user) throw new Error('Debes iniciar sesión')
    
    // Generate code like GP-XXXXXX
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase()
    const inviteCode = `GP-${randomChars}`

    if (USE_MOCKS) {
      const mockGroupsKey = 'boardgame_social_mock_groups'
      const mockMembersKey = 'boardgame_social_mock_group_members'

      const storedGroups: Group[] = JSON.parse(localStorage.getItem(mockGroupsKey) || '[]')
      const storedMembers = JSON.parse(localStorage.getItem(mockMembersKey) || '[]')

      const newGroup: Group = {
        id: `mock-gp-${Date.now()}`,
        name,
        description: description || null,
        invite_code: inviteCode,
        creator_id: user.id,
        created_at: new Date().toISOString()
      }

      const updatedGroups = [...storedGroups, newGroup]
      const updatedMembers = [...storedMembers, { group_id: newGroup.id, user_id: user.id, role: 'admin' }]

      localStorage.setItem(mockGroupsKey, JSON.stringify(updatedGroups))
      localStorage.setItem(mockMembersKey, JSON.stringify(updatedMembers))

      await fetchGroups()
      return newGroup
    }

    // Live Supabase
    // 1. Insert Group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description: description || null,
        invite_code: inviteCode,
        creator_id: user.id
      })
      .select()
      .single()

    if (groupError) throw groupError

    // 2. Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: user.id,
        role: 'admin'
      })

    if (memberError) {
      // rollback group insertion if possible (cascade delete handles it if creator is deleted, but here we just throw)
      throw memberError
    }

    await fetchGroups()
    return groupData
  }

  const joinGroup = async (inviteCode: string) => {
    if (!user) throw new Error('Debes iniciar sesión')
    const formattedCode = inviteCode.trim().toUpperCase()

    if (USE_MOCKS) {
      const mockGroupsKey = 'boardgame_social_mock_groups'
      const mockMembersKey = 'boardgame_social_mock_group_members'

      const storedGroups: Group[] = JSON.parse(localStorage.getItem(mockGroupsKey) || '[]')
      const storedMembers = JSON.parse(localStorage.getItem(mockMembersKey) || '[]')

      const matchedGroup = storedGroups.find(g => g.invite_code === formattedCode)
      if (!matchedGroup) {
        throw new Error('Código de invitación no encontrado')
      }

      // Check if already member
      const isMember = storedMembers.some((m: any) => m.group_id === matchedGroup.id && m.user_id === user.id)
      if (isMember) {
        throw new Error('Ya eres miembro de este grupo')
      }

      const updatedMembers = [...storedMembers, { group_id: matchedGroup.id, user_id: user.id, role: 'member' }]
      localStorage.setItem(mockMembersKey, JSON.stringify(updatedMembers))

      await fetchGroups()
      return matchedGroup
    }

    // Live Supabase
    // Join using the secure SECURITY DEFINER RPC function
    const { data: groupData, error: joinError } = await supabase
      .rpc('join_group_by_invite_code', { p_invite_code: formattedCode })

    if (joinError) {
      if (joinError.code === 'P0002') {
        throw new Error('Código de invitación no encontrado')
      }
      if (joinError.code === '23505') {
        throw new Error('Ya eres miembro de este grupo')
      }
      throw new Error(joinError.message || 'Error al unirse al grupo')
    }

    if (!groupData) {
      throw new Error('Código de invitación no encontrado')
    }

    await fetchGroups()
    return groupData as any
  }

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    loading,
    error,
    createGroup,
    joinGroup,
    refresh: fetchGroups
  }
}
