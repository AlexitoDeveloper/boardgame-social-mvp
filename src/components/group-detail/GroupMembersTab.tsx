import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Users, Search, X } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { GroupMember, GroupGuest } from '../../hooks/useGroupDetail'
import { User } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import { AddGroupGuestModal } from './AddGroupGuestModal'
import { AssociateGuestModal } from './AssociateGuestModal'
import { GroupMemberCard } from './GroupMemberCard'
import { GroupGuestCard } from './GroupGuestCard'

interface GroupMembersTabProps {
  members: GroupMember[]
  guests?: GroupGuest[]
  user: User | null
  group: any
  isAdmin: boolean
  handleKick: (userId: string, username: string) => void
  onAddGuest?: (name: string) => Promise<boolean | void>
  onRemoveGuest?: (guestId: string) => Promise<void>
  onAssociateGuest?: (guestId: string, userId: string) => Promise<void>
}

export const GroupMembersTab: React.FC<GroupMembersTabProps> = ({
  members,
  guests = [],
  user,
  group,
  isAdmin,
  handleKick,
  onAddGuest,
  onRemoveGuest,
  onAssociateGuest,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const language = i18n.language as any

  const [searchQuery, setSearchQuery] = useState('')
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
  const [associatingGuest, setAssociatingGuest] = useState<GroupGuest | null>(null)

  const handleProfileClick = (memberUsername: string, memberUserId: string) => {
    if (memberUserId === user?.id) {
      navigate('/perfil')
    } else {
      navigate(`/perfil/${memberUsername}`)
    }
  }

  const query = searchQuery.trim().toLowerCase()

  const filteredMembers = useMemo(() => {
    if (!query) return members
    return members.filter((m) => m.username.toLowerCase().includes(query))
  }, [members, query])

  const filteredGuests = useMemo(() => {
    if (!query) return guests
    return guests.filter((g) => g.name.toLowerCase().includes(query))
  }, [guests, query])

  const existingGuestNames = guests.map((g) => g.name)
  const totalCount = members.length + guests.length
  const hasNoSearchResults = query.length > 0 && filteredMembers.length === 0 && filteredGuests.length === 0

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search Bar (Phase 2 Ergonomic Quick Filter) */}
      {totalCount > 3 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('groups.searchMembersPlaceholder', 'Buscar miembros o invitados...')}
            className="pl-10 pr-9 h-11 bg-card/60 border-border/40 rounded-xl text-sm"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
              aria-label={t('common.clear', 'Limpiar')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {hasNoSearchResults && (
        <Card className="p-8 text-center border-dashed border-border/50 bg-card/30 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t('groups.noMembersFound', 'No se encontraron resultados')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('groups.noMembersFoundDesc', 'No hay ningún miembro ni invitado que coincida con "{{query}}"', { query: searchQuery })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="rounded-xl font-bold text-xs h-9 mt-2"
          >
            {t('common.clearFilter', 'Limpiar búsqueda')}
          </Button>
        </Card>
      )}

      {/* 1. Registered Members Section */}
      {filteredMembers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black font-display tracking-tight text-foreground flex items-center gap-2">
              <span>{t('groups.participants', 'Miembros del Grupo')}</span>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-bold">
                {filteredMembers.length}
              </Badge>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMembers.map((member) => (
              <GroupMemberCard
                key={member.user_id}
                member={member}
                isMe={member.user_id === user?.id}
                isMemberCreator={member.user_id === group?.creator_id}
                isMemberAdmin={member.role === 'admin'}
                canKick={Boolean(isAdmin && member.user_id !== group?.creator_id && member.user_id !== user?.id)}
                onProfileClick={() => handleProfileClick(member.username, member.user_id)}
                onKick={() => handleKick(member.user_id, member.username)}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Habitual Group Guests Section */}
      {(!query || filteredGuests.length > 0) && (
        <div className="space-y-3 pt-3 border-t border-border/20">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>{t('groups.habitualGuests', 'Invitados Habituales')}</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5 font-bold">
                  {filteredGuests.length}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('groups.habitualGuestsDesc', 'Jugadores frecuentes que juegan con el grupo y pueden vincularse a su cuenta al unirse.')}
              </p>
            </div>

            {onAddGuest && (
              <Button
                size="sm"
                onClick={() => setIsAddGuestOpen(true)}
                className="rounded-xl font-bold text-xs h-10 px-3.5 gap-1.5 shadow-sm shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('groups.addGuestBtn', 'Añadir')}</span>
              </Button>
            )}
          </div>

          {guests.length === 0 ? (
            <Card className="p-6 text-center border-dashed border-border/50 bg-card/30 rounded-2xl space-y-2">
              <p className="text-xs text-muted-foreground">
                {t('groups.noGuestsYet', 'No hay invitados habituales registrados en el grupo.')}
              </p>
              {onAddGuest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddGuestOpen(true)}
                  className="rounded-xl font-bold text-xs h-9 gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('groups.addFirstGuest', 'Registrar primer invitado')}</span>
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredGuests.map((guest) => {
                const associatedMember = guest.associated_user_id
                  ? members.find((m) => m.user_id === guest.associated_user_id)
                  : null

                return (
                  <GroupGuestCard
                    key={guest.id}
                    guest={guest}
                    associatedMember={associatedMember}
                    isAdmin={isAdmin}
                    onAssociate={onAssociateGuest ? () => setAssociatingGuest(guest) : undefined}
                    onRemove={onRemoveGuest ? () => onRemoveGuest(guest.id) : undefined}
                    onProfileClick={(uname) => navigate(`/perfil/${uname}`)}
                    language={language}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {onAddGuest && (
        <AddGroupGuestModal
          isOpen={isAddGuestOpen}
          onClose={() => setIsAddGuestOpen(false)}
          onAddGuest={onAddGuest}
          existingGuestNames={existingGuestNames}
        />
      )}

      {onAssociateGuest && associatingGuest && (
        <AssociateGuestModal
          isOpen={Boolean(associatingGuest)}
          onClose={() => setAssociatingGuest(null)}
          guest={associatingGuest}
          members={members}
          onAssociate={onAssociateGuest}
        />
      )}
    </div>
  )
}
