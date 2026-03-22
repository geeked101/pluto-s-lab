import { useState, useEffect, useRef } from 'react'

const POMODORO_SECONDS = 25 * 60 // 25 minutes in seconds

// Converts total seconds → "MM:SS" string
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Timer({ accent }) {
  const [timeLeft, setTimeLeft] = useState(POMODORO_SECONDS)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  // Start or stop the interval based on `running`
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer reached zero: stop and reset
            clearInterval(intervalRef.current)
            setRunning(false)
            return POMODORO_SECONDS
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    // Cleanup: always clear on re-render or unmount
    return () => clearInterval(intervalRef.current)
  }, [running])

  function handleReset() {
    setRunning(false)
    setTimeLeft(POMODORO_SECONDS)
  }

  // Progress as a fraction 0 → 1 (for the ring SVG)
  const progress = (POMODORO_SECONDS - timeLeft) / POMODORO_SECONDS
  const RADIUS = 54
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="timer-card">
      <p className="timer-label">pomodoro</p>

      {/* SVG progress ring */}
      <div className="timer-ring-wrapper">
        <svg className="timer-ring-svg" width="140" height="140" viewBox="0 0 140 140" aria-hidden>
          {/* Background track */}
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          {/* Animated progress arc */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke={accent}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>

        {/* Time display centered inside the ring */}
        <span className="timer-display" style={{ color: accent }}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        <button
          className="timer-btn"
          style={{ borderColor: accent, color: accent }}
          onClick={() => setRunning(r => !r)}
        >
          {running ? 'Pause ⏸' : 'Start ▶'}
        </button>
        <button
          className="timer-btn reset"
          onClick={handleReset}
        >
          Reset ↺
        </button>
      </div>
    </div>
  )
}
