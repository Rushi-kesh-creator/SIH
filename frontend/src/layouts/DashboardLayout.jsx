import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardLayout() {
  const { role, user, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar
        role={role}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLogout={() => logout()}
      />
      <div className="dashboard-content flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <header
          className="d-flex d-lg-none align-items-center justify-content-between px-3 py-2 bg-white border-bottom"
          style={{ borderColor: 'var(--aic-line)' }}
        >
          <button
            className="btn btn-aic-outline btn-sm"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <i className="bi bi-list" />
          </button>
          <span className="fw-semibold small">{user?.email}</span>
        </header>
        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
