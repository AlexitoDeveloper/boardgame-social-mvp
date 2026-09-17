import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, MapPin, Laptop, PhoneCall, Calendar } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Tabs } from '../ui/tabs'
import { CalendarDatePicker } from '../CalendarDatePicker'
import { CityAutocomplete } from './CityAutocomplete'
import { useTranslation } from 'react-i18next'

const MotionDiv = motion.div

interface WizardStepLogisticsProps {
  isOnline: boolean
  setIsOnline: (online: boolean) => void
  city: string
  setCity: (city: string) => void
  location: string
  setLocation: (location: string) => void
  platform: string
  setPlatform: (platform: string) => void
  voiceLink: string
  setVoiceLink: (voiceLink: string) => void
  date: string
  setDate: (date: string) => void
  allCities: string[]
}

export function WizardStepLogistics({
  isOnline,
  setIsOnline,
  city,
  setCity,
  location,
  setLocation,
  platform,
  setPlatform,
  voiceLink,
  setVoiceLink,
  date,
  setDate,
  allCities
}: WizardStepLogisticsProps) {
  const { t } = useTranslation()

  return (
    <MotionDiv
      key="step-logistics"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <span>{t('create.stepLogistics')}</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          {t('create.dateLabel')} &amp; {t('create.modalityLabel')}
        </p>
      </div>

      {/* Modality Selector Tabs */}
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
          {t('create.modalityLabel')}
        </Label>
        <Tabs
          options={[
            { id: 'presencial', label: t('create.presencial'), icon: MapPin },
            { id: 'online', label: t('create.online'), icon: Laptop }
          ]}
          activeTab={isOnline ? 'online' : 'presencial'}
          onChange={(val) => setIsOnline(val === 'online')}
        />
      </div>

      {/* In-Person vs Online Logistics Fields */}
      <AnimatePresence mode="wait">
        {!isOnline ? (
          <MotionDiv
            key="presencial-fields"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <CityAutocomplete
              city={city}
              setCity={setCity}
              allCities={allCities}
            />

            <div className="space-y-1.5">
              <Label htmlFor="location" className="font-bold text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('create.locationOptionalLabel')}</span>
              </Label>
              <Input
                id="location"
                placeholder={t('create.locationOptionalPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="online-fields"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="platform" className="font-bold text-xs flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('create.platformLabel')}</span>
              </Label>
              <Input
                id="platform"
                placeholder={t('create.platformPlaceholder')}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="voiceLink" className="font-bold text-xs flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('create.voiceLabel')}</span>
              </Label>
              <Input
                id="voiceLink"
                placeholder={t('create.voicePlaceholder')}
                value={voiceLink}
                onChange={(e) => setVoiceLink(e.target.value)}
              />
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Date & Time Picker */}
      <div className="space-y-2 pt-2 border-t border-border/20">
        <Label htmlFor="date" className="font-bold text-xs flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-primary" />
          <span>{t('create.dateLabel')}</span>
        </Label>
        <CalendarDatePicker value={date} onChange={setDate} />
      </div>
    </MotionDiv>
  )
}
