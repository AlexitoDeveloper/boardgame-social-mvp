/**
 * One-time backward-compatibility migration for LocalStorage keys
 * Migrates all legacy 'boardgame_social_*' keys to 'ludiclub_*'.
 */
export function migrateLegacyStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    const legacyPrefix = 'boardgame_social_'
    const newPrefix = 'ludiclub_'
    const keysToMigrate: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(legacyPrefix)) {
        keysToMigrate.push(key)
      }
    }

    for (const key of keysToMigrate) {
      const newKey = newPrefix + key.slice(legacyPrefix.length)
      const existingNewVal = localStorage.getItem(newKey)
      const legacyVal = localStorage.getItem(key)
      if (!existingNewVal && legacyVal !== null) {
        localStorage.setItem(newKey, legacyVal)
      }
    }
  } catch (err) {
    console.warn('Storage migration error:', err)
  }
}
