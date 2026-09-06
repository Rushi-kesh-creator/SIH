import { NavLink } from 'react-router-dom'

const NAV_ITEMS = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { to: '/student/profile', label: 'My Profile', icon: 'bi-person' },
    { to: '/student/skills', label: 'Skills', icon: 'bi-lightning-charge' },
    { to: '/student/skill-assessment', label: 'Skill Assessment', icon: 'bi-clipboard-check' },
    { to: '/student/skill-gap', label: 'Skill Gap', icon: 'bi-bar-chart-steps' },
    { to: '/student/internships', label: 'Internships', icon: 'bi-briefcase' },
    { to: '/student/jobs', label: 'Jobs', icon: 'bi-suitcase-lg' },
    { to: '/student/recommended', label: 'Recommended', icon: 'bi-stars' },
    { to: '/student/applications', label: 'Applications', icon: 'bi-send-check' },
    { to: '/student/certifications', label: 'Certifications', icon: 'bi-award' },
    { to: '/student/projects', label: 'Projects', icon: 'bi-kanban' },
    { to: '/student/portfolio', label: 'Digital Portfolio', icon: 'bi-window-stack' },
    { to: '/student/career-guidance', label: 'Career Guidance', icon: 'bi-compass' },
    { to: '/student/placement-readiness', label: 'Placement Readiness', icon: 'bi-graph-up-arrow' },
    { to: '/student/notifications', label: 'Notifications', icon: 'bi-bell' },
    { to: '/student/settings', label: 'Settings', icon: 'bi-gear' },
  ],
  industry: [
    { to: '/company/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { to: '/company/profile', label: 'Company Profile', icon: 'bi-building' },
    { to: '/company/internships', label: 'Internships', icon: 'bi-briefcase' },
    { to: '/company/jobs', label: 'Jobs', icon: 'bi-suitcase-lg' },
    { to: '/company/applications', label: 'Applications', icon: 'bi-send-check' },
    { to: '/industry/settings', label: 'Settings', icon: 'bi-gear' },
  ],
  company: [
    { to: '/company/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { to: '/company/profile', label: 'Company Profile', icon: 'bi-building' },
    { to: '/company/internships', label: 'Internships', icon: 'bi-briefcase' },
    { to: '/company/jobs', label: 'Jobs', icon: 'bi-suitcase-lg' },
    { to: '/company/applications', label: 'Applications', icon: 'bi-send-check' },
  ],
  academician: [
    { to: '/academician/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { to: '/academician/profile', label: 'Profile', icon: 'bi-person' },
    { to: '/academician/faculty-opportunities', label: 'Faculty Opportunities', icon: 'bi-mortarboard' },
    { to: '/academician/research-collaboration', label: 'Research Collaboration', icon: 'bi-diagram-2' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { to: '/admin/students', label: 'Students', icon: 'bi-people' },
    { to: '/admin/academicians', label: 'Academicians', icon: 'bi-mortarboard' },
    { to: '/admin/industries', label: 'Industries', icon: 'bi-building' },
    { to: '/admin/skills', label: 'Skills', icon: 'bi-lightning-charge' },
    { to: '/admin/internships', label: 'Internships', icon: 'bi-briefcase' },
    { to: '/admin/jobs', label: 'Jobs', icon: 'bi-suitcase-lg' },
    { to: '/admin/applications', label: 'Applications', icon: 'bi-send-check' },
    { to: '/admin/skill-analytics', label: 'Skill Analytics', icon: 'bi-bar-chart' },
    { to: '/admin/industry-demand', label: 'Industry Demand', icon: 'bi-graph-up' },
    { to: '/admin/placement-analytics', label: 'Placement Analytics', icon: 'bi-clipboard-data' },
    { to: '/admin/reports', label: 'Reports', icon: 'bi-file-earmark-bar-graph' },
    { to: '/admin/settings', label: 'Settings', icon: 'bi-gear' },
  ],
}

export default function Sidebar({ role, open, onClose, onLogout }) {
  const items = NAV_ITEMS[role] || []

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(18,23,43,0.4)', zIndex: 1040 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`bg-white border-end d-flex flex-column position-fixed position-lg-sticky top-0 start-0 h-100 ${
          open ? '' : 'd-none d-lg-flex'
        }`}
        style={{
          width: 260,
          borderColor: 'var(--aic-line)',
          zIndex: 1050,
          overflowY: 'auto',
        }}
        aria-label="Portal navigation"
      >
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--aic-line)' }}>
          <span className="fw-bold font-display small text-uppercase" style={{ letterSpacing: '0.03em', color: 'var(--aic-ink-soft)' }}>
            {role} portal
          </span>
          <button className="btn-close d-lg-none" aria-label="Close menu" onClick={onClose} />
        </div>
        <nav className="flex-grow-1 py-2">
          <ul className="nav flex-column">
            {items.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-2 px-3 py-2 mx-2 rounded-2 ${
                      isActive ? 'fw-semibold' : 'text-secondary'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--aic-indigo-tint)' : 'transparent',
                    color: isActive ? 'var(--aic-indigo)' : undefined,
                  })}
                  onClick={onClose}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-2 border-top" style={{ borderColor: 'var(--aic-line)' }}>
          <button
            className="nav-link d-flex align-items-center gap-2 px-3 py-2 mx-2 rounded-2 text-secondary w-100 text-start border-0 bg-transparent"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
