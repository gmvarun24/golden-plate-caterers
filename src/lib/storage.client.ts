/** localStorage that never throws (private mode, blocked storage, quota, SSR). */
export const safeStorage = {
  get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  set(key: string, value: unknown): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable — selection just won't persist */
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}
