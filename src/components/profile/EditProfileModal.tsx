import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Camera, Loader2, Dices } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { supabase } from '../../lib/supabaseClient'
import { USE_MOCKS } from '../../lib/config'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Form } from '../ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { UserProfile } from '../../types'

const MotionDiv = motion.div

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  profileId: string;
  currentUserId: string | undefined;
  onSave: (username: string, city: string, avatarUrl: string) => Promise<void>;
  saving: boolean;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  profileId,
  currentUserId,
  onSave,
  saving
}: EditProfileModalProps) {
  const [editUsername, setEditUsername] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (isOpen && profile) {
      setEditUsername(profile.username || '')
      setEditCity(profile.city || '')
      setEditAvatarUrl(profile.avatar_url || '')
      setError('')
      setUploading(false)
    }
  }, [isOpen, profile])

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9)
    setEditAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const options = {
        maxSizeMB: 0.1, // ~100KB maximum size
        maxWidthOrHeight: 256, // limit width/height to 256px
        useWebWorker: true,
      }
      
      const compressedFile = await imageCompression(file, options)
      const isMock = USE_MOCKS && profileId.startsWith('mock-')

      if (isMock) {
        // Mock Mode: Convert to Base64
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setEditAvatarUrl(reader.result)
          }
          setUploading(false)
        }
        reader.onerror = () => {
          setError('Error al procesar el archivo en modo de demostración.')
          setUploading(false)
        }
        reader.readAsDataURL(compressedFile)
      } else {
        // Real Mode: Upload to Supabase Storage with local Base64 fallback
        try {
          if (!currentUserId) throw new Error('Usuario no autenticado.')
          
          const fileExt = file.name.split('.').pop() || 'png'
          const filePath = `public/${currentUserId}/${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, compressedFile, {
              upsert: true,
              contentType: compressedFile.type || 'image/png'
            })

          if (uploadError) throw uploadError

          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

          if (!data?.publicUrl) throw new Error('No se pudo obtener la URL pública del avatar.')

          setEditAvatarUrl(data.publicUrl)
          setUploading(false)
        } catch (err: any) {
          console.warn('Fallo en la subida a Supabase Storage, aplicando fallback a Base64:', err)
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setEditAvatarUrl(reader.result)
            }
            setUploading(false)
          }
          reader.onerror = () => {
            setError('Error al convertir el avatar a Base64.')
            setUploading(false)
          }
          reader.readAsDataURL(compressedFile)
        }
      }
    } catch (err: any) {
      console.error('Error al procesar la imagen:', err)
      setError(err.message || 'Error al comprimir o procesar la imagen.')
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUsername.trim()) return
    try {
      await onSave(editUsername, editCity, editAvatarUrl)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios de perfil.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md !mt-0">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card border border-border/50 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 relative space-y-4 text-left"
          >
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Editar Perfil Lúdico
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-username" className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">Nombre de Usuario</Label>
                <Input
                  id="edit-username"
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Escribe tu username..."
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-city" className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">Ciudad</Label>
                <Input
                  id="edit-city"
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Escribe tu ciudad..."
                />
              </div>

              <div className="space-y-2 text-left">
                <Label className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider block">Personalizar Avatar</Label>
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/20">
                  {/* Interactive Clickable Avatar Preview */}
                  <div 
                    onClick={() => !uploading && document.getElementById('avatar-upload')?.click()}
                    className="relative w-14 h-14 rounded-full border-2 border-primary/30 shrink-0 overflow-hidden group cursor-pointer shadow-sm active:scale-95 transition-all"
                    title="Subir foto de perfil"
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage src={editAvatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                        {editUsername.slice(0, 2).toUpperCase() || 'US'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Loading state indicator */}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <Input
                      type="text"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="URL de imagen o semilla..."
                      disabled={uploading}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <Input 
                        type="file" 
                        id="avatar-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={uploading}
                        variant="secondary"
                        size="sm"
                        className="cursor-pointer"
                        icon={uploading ? Loader2 : Camera}
                        label="Subir Foto"
                      />
                      <Button
                        type="button"
                        onClick={handleRandomAvatar}
                        disabled={uploading}
                        variant="secondary"
                        size="sm"
                        className="cursor-pointer"
                        icon={Dices}
                        label="Cambiar Semilla"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground font-semibold block leading-normal mt-1 select-none">
                  Puedes subir una foto de tu dispositivo, pegar un enlace directo a tu imagen de perfil, o usar un avatar de Dicebear ingresando cualquier palabra (semilla).
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={saving || uploading}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || uploading || !editUsername.trim()}
                  className="cursor-pointer shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </Form>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  )
}
