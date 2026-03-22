import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import AOS from 'aos'
import 'aos/dist/aos.css'
import gojoImg from '../assets/Gojo.jpg'

// ── Smudge Canvas ────────────────────────────────
function SmudgeCanvas() {
  const canvasRef = useRef(null)
  const points    = useRef([])
  const rafId     = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e) => {
      points.current.push({ x: e.clientX, y: e.clientY, age: 0, vx: e.movementX, vy: e.movementY })
      if (points.current.length > 32) points.current.shift()
    }
    window.addEventListener('mousemove', onMouseMove)

    const draw = () => {
      ctx.fillStyle = 'rgba(61, 29, 10, 0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (points.current.length >= 2) {
        points.current.forEach(p => p.age++)
        ctx.save()
        ctx.lineCap  = 'round'
        ctx.lineJoin = 'round'

        for (let i = 1; i < points.current.length; i++) {
          const prev = points.current[i - 1]
          const curr = points.current[i]
          const t    = i / points.current.length
          const mx   = (prev.x + curr.x) / 2
          const my   = (prev.y + curr.y) / 2

          ctx.beginPath()
          ctx.moveTo(prev.x, prev.y)
          ctx.quadraticCurveTo(prev.x, prev.y, mx, my)
          ctx.strokeStyle = `rgba(8, 4, 2, ${t * 0.92})`
          ctx.lineWidth   = t * 38 + 4
          ctx.stroke()
        }

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
      }
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

// ── Particle Explode on Hover ────────────────────
function GojoBomb() {
  const canvasRef  = useRef(null)
  const particles  = useRef([])
  const exploded   = useRef(false)
  const rafId      = useRef(null)
  const imgRef     = useRef(null)

  // Spawn particles sampled from the image pixels
  const spawnParticles = () => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const img    = imgRef.current
    if (!img || exploded.current) return
    exploded.current = true

    // Draw image to canvas so we can sample pixel colors
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

    particles.current = []

    // Sample every 8th pixel for performance
    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        const i = (y * canvas.width + x) * 4
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
        if (a < 80) continue  // skip transparent pixels

        particles.current.push({
          x, y,
          ox: x, oy: y,                         // origin
          vx: (Math.random() - 0.5) * 14,       // explode velocity
          vy: (Math.random() - 0.5) * 14,
          size: Math.random() * 3 + 1,
          color: `rgba(${r},${g},${b},${a/255})`,
          life: 1,                               // fade tracker
        })
      }
    }
  }

  const resetParticles = () => {
    exploded.current = false
    particles.current = []
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (particles.current.length > 0) {
        particles.current.forEach(p => {
          p.x    += p.vx
          p.y    += p.vy
          p.vy   += 0.18     // gravity pulls fragments down
          p.vx   *= 0.97     // air resistance
          p.life -= 0.012    // fade out

          if (p.life <= 0) return

          ctx.globalAlpha = p.life
          ctx.fillStyle   = p.color
          ctx.fillRect(p.x, p.y, p.size, p.size)
        })
        ctx.globalAlpha = 1

        // Remove dead particles
        particles.current = particles.current.filter(p => p.life > 0)
      }

      rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId.current)
  }, [])

  return (
    <div
      className="gojo-bomb-wrapper"
      onMouseEnter={spawnParticles}
      onMouseLeave={resetParticles}
    >
      {/* Hidden img used to sample pixel colors */}
      <img
        ref={imgRef}
        src={gojoImg}
        alt=""
        className="gojo-bomb-source"
        crossOrigin="anonymous"
      />
      {/* Visible Gojo image */}
      <img
        src={gojoImg}
        alt="Gojo"
        className="gojo-bomb-img"
      />
      {/* Particle canvas overlay */}
      <canvas
        ref={canvasRef}
        className="gojo-bomb-canvas"
        width={400}
        height={500}
      />
    </div>
  )
}

// ── Main Playfield2 ──────────────────────────────
export default function Playfield2() {
  const containerRef = useRef(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springConfig = { stiffness: 60, damping: 20, mass: 1 }
  const x = useSpring(rawX, springConfig)
  const y = useSpring(rawY, springConfig)
  const textX = useTransform(x, [0, window.innerWidth],  [-18, 18])
  const textY = useTransform(y, [0, window.innerHeight], [-10, 10])
  const gojoX = useTransform(x, [0, window.innerWidth],  [12, -12])
  const gojoY = useTransform(y, [0, window.innerHeight], [8,  -8])

  // Init AOS on mount
  useEffect(() => {
    AOS.init({ duration: 900, once: false, mirror: true })
  }, [])

  const handleMouseMove = (e) => {
    rawX.set(e.clientX)
    rawY.set(e.clientY)
  }

  return (
    <div ref={containerRef} className="p2-container" onMouseMove={handleMouseMove}>
      <SmudgeCanvas />

      {/* ── HERO SECTION ───────────────────── */}
      <motion.div className="gojo-wrapper" style={{ x: gojoX, y: gojoY }}
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }}
      >
        <img src={gojoImg} alt="Gojo" className="gojo-img" />
      </motion.div>

      <motion.div className="p2-hero" style={{ x: textX, y: textY }}>
        <motion.p className="p2-label"
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          the lab · the grind · the orbit
        </motion.p>

        <motion.h1 className="p2-title"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04, skewX: -3, transition: { duration: 0.2 } }}
        >
          PLUTO
        </motion.h1>

        <motion.p className="p2-sub"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          pluto's lab — experimental playground
        </motion.p>

        <motion.div className="p2-line"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 1.3 }}
        />
      </motion.div>

      {/* ── OOPS SECTION (scroll down to reveal) ── */}
      <section className="oops-section">

        {/* "oops!" large text sits BEHIND the image */}
        <div className="oops-text-bg" data-aos="flip-left">
          oops!
        </div>

        {/* Gojo image with particle explode on hover — sits IN FRONT */}
        <div className="oops-image-front" data-aos="fade-up" data-aos-delay="200">
          <GojoBomb />
        </div>

        {/* Small caption bottom left */}
        <div className="oops-caption" data-aos="fade-right" data-aos-delay="400">
          <p className="oops-caption-label">hover the image</p>
          <p className="oops-caption-text">
            "The strongest.<br />Until he wasn't."
          </p>
        </div>

      </section>
    </div>
  )
}