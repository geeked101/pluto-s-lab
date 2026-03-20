import { NavLink } from 'react-router-dom'

// NavLink is like a regular <a> tag but it automatically
// adds an "active" class when its route is the current page.

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/"
        end                         // "end" means only match exact "/" not every route
        className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
      >
        ⚗️ Pluto's Lab
      </NavLink>

      <NavLink
        to="/playfield2"
        className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
      >
        🕹️ Playfield 2
      </NavLink>
    </nav>
  )
}