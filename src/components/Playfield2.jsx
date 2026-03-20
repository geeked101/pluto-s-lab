import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import gojoImg from '../assets/Gojo.jpg'

// ── Smudge Cursor (Canvas) ───────────────────────
// Draws a flowing black paint smudge that follows the mouse
function SmudgeCanvas() {
  const canvasRef = useRef(null)
  const points = useRef([])       // stores recent mouse positions
  const rafId  = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    // Match canvas to viewport
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e) => {
      // Push new point with a timestamp for fade-out
      points.current.push({
        x: e.clientX,
        y: e.clientY,
        age: 0,
        vx: e.movementX,   // velocity for smear direction
        vy: e.movementY,
      })
      // Keep only the last 32 points
      if (points.current.length > 32) points.current.shift()
    }
    window.addEventListener('mousemove', onMouseMove)

    const draw = () => {
      // Fade the canvas slightly each frame — creates the trail decay
      ctx.fillStyle = 'rgba(61, 29, 10, 0.18)'  // chocolate bg colour
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (points.current.length < 2) {
        rafId.current = requestAnimationFrame(draw)
        return
      }

      // Age all points
      points.current.forEach(p => p.age++)

      // Draw the smudge as a thick tapered stroke through all points
      ctx.save()
      ctx.lineCap    = 'round'
      ctx.lineJoin   = 'round'

      for (let i = 1; i < points.current.length; i++) {
        const prev = points.current[i - 1]
        const curr = points.current[i]

        // Taper: thick at head, thin at tail
        const t       = i / points.current.length
        const width   = t * 38 + 4          // 4px tail → 42px head
        const opacity = t * 0.92            // fade toward tail

        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)

        // Quadratic curve for smoothness
        const mx = (prev.x + curr.x) / 2
        const my = (prev.y + curr.y) / 2
        ctx.quadraticCurveTo(prev.x, prev.y, mx, my)

        ctx.strokeStyle = `rgba(8, 4, 2, ${opacity})`
        ctx.lineWidth   = width
        ctx.stroke()
      }

      // Blob at the cursor head
      const head = points.current[points.current.length - 1]
      if (head) {
        const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 28)
        grad.addColorStop(0, 'rgba(5, 2, 1, 0.95)')
        grad.addColorStop(1, 'rgba(5, 2, 1, 0)')
        ctx.beginPath()
        ctx.arc(head.x, head.y, 28, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      ctx.restore()
      rafId.current = requestAnimationFrame(draw)
    }

    rafId.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="smudge-canvas" />
}

// ── Main Playfield2 ──────────────────────────────
export default function Playfield2() {
  const containerRef = useRef(null)

  // Raw mouse position
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Spring-smoothed — PLUTO text lags behind cursor gently
  const springConfig = { stiffness: 60, damping: 20, mass: 1 }
  const x = useSpring(rawX, springConfig)
  const y = useSpring(rawY, springConfig)

  // Map mouse to subtle offset — text shifts ±18px max
  const textX = useTransform(x, [0, window.innerWidth],  [-18, 18])
  const textY = useTransform(y, [0, window.innerHeight], [-10, 10])

  // Gojo parallax — moves opposite to text for depth
  const gojoX = useTransform(x, [0, window.innerWidth],  [12, -12])
  const gojoY = useTransform(y, [0, window.innerHeight], [8,  -8])

  const handleMouseMove = (e) => {
    rawX.set(e.clientX)
    rawY.set(e.clientY)
  }

  return (
    <div
      ref={containerRef}
      className="p2-container"
      onMouseMove={handleMouseMove}
    >
      {/* Layer 1 — smudge canvas */}
      <SmudgeCanvas />

      {/* Layer 2 — floating Gojo image */}
      <motion.div
        className="gojo-wrapper"
        style={{ x: gojoX, y: gojoY }}
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }}
      >
        <img src={gojoImg} alt="Gojo" className="gojo-img" />
      </motion.div>

      {/* Layer 3 — PLUTO hero text */}
      <motion.div
        className="p2-hero"
        style={{ x: textX, y: textY }}
      >
        <motion.p
          className="p2-label"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0   }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          the lab · the grind · the orbit
        </motion.p>

        <motion.h1
          className="p2-title"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1   }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{
            scale: 1.04,
            skewX: -3,
            transition: { duration: 0.2 }
          }}
        >
          PLUTO
        </motion.h1>

        <motion.p
          className="p2-sub"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          pluto's lab — experimental playground
        </motion.p>

        {/* Decorative line */}
        <motion.div
          className="p2-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 1.3 }}
        />
      </motion.div>
    </div>
  )
}