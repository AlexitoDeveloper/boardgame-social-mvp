import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const MotionDiv = motion.div;

export const ESP_CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 
  'Palma de Mallorca', 'Las Palmas de Gran Canaria', 'Bilbao', 'Alicante', 'Córdoba', 
  'Valladolid', 'Vigo', 'Gijón', 'L\'Hospitalet de Llobregat', 'Vitoria-Gasteiz', 
  'A Coruña', 'Granada', 'Elche', 'Oviedo', 'Terrassa', 'Badalona', 'Cartagena', 
  'Sabadell', 'Jerez de la Frontera', 'Móstoles', 'Santa Cruz de Tenerife', 
  'Pamplona', 'Almería', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés', 
  'San Sebastián', 'Getafe', 'Burgos', 'Alcorcón', 'Santander', 'Castelló de la Plana', 
  'Badajoz', 'Logroño', 'Huelva', 'Salamanca', 'Marbella', 'Lleida', 'Tarragona', 
  'Dos Hermanas', 'Parla', 'Torrejón de Ardoz', 'Mataró', 'León', 'Algeciras', 
  'Santa Coloma de Gramenet', 'Cádiz', 'Alcobendas', 'Jaén', 'Ourense', 'Reus', 
  'Telde', 'Barakaldo', 'Roquetas de Mar', 'Girona', 'Santiago de Compostela', 
  'Cáceres', 'Lorca', 'San Fernando', 'Las Rozas de Madrid', 'Melilla', 
  'Sant Cugat del Vallès', 'San Sebastián de los Reyes', 'El Puerto de Santa María', 
  'Rivas-Vaciamadrid', 'Ceuta', 'Gandía', 'Manresa', 'Ciudad Real', 'Ávila', 
  'Palencia', 'Segovia', 'Teruel', 'Soria', 'Huesca', 'Cuenca', 'Guadalajara', 
  'Toledo', 'Zamora', 'Pontevedra', 'Lugo'
];

interface CityAutocompleteProps {
  city: string;
  setCity: (city: string) => void;
  required?: boolean;
  allCities?: string[];
}

export function CityAutocomplete({ city, setCity, required = true, allCities = ESP_CITIES }: CityAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = city.trim()
    ? allCities.filter(c => c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase())
    : []

  return (
    <div className="space-y-1.5 relative w-full">
      <Label htmlFor="city" className="font-bold flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 text-primary" /> Ciudad
      </Label>
      <Input 
        id="city"
        placeholder="Ej: Madrid, Barcelona..."
        value={city}
        onChange={(e) => {
          setCity(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        required={required}
        autoComplete="off"
      />
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <MotionDiv
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-card border border-border/50 rounded-xl shadow-lg divide-y divide-border/20 custom-scrollbar"
          >
            {suggestions.slice(0, 8).map((suggestion, idx) => (
              <div
                key={idx}
                className="px-4 py-2 text-sm text-foreground/90 hover:bg-primary/10 cursor-pointer font-medium transition-colors"
                onMouseDown={() => {
                  setCity(suggestion)
                  setShowSuggestions(false)
                }}
              >
                {suggestion}
              </div>
            ))}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
