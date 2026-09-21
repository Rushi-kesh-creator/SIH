import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const ROLE_HOME = {
  student: '/student/dashboard',
  academician: '/academician/dashboard',
  admin: '/admin/dashboard',
}

export default function Navbar() {
  const { isAuthenticated, role } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top" style={{ borderColor: 'var(--aic-line)' }}>
      <div className="container py-2">
        <Link to="/" className="navbar-brand fw-bold font-display d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-3"
            style={{ width: 32, height: 32, background: 'var(--aic-indigo)', color: '#fff' }}
          >
            <i className="bi bi-diagram-3-fill" aria-hidden="true" />
          </span>
          Academia–Industry Portal
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="mainNav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="mainNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink to="/about" className="nav-link">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/opportunities" className="nav-link">
                Explore Opportunities
              </NavLink>
            </li>
            {isAuthenticated ? (
              <li className="nav-item">
                <Link to={ROLE_HOME[role] || '/login'} className="btn btn-aic-primary btn-sm ms-lg-2">
                  Go to dashboard
                </Link>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    Log in
                  </NavLink>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-aic-primary btn-sm ms-lg-2">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
