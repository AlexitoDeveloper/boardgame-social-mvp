import { useEffect, RefObject } from 'react'

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // If clicking inside the referenced element, do nothing
      if (ref.current && ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    const handleScroll = (event: Event) => {
      // Close dropdown if scrolling outside of the referenced element
      if (ref.current && ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    // Use capture: true to catch scroll events on any container on the page
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [ref, handler, active])
}
