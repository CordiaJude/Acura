import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { byStock } from './inventory.js'

const GarageContext = createContext(null)
const SAVED_KEY = 'jba:saved'
const COMPARE_KEY = 'jba:compare'
export const COMPARE_MAX = 3

function read(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v.filter((s) => byStock.has(s)) : []
  } catch {
    return []
  }
}

export function GarageProvider({ children }) {
  // Start empty so prerendered HTML and the first client render match; read storage after mount.
  const [saved, setSaved] = useState([])
  const [compare, setCompare] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef()

  useEffect(() => {
    setSaved(read(SAVED_KEY))
    setCompare(read(COMPARE_KEY))
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)) } catch { /* storage unavailable */ }
  }, [saved, loaded])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(COMPARE_KEY, JSON.stringify(compare)) } catch { /* storage unavailable */ }
  }, [compare, loaded])

  const announce = useCallback((text) => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 3200)
  }, [])

  const toggleSaved = useCallback(
    (stock) => {
      const v = byStock.get(stock)
      const name = v ? `${v.year} ${v.make} ${v.model}` : stock
      setSaved((s) => {
        const has = s.includes(stock)
        announce(has ? `Removed ${name} from saved vehicles` : `Saved ${name} to My Profile`)
        return has ? s.filter((x) => x !== stock) : [...s, stock]
      })
    },
    [announce],
  )
  const toggleCompare = useCallback(
    (stock) => {
      setCompare((c) => {
        if (c.includes(stock)) {
          announce('Removed from compare')
          return c.filter((x) => x !== stock)
        }
        if (c.length >= COMPARE_MAX) {
          announce(`You can compare up to ${COMPARE_MAX} vehicles. Remove one first.`)
          return c
        }
        announce(`Added to compare (${c.length + 1} of ${COMPARE_MAX})`)
        return [...c, stock]
      })
    },
    [announce],
  )
  const clearCompare = useCallback(() => setCompare([]), [])

  const value = useMemo(
    () => ({ saved, compare, toggleSaved, toggleCompare, clearCompare, announce, message }),
    [saved, compare, toggleSaved, toggleCompare, clearCompare, announce, message],
  )
  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
}

export const useGarage = () => useContext(GarageContext)
