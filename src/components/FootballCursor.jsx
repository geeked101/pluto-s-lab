import { useEffect, useRef } from 'react'

/**
 * FootballCursor - A high-performance custom cursor.
 * Uses a nested structure to prevent CSS/JS transform conflicts.
 */
export default function FootballCursor() {
  const outerRef = useRef(null)
  
  // Target position (real mouse)
  const mouse = useRef({ x: 0, y: 0 })
  // Rendered position (smoothed)
  const pos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const rafId = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return

    const onMove = (e) => {
      // Robustly get coordinates for mouse or touch
      let x, y
      if (e.type.startsWith('touch')) {
        x = e.touches[0].clientX
        y = e.touches[0].clientY
      } else {
        x = e.clientX
        y = e.clientY
      }

      mouse.current.x = x
      mouse.current.y = y

      // Jump to cursor on first move to feel instant
      if (!hasMoved.current) {
        pos.current.x = x
        pos.current.y = y
        hasMoved.current = true
      }
    }

    // Capture events on the window
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchstart', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })

    // LERP settings: 0.3 for a tight but smooth follow
    const LERP = 0.35

    const animate = () => {
      // Physics calculation
      pos.current.x += (mouse.current.x - pos.current.x) * LERP
      pos.current.y += (mouse.current.y - pos.current.y) * LERP

      // Subtract half-width (22px) in JS instead of CSS margins for better accuracy
      const drawX = (pos.current.x - 22).toFixed(2)
      const drawY = (pos.current.y - 22).toFixed(2)

      // Apply transform directly to DOM for 60fps performance
      outer.style.transform = `translate3d(${drawX}px, ${drawY}px, 0)`

      // Dynamic glow based on speed/distance
      const dist = Math.hypot(mouse.current.x - pos.current.x, mouse.current.y - pos.current.y)
      const glow = Math.min(dist / 2, 20)
      outer.style.filter = `drop-shadow(0 0 ${glow + 5}px rgba(180,220,255,0.6))`

      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchstart', onMove)
      window.removeEventListener('touchmove', onMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div 
      ref={outerRef} 
      className="football-cursor" 
      aria-hidden="true"
    >
      <div className="football-ball">
        ⚽
        <span className="snow-ring" />
      </div>
    </div>
  )
}