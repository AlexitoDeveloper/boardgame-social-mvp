import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        meeple: {
          red: '#EF4444',
          blue: '#3B82F6',
          yellow: '#F59E0B',
          green: '#10B981',
          purple: '#8B5CF6',
          orange: '#F97316',
        },
        mat: {
          950: '#060913',
          900: '#0A0F1D',
          800: '#111827',
          700: '#1E293B',
          600: '#334155',
        },
        surface: {
          void: 'hsl(var(--surface-void))',
          ground: 'hsl(var(--surface-ground))',
          elevated: 'hsl(var(--surface-elevated))',
          plate: 'hsl(var(--surface-plate))',
        },
        felt: {
          DEFAULT: 'hsl(var(--felt-emerald))',
          depth: 'hsl(var(--felt-emerald-depth))',
        },
      },
      boxShadow: {
        'tactile-sm': '0 2px 0 0 hsl(var(--keycap-shadow)), 0 4px 6px -1px rgba(0, 0, 0, 0.15)',
        'tactile-md': '0 3px 0 0 hsl(var(--keycap-shadow)), 0 8px 12px -2px rgba(0, 0, 0, 0.2)',
        'tactile-active': '0 1px 0 0 hsl(var(--keycap-shadow)), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'recessed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.25), inset 0 1px 2px 0 rgba(0, 0, 0, 0.15)',
        'subpixel-rim': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      padding: {
        safeBottom: 'env(safe-area-inset-bottom)',
        safeTop: 'env(safe-area-inset-top)',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'ease-in-out-custom': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fast-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
        'accordion-up': 'accordion-up 0.18s cubic-bezier(0.23, 1, 0.32, 1)',
        'fast-spin': 'fast-spin 650ms linear infinite',
        'pulse-fast': 'pulse-fast 1.2s cubic-bezier(0.23, 1, 0.32, 1) infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

