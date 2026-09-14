import { useCallback, useEffect, useRef, useState } from 'react'
import useSound from 'use-sound'

/**
 * Procedural Web Audio synthesizer for tactile wooden clicks.
 * Acts as an instant, zero-latency fallback and offline guarantee.
 */
class TabletopAudioSynthesizer {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  playClack(pitchVariance = 0.05) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const baseFreq = 340 * (1 + (Math.random() * 2 - 1) * pitchVariance)

    // Resonant wooden body
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.05)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.05)

    // Wood snap impulse
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.35, now + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.07)
  }

  playDice() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const baseFreq = 420 * (1 + (Math.random() * 2 - 1) * 0.1)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.04)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, now)
    filter.Q.setValueAtTime(3, now)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.055)
  }
}

const synth = new TabletopAudioSynthesizer()

export function useTableSound() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const stored = localStorage.getItem('tabletop_sound_enabled')
    return stored === null ? true : stored === 'true'
  })

  // use-sound hooks with preloaded wav assets
  const [playWavClack] = useSound('/sounds/wood-clack.wav', {
    volume: 0.35,
    soundEnabled,
    interrupt: true,
  })

  const [playWavDice] = useSound('/sounds/wood-dice.wav', {
    volume: 0.4,
    soundEnabled,
    interrupt: true,
  })

  const haptic = useCallback((ms = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms)
      } catch {}
    }
  }, [])

  const playClack = useCallback(() => {
    if (!soundEnabled) return
    haptic(10)
    try {
      playWavClack()
    } catch {
      synth.playClack()
    }
  }, [soundEnabled, playWavClack, haptic])

  const playDice = useCallback(() => {
    if (!soundEnabled) return
    haptic(15)
    try {
      playWavDice()
    } catch {
      synth.playDice()
    }
  }, [soundEnabled, playWavDice, haptic])

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev
      localStorage.setItem('tabletop_sound_enabled', String(next))
      return next
    })
  }, [])

  return {
    playClack,
    playDice,
    soundEnabled,
    toggleSound,
    haptic,
  }
}

// Global click handler helper for non-react or direct click listeners
export function triggerWoodClack() {
  if (typeof window === 'undefined') return
  const enabled = localStorage.getItem('tabletop_sound_enabled') !== 'false'
  if (!enabled) return

  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(10)
    } catch {}
  }
  synth.playClack()
}
