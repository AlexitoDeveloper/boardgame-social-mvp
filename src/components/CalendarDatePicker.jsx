import { useState, useEffect } from 'react'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { es } from 'date-fns/locale'

export function CalendarDatePicker({ value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) return new Date(value);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    return tomorrow;
  });

  const [hour, setHour] = useState(() => selectedDate.getHours());
  const [minute, setMinute] = useState(() => selectedDate.getMinutes());

  const handleSelectDay = (day) => {
    if (!day) return;
    const newDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
    setSelectedDate(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (h, m) => {
    const updatedHour = Math.min(23, Math.max(0, parseInt(h) || 0));
    const updatedMinute = Math.min(59, Math.max(0, parseInt(m) || 0));
    setHour(updatedHour);
    setMinute(updatedMinute);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), updatedHour, updatedMinute);
      setSelectedDate(newDate);
      onChange(newDate.toISOString());
    }
  };

  const formatDisplayDate = (date) => {
    if (!date) return 'Seleccionar fecha y hora...';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sync selectedDate with initial state on first mount
  useEffect(() => {
    if (!value && selectedDate) {
      onChange(selectedDate.toISOString());
    }
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between bg-background/50 hover:bg-background/80 border border-border/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/40 rounded-xl px-4 h-11 text-left text-sm font-medium transition-all cursor-pointer text-foreground"
        >
          <span>{formatDisplayDate(selectedDate)}</span>
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0 z-50 bg-card border border-border/50 rounded-2xl shadow-xl backdrop-blur-2xl bg-card/95" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDay}
            className="rounded-md border-0 bg-transparent"
            captionLayout="dropdown"
            startMonth={new Date(currentYear, 0)}
            endMonth={new Date(currentYear + 10, 11)}
            locale={es}
            weekStartsOn={1}
            disabled={{ before: today }}
          />
          
          {/* Time Selector */}
          <div className="border-t border-border/20 pt-3 flex items-center justify-between gap-4 px-3">
            <span className="text-xs font-bold text-muted-foreground">Hora:</span>
            <div className="flex items-center gap-2">
              <div className="relative inline-flex items-center">
                <select
                  value={hour}
                  onChange={(e) => handleTimeChange(e.target.value, minute)}
                  className="bg-background/50 hover:bg-background/80 border border-border/50 rounded-xl pl-2.5 pr-7 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none h-8 transition-all"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i} className="bg-card text-foreground">{String(i).padStart(2, '0')}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <span className="text-muted-foreground font-bold">:</span>
              <div className="relative inline-flex items-center">
                <select
                  value={minute}
                  onChange={(e) => handleTimeChange(hour, e.target.value)}
                  className="bg-background/50 hover:bg-background/80 border border-border/50 rounded-xl pl-2.5 pr-7 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none h-8 transition-all"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const val = i * 5;
                    return <option key={val} value={val} className="bg-card text-foreground">{String(val).padStart(2, '0')}</option>;
                  })}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
