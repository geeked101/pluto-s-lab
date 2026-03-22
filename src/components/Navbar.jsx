import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/"
        end
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

      <NavLink
        to="/void"
        className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
      >
        🌑 The Void
      </NavLink>
    </nav>
  )
}