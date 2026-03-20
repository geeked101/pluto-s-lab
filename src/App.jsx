import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import BgSlideshow from './components/BgSlideshow'
import MoodSwitcher from './components/MoodSwitcher'
import FlyingWords from './components/FlyingWords'
import Timer from './components/Timer'
import FootballCursor from './components/FootballCursor'
import Navbar from './components/Navbar'
import Playfield2 from './components/Playfield2'
import gojoLogo from './assets/Gojo.jpg'

const MOODS = {
  chill: {
    label: 'Chill 🌊',
    bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)',
    accent: '#48cae4',
    particle: '#90e0ef',
    tagline: 'breathe. flow. create.',
  },
  dark: {
    label: 'Dark 😈',
    bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a001a 50%, #2d0030 100%)',
    accent: '#c77dff',
    particle: '#e0aaff',
    tagline: 'embrace the void.',
  },
  hype: {
    label: 'Hype 🔥',
    bg: 'linear-gradient(135deg, #1a0000 0%, #7b2d00 50%, #ff4500 100%)',
    accent: '#ff6b35',
    particle: '#ffd60a',
    tagline: 'NO DAYS OFF.',
  },
}

// ── Home page (your existing content, unchanged) ─
function Home() {
  const [mood, setMood] = useState('chill')
  const current = MOODS[mood]

  return (
    <div
      className="app"
      style={{
        backgroundColor: 'transparent',
        '--accent': current.accent,
        '--particle': current.particle,
      }}
    >
      <div
        className="app football-cursor-active"
          style={{
            backgroundColor: 'transparent',
            '--accent': current.accent,
            '--particle': current.particle,
          }}
          ></div>

      <BgSlideshow />
      <FlyingWords mood={mood} />
      <FootballCursor />

      <main className="center">
        <header className="header">
          <div className="logo-container">
            <img src={gojoLogo} alt="Gojo Logo" className="logo-img" />
          </div>
          <p className="tagline">{current.tagline}</p>
        </header>

        <MoodSwitcher mood={mood} setMood={setMood} moods={MOODS} />
        <Timer accent={current.accent} />
      </main>
    </div>
  )
}

// ── Root app — navbar + routes ───────────────────
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/playfield2" element={<Playfield2 />} />
      </Routes>
    </>
  )
}