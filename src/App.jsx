import { useState } from 'react'
import BgSlideshow from './components/BgSlideshow'
import MoodSwitcher from './components/MoodSwitcher'
import FlyingWords from './components/FlyingWords'
import Timer from './components/Timer'
import FootballCursor from './components/FootballCursor'
import gojoLogo from './assets/Gojo.jpg'

// ── Mood definitions ─────────────────────────────────────────────
// Each mood has: a gradient background, an accent color, and a label.
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

export default function App() {
  // mood is one of: 'chill' | 'dark' | 'hype'
  const [mood, setMood] = useState('chill')
  const current = MOODS[mood]
  return (
    // The style attribute injects CSS variables so all child components
    // can reference --accent and --particle without prop-drilling.
    <div
      className="app"
      style={{
        backgroundColor: 'transparent',
        '--accent': current.accent,
        '--particle': current.particle,
      }}
    >
      {/* Scrolling background images */}
      <BgSlideshow />

      {/* Flying words live behind everything else */}
      <FlyingWords mood={mood} />
{/* Snowy football that follows the mouse */}
      <FootballCursor />
  

      <main className="center">
        {/* ── Header ─────────────────────────── */}
        <header className="header">
          <div className="logo-container">
            <img src={gojoLogo} alt="Gojo Logo" className="logo-img" />
          </div>
          <p className="tagline">{current.tagline}</p>
        </header>

        {/* ── Mood switcher buttons ───────────── */}
        <MoodSwitcher mood={mood} setMood={setMood} moods={MOODS} />

        {/* ── Pomodoro timer ─────────────────── */}
        <Timer accent={current.accent} />
      </main>
    </div>
  )
}
