import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Meetup, UserProfile, MeetupMessage } from '../types'

export function useMeetupChat(
  meetupId: string | undefined,
  currentUser: User | null,
  guestReservation: { id: string; name: string } | null,
  meetup: Meetup | null,
  attendees: UserProfile[]
) {
  const [messages, setMessages] = useState<MeetupMessage[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isMock = meetupId ? meetupId.startsWith('mock-') : false

  // Determine if current user is an attendee (registered or shadow guest)
  const isAttendee = useCallback(() => {
    if (!meetupId || !meetup) return false

    // Registered user
    if (currentUser) {
      const isCreator = meetup.creator_id === currentUser.id
      const isJoined = meetup.joined_players?.includes(currentUser.id)
      return isCreator || isJoined
    }

    // Shadow guest user
    if (guestReservation) {
      return attendees.some(attendee => attendee.id === guestReservation.id)
    }

    return false
  }, [meetupId, meetup, currentUser, guestReservation, attendees])

  // Get initial fallback messages for mock meetups
  const getMockDefaultMessages = (mId: string): MeetupMessage[] => {
    const defaultMessages: Record<string, MeetupMessage[]> = {
      'mock-m1': [
        {
          id: 'mock-msg-init1',
          meetup_id: mId,
          user_id: 'mock-u1',
          guest_id: null,
          sender_name: 'boardgamer_alex',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          content: '¡Hola a todos! Qué ganas de jugar a Terraforming Mars. ¿Alguien se trae la expansión de Preludio?',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
        },
        {
          id: 'mock-msg-init2',
          meetup_id: mId,
          user_id: 'mock-u2',
          guest_id: null,
          sender_name: 'meeple_sara',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
          content: '¡Yo la tengo! Me la llevo sin falta. ¿Trae alguien fundas para las cartas?',
          created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() // 1.5 hours ago
        },
        {
          id: 'mock-msg-init3',
          meetup_id: mId,
          user_id: 'mock-u3',
          guest_id: null,
          sender_name: 'hex_and_counter',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter',
          content: 'Perfecto, yo llevaré el juego base organizado en su inserto para agilizar el setup.',
          created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }
      ],
      'mock-m2': [
        {
          id: 'mock-msg-init-m2-1',
          meetup_id: mId,
          user_id: 'mock-u3',
          guest_id: null,
          sender_name: 'hex_and_counter',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter',
          content: 'Buenas, es mi primera partida a Wingspan. ¿Os importa explicar las reglas básicas antes de empezar?',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'mock-msg-init-m2-2',
          meetup_id: mId,
          user_id: 'mock-u1',
          guest_id: null,
          sender_name: 'boardgamer_alex',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          content: '¡Claro que no! Se explica en 10 minutos, es muy amigable. Trae algo de picar si quieres.',
          created_at: new Date(Date.now() - 3600000 * 3.5).toISOString()
        }
      ]
    }
    return defaultMessages[mId] || []
  }

  // Load chat messages and listen to realtime updates
  useEffect(() => {
    if (!meetupId) return

    setLoading(true)
    setError(null)

    if (isMock) {
      // Mock flow using localStorage
      const storageKey = `boardgame_social_mock_chat_${meetupId}`
      const savedMessagesStr = localStorage.getItem(storageKey)
      if (savedMessagesStr) {
        setMessages(JSON.parse(savedMessagesStr))
      } else {
        const defaults = getMockDefaultMessages(meetupId)
        setMessages(defaults)
        localStorage.setItem(storageKey, JSON.stringify(defaults))
      }
      setLoading(false)
    } else {
      // Supabase Realtime Flow
      const fetchHistory = async () => {
        try {
          const { data, error: fetchError } = await supabase
            .from('meetup_messages')
            .select('*')
            .eq('meetup_id', meetupId)
            .order('created_at', { ascending: true })

          if (fetchError) throw fetchError
          setMessages(data || [])
        } catch (err: any) {
          console.error('Error fetching chat history:', err)
          setError(err.message || 'No se pudo cargar el historial del chat.')
        } finally {
          setLoading(false)
        }
      }

      fetchHistory()

      // Set up Realtime subscription
      const channel = supabase
        .channel(`meetup_chat_${meetupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'meetup_messages',
            filter: `meetup_id=eq.${meetupId}`
          },
          (payload) => {
            const newMessage = payload.new as MeetupMessage
            setMessages((prev) => {
              // Avoid duplicate messages
              if (prev.some((m) => m.id === newMessage.id)) return prev
              return [...prev, newMessage]
            })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [meetupId, isMock])

  // Send message function
  const sendMessage = async (content: string) => {
    if (!meetupId) return
    const trimmed = content.trim()
    if (!trimmed) return

    if (!isAttendee()) {
      throw new Error('Debes estar unido a la partida para enviar mensajes.')
    }

    // Determine sender identity and avatar URL
    let user_id: string | null = null
    let guest_id: string | null = null
    let sender_name = 'Anónimo'
    let avatar_url: string | null = null

    if (currentUser) {
      user_id = currentUser.id
      sender_name = currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Tú'
      avatar_url = currentUser.user_metadata?.avatar_url || null
    } else if (guestReservation) {
      guest_id = guestReservation.id
      sender_name = guestReservation.name
      avatar_url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestReservation.name)}`
    } else {
      throw new Error('No se pudo identificar al remitente del mensaje.')
    }

    if (isMock) {
      // Save message locally
      const storageKey = `boardgame_social_mock_chat_${meetupId}`
      const newMsg: MeetupMessage = {
        id: `mock-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        meetup_id: meetupId,
        user_id,
        guest_id,
        sender_name,
        avatar_url,
        content: trimmed,
        created_at: new Date().toISOString()
      }

      setMessages((prev) => {
        const updated = [...prev, newMsg]
        localStorage.setItem(storageKey, JSON.stringify(updated))
        return updated
      })

      // Simulate a mock bot reply after 1.5 seconds for premium/live feel
      setTimeout(() => {
        // Pick a random attendee that isn't the current user to reply
        const otherAttendees = attendees.filter(a => a.id !== (user_id || guest_id))
        if (otherAttendees.length > 0) {
          const responder = otherAttendees[Math.floor(Math.random() * otherAttendees.length)]
          const responses = [
            '¡Entendido! Allí nos vemos.',
            'Perfecto, ¡ya me estoy preparando!',
            'Genial, yo llevaré algo de picar por si acaso.',
            'De acuerdo. Si alguien llega tarde que avise por aquí.',
            '¡Suena muy bien! Nos vemos luego.'
          ]
          const botReply: MeetupMessage = {
            id: `mock-msg-bot-${Date.now()}`,
            meetup_id: meetupId,
            user_id: responder.is_guest ? null : responder.id,
            guest_id: responder.is_guest ? responder.id : null,
            sender_name: responder.username,
            avatar_url: responder.avatar_url,
            content: responses[Math.floor(Math.random() * responses.length)],
            created_at: new Date().toISOString()
          }

          setMessages((prev) => {
            const updated = [...prev, botReply]
            localStorage.setItem(storageKey, JSON.stringify(updated))
            return updated
          })
        }
      }, 1500)
    } else {
      // Supabase db insert
      const { error: insertError } = await supabase
        .from('meetup_messages')
        .insert({
          meetup_id: meetupId,
          user_id,
          guest_id,
          sender_name,
          avatar_url,
          content: trimmed
        })

      if (insertError) {
        throw new Error(insertError.message || 'Error al enviar el mensaje.')
      }
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    isAttendee: isAttendee()
  }
}
