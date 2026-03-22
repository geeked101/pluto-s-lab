import { useState, useEffect } from 'react'

/** True when the primary input is coarse (typical touch phones/tablets). */
export function usePointerCoarse() {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return coarse
}
