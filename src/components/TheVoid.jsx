import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gojoVid from '../assets/gojovid.mp4'

// ── Config ───────────────────────────────────────
const SHAPE_COUNT = 60  // total floating shapes in the scene

// Different geometry types for variety
const GEOMETRIES = [
  new THREE.IcosahedronGeometry(1, 0),    // spiky ball
  new THREE.OctahedronGeometry(1, 0),     // diamond
  new THREE.TetrahedronGeometry(1, 0),    // pyramid
  new THREE.TorusGeometry(0.7, 0.3, 8, 6), // donut
  new THREE.BoxGeometry(1, 1, 1),         // cube
]

// Accent colors — cool neon palette for the void
const COLORS = [
  0x9b5de5, // purple
  0xf15bb5, // pink
  0x00bbf9, // cyan
  0x00f5d4, // mint
  0xfee440, // yellow
]

export default function TheVoid() {
  const mountRef   = useRef(null)  // the div Three.js renders into
  const sceneRef   = useRef(null)  // store scene so click handler can access it
  const meshesRef  = useRef([])    // all shape meshes
  const explodedRef = useRef(false) // track explode state

  useEffect(() => {
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    // ── Scene setup ────────────────────────────
    const scene    = new THREE.Scene()
    scene.fog      = new THREE.FogExp2(0x000000, 0.035) // depth fog
    sceneRef.current = scene

    // ── Camera ─────────────────────────────────
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000)
    camera.position.z = 20  // start pulled back

    // ── Renderer ───────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1)
    mount.appendChild(renderer.domElement)

    // ── Lights ─────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const point1 = new THREE.PointLight(0x9b5de5, 2, 80)
    point1.position.set(10, 10, 10)
    scene.add(point1)

    const point2 = new THREE.PointLight(0x00bbf9, 2, 80)
    point2.position.set(-10, -10, -10)
    scene.add(point2)

    // ── Create shapes ───────────────────────────
    const meshes = []

    for (let i = 0; i < SHAPE_COUNT; i++) {
      const geo  = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)]
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      const mat  = new THREE.MeshPhongMaterial({
        color,
        wireframe: Math.random() > 0.5,  // half solid, half wireframe
        emissive: color,
        emissiveIntensity: 0.15,
        shininess: 80,
      })

      const mesh = new THREE.Mesh(geo, mat)

      // Scatter shapes across a large 3D space
      mesh.position.set(
        (Math.random() - 0.5) * 60,   // x: -30 to 30
        (Math.random() - 0.5) * 60,   // y: -30 to 30
        (Math.random() - 0.5) * 80,   // z: -40 to 40 (deep tunnel)
      )

      // Random starting scale
      const s = Math.random() * 1.2 + 0.3
      mesh.scale.set(s, s, s)

      // Store original position for reset
      mesh.userData.originalPos = mesh.position.clone()
      mesh.userData.rotSpeed    = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
      }
      // Explode direction — outward from center
      mesh.userData.explodeDir  = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize()

      scene.add(mesh)
      meshes.push(mesh)
    }
    meshesRef.current = meshes

    // ── Scroll handler — move camera through z ──
    let targetZ = 20
    const onScroll = (e) => {
      // Scroll down = move forward into the scene
      targetZ -= e.deltaY * 0.04
      // Clamp so you don't fly too far
      targetZ = Math.max(-30, Math.min(20, targetZ))
    }
    mount.addEventListener('wheel', onScroll)

    // ── Click handler — explode / reset ─────────
    const onClick = () => {
      explodedRef.current = !explodedRef.current
    }
    mount.addEventListener('click', onClick)

    // ── Animation loop ──────────────────────────
    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)

      // Smoothly lerp camera toward target z
      camera.position.z += (targetZ - camera.position.z) * 0.06

      meshes.forEach(mesh => {
        // Always rotate each shape
        mesh.rotation.x += mesh.userData.rotSpeed.x
        mesh.rotation.y += mesh.userData.rotSpeed.y

        if (explodedRef.current) {
          // Fly outward
          mesh.position.addScaledVector(mesh.userData.explodeDir, 0.3)
          // Spin faster while exploding
          mesh.rotation.x += mesh.userData.rotSpeed.x * 6
          mesh.rotation.y += mesh.userData.rotSpeed.y * 6
        } else {
          // Lerp back to original position
          mesh.position.lerp(mesh.userData.originalPos, 0.04)
        }
      })

      // Slowly rotate lights for dynamic lighting
      const t = Date.now() * 0.001
      point1.position.x = Math.sin(t) * 15
      point1.position.y = Math.cos(t) * 15
      point2.position.x = Math.cos(t) * 15
      point2.position.y = Math.sin(t) * 15

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ──────────────────────────
    const onResize = () => {
      const W = mount.clientWidth
      const H = mount.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup on unmount ──────────────────────
    return () => {
      cancelAnimationFrame(frame)
      mount.removeEventListener('wheel', onScroll)
      mount.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="void-page">

      {/* ── SECTION 1 — 3D Scene ───────────────── */}
      <div className="void-container">
        <div ref={mountRef} className="void-canvas" />
        <div className="void-ui">
          <h1 className="void-title">THE VOID</h1>
          <p className="void-hint">scroll to travel · click to explode</p>
        </div>

        {/* Scroll indicator arrow */}
        <div className="void-scroll-arrow">
          <span>↓</span>
        </div>
      </div>

      {/* ── SECTION 2 — Video Background ──────── */}
      <section className="void-video-section">

        {/* Autoplay muted video as background */}
        <video
          className="void-video-bg"
          src={gojoVid}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Dark overlay so text stays readable */}
        <div className="void-video-overlay" />

        {/* Content on top of video */}
        <div className="void-video-content">
          <p className="void-video-label">entering the void</p>
          <h2 className="void-video-title">
            Beyond<br />Infinity.
          </h2>
          <p className="void-video-sub">
            the strongest. the most cursed. the most free.
          </p>
        </div>

      </section>

    </div>
  )
}