import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Group } from './useGroups'

interface UseGroupActionsProps {
  groups: Group[]
  joinGroup: (inviteCode: string) => Promise<Group>
  createGroup: (name: string, description: string) => Promise<Group>
}

export function useGroupActions({ groups, joinGroup, createGroup }: UseGroupActionsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  // Modal Open States
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Auto-join via ?join=CODE
  const [autoJoining, setAutoJoining] = useState(false)
  const [autoJoinMessage, setAutoJoinMessage] = useState<string | null>(null)

  // Join Form State
  const [inviteCode, setInviteCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Create Form State
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // 1-touch auto-join via URL param ?join=CODE
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const joinCode = params.get('join')
    if (joinCode && !autoJoining) {
      const processAutoJoin = async () => {
        setAutoJoining(true)
        setAutoJoinMessage(t('groups.joiningGroup'))
        try {
          const joined = await joinGroup(joinCode)
          navigate(`/grupos/${joined.id}`, { replace: true })
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : t('groups.joinError')
          const existing = groups.find(
            (g) => g.invite_code.toUpperCase() === joinCode.trim().toUpperCase()
          )
          if (existing) {
            navigate(`/grupos/${existing.id}`, { replace: true })
          } else {
            setAutoJoinMessage(errorMessage)
            setTimeout(() => setAutoJoining(false), 3500)
          }
        }
      }
      processAutoJoin()
    }
  }, [location.search, groups, joinGroup, navigate, t, autoJoining])

  // Listen to ?create=true search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('create') === 'true') {
      setIsCreateOpen(true)
      navigate('/grupos', { replace: true })
    }
  }, [location.search, navigate])

  const openJoinModal = useCallback(() => {
    setJoinError(null)
    setInviteCode('')
    setIsJoinOpen(true)
  }, [])

  const closeJoinModal = useCallback(() => {
    if (!joinLoading) {
      setIsJoinOpen(false)
      setJoinError(null)
      setInviteCode('')
    }
  }, [joinLoading])

  const openCreateModal = useCallback(() => {
    setCreateError(null)
    setGroupName('')
    setGroupDesc('')
    setIsCreateOpen(true)
  }, [])

  const closeCreateModal = useCallback(() => {
    if (!createLoading) {
      setIsCreateOpen(false)
      setCreateError(null)
      setGroupName('')
      setGroupDesc('')
    }
  }, [createLoading])

  const handleJoinSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const code = inviteCode.trim()
      if (!code) return

      setJoinLoading(true)
      setJoinError(null)
      try {
        const joined = await joinGroup(code)
        setIsJoinOpen(false)
        setInviteCode('')
        navigate(`/grupos/${joined.id}`)
      } catch (err: unknown) {
        setJoinError(err instanceof Error ? err.message : t('groups.joinError'))
      } finally {
        setJoinLoading(false)
      }
    },
    [inviteCode, joinGroup, navigate, t]
  )

  const handleCreateSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const name = groupName.trim()
      if (!name) return

      setCreateLoading(true)
      setCreateError(null)
      try {
        const created = await createGroup(name, groupDesc.trim())
        setIsCreateOpen(false)
        setGroupName('')
        setGroupDesc('')
        navigate(`/grupos/${created.id}`)
      } catch (err: unknown) {
        setCreateError(err instanceof Error ? err.message : t('groups.createError'))
      } finally {
        setCreateLoading(false)
      }
    },
    [groupName, groupDesc, createGroup, navigate, t]
  )

  return {
    isJoinOpen,
    openJoinModal,
    closeJoinModal,
    inviteCode,
    setInviteCode,
    joinLoading,
    joinError,
    handleJoinSubmit,

    isCreateOpen,
    openCreateModal,
    closeCreateModal,
    groupName,
    setGroupName,
    groupDesc,
    setGroupDesc,
    createLoading,
    createError,
    handleCreateSubmit,

    autoJoining,
    autoJoinMessage,
  }
}
