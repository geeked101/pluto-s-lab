// MoodSwitcher.jsx
// Renders the three mood toggle buttons.
// The active button gets a glowing ring using the current --accent CSS variable.

export default function MoodSwitcher({ mood, setMood, moods }) {
  return (
    <div className="mood-switcher">
      {Object.entries(moods).map(([key, val]) => (
        <button
          key={key}
          className={`mood-btn ${mood === key ? 'active' : ''}`}
          onClick={() => setMood(key)}
          // Inline style lets the active glow use each mood's own accent colour
          style={mood === key ? { boxShadow: `0 0 18px ${val.accent}`, borderColor: val.accent } : {}}
        >
          {val.label}
        </button>
      ))}
    </div>
  )
}
