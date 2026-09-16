import { useState, FC, ChangeEvent } from 'react'
import { Camera, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { supabase } from '../../lib/supabaseClient'

interface BoardPhotoUploaderProps {
  currentPhotoUrl?: string | null
  meetupId: string
  isEditable?: boolean
  onPhotoUploaded: (url: string | null) => Promise<void>
}

export const BoardPhotoUploader: FC<BoardPhotoUploaderProps> = ({
  currentPhotoUrl,
  meetupId,
  isEditable = true,
  onPhotoUploaded,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Compress image via Canvas before upload
      const compressedDataUrl = await compressImage(file, 1280, 0.85)

      // Try uploading to Supabase storage
      let finalUrl = compressedDataUrl
      try {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${meetupId}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('meetup-boards')
          .upload(fileName, file, { upsert: true })

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('meetup-boards')
            .getPublicUrl(fileName)
          if (publicData?.publicUrl) {
            finalUrl = publicData.publicUrl
          }
        }
      } catch (storageErr) {
        console.warn('Storage bucket meetup-boards unavailable, using compressed data URL:', storageErr)
      }

      setPhotoUrl(finalUrl)
      await onPhotoUploaded(finalUrl)
    } catch (err) {
      console.error('Error handling board photo:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    setPhotoUrl(null)
    await onPhotoUploaded(null)
  }

  return (
    <div className="bg-card border border-border/40 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-foreground tracking-tight">
              Foto del Tablero Final
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Inmortaliza el despliegue al acabar la partida
            </p>
          </div>
        </div>

        {isEditable && photoUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemovePhoto}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive rounded-xl cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Eliminar</span>
          </Button>
        )}
      </div>

      {photoUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-border/40 aspect-video group bg-slate-950">
          <img
            src={photoUrl}
            alt="Foto del tablero final"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="border border-dashed border-border/50 rounded-2xl p-6 text-center bg-muted/10 hover:bg-muted/20 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/40 mx-auto flex items-center justify-center text-muted-foreground mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-foreground">Sube o toma una foto del tablero</p>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">
            Aparecerá en el resumen compartido de WhatsApp
          </p>

          {isEditable && (
            <label className="inline-flex">
              <Input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm">
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Hacer o elegir foto</span>
                  </>
                )}
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  )
}

function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(img.src)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}
