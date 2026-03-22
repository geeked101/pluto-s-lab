import { useState, useEffect, useRef } from 'react'

// Word banks per mood — gives each vibe its own vocabulary
const WORD_BANKS = {
  chill: ['Flow', 'Breathe', 'Peace', 'Drift', 'Calm', 'Ocean', 'Dream', 'Rest'],
  dark:  ['Chaos', 'Void', 'Power', 'Shadow', 'Grind', 'Abyss', 'Rise', 'Hunt'],
  hype:  ['WIN', 'PUSH', 'GRIND', 'CODE', 'FIRE', 'FAST', 'GO', 'FOCUS', '💪', '⚡'],
}

// Each word gets a unique id, a random x position, and a random word
function createWord(mood) {
  const bank = WORD_BANKS[mood]
  const narrow = typeof window !== 'undefined' && window.innerWidth <= 768
  // On narrow screens keep words away from edges so text doesn’t clip horizontally
  const xMin = narrow ? 8 : 2
  const xSpan = narrow ? 84 : 90
  return {
    id: Date.now() + Math.random(),                    // unique key
    text: bank[Math.floor(Math.random() * bank.length)],
    x: Math.random() * xSpan + xMin,
    size: Math.random() * (narrow ? 10 : 14) + (narrow ? 10 : 12), // slightly smaller on mobile
    duration: Math.random() * 2 + 3,                    // animation: 3s – 5s
  }
}

export default function FlyingWords({ mood }) {
  const [words, setWords] = useState([])
  // We keep a ref to the interval so we can clear it on cleanup
  const intervalRef = useRef(null)

  useEffect(() => {
    // Clear any existing interval when mood changes
    clearInterval(intervalRef.current)

    // Spawn a new word every 1–2 seconds
    intervalRef.current = setInterval(() => {
      const newWord = createWord(mood)

      setWords(prev => {
        // Keep at most 20 words alive at once to avoid DOM bloat
        const trimmed = prev.length >= 20 ? prev.slice(-19) : prev
        return [...trimmed, newWord]
      })

      // Remove the word after its animation finishes (~5 s max)
      setTimeout(() => {
        setWords(prev => prev.filter(w => w.id !== newWord.id))
      }, 5500)

    }, Math.random() * 1000 + 1000) // random 1000–2000 ms

    return () => clearInterval(intervalRef.current) // cleanup on unmount / re-render
  }, [mood])

  return (
    <div className="flying-words-container" aria-hidden="true">
      {words.map(word => (
        <span
          key={word.id}
          className="flying-word"
          style={{
            left: `${word.x}%`,
            fontSize: `${word.size}px`,
            animationDuration: `${word.duration}s`,
            // Use the CSS variable injected by App for the word colour
            color: 'var(--particle)',
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  )
}
