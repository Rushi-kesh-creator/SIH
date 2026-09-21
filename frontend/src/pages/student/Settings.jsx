import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentSettings() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState(() => {
    return (
      localStorage.getItem('notification_preferences') !==
      'false'
    )
  })

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('dark_mode') === 'true'
  })

  // Save notification preference
  useEffect(() => {
    localStorage.setItem(
      'notification_preferences',
      notifications.toString()
    )
  }, [notifications])

  // Apply dark mode
  useEffect(() => {
    localStorage.setItem(
      'dark_mode',
      darkMode.toString()
    )

    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    )
  }, [darkMode])

  const handleNotificationChange = (event) => {
    setNotifications(event.target.checked)
  }

  const handleDarkModeChange = (event) => {
    setDarkMode(event.target.checked)
  }

  const handleLogout = () => {
    // Remove authentication
    localStorage.removeItem('aic_token')
    localStorage.removeItem('aic_user')

    // Clear student page caches
    const studentCacheKeys = [
      'student_profile',
      'student_skills',
      'student_skill_gap_analysis',
      'student_internships',
      'student_jobs',
      'student_recommended_opportunities',
      'student_applications',
      'student_certifications',
      'student_projects',
      'student_portfolio',
      'student_placement_profile',
      'student_notifications',
      'student_dashboard',
    ]

    studentCacheKeys.forEach((key) => {
      sessionStorage.removeItem(key)
    })

    // Return to light mode before leaving
    document.documentElement.setAttribute(
      'data-theme',
      'light'
    )

    navigate('/login')
  }

  return (
    <div className="container-fluid py-4 settings-page">

      {/* ================= HEADER ================= */}
      <div className="d-flex align-items-center gap-3 mb-4">

        <div className="aic-page-icon">
          <i className="bi bi-gear-fill"></i>
        </div>

        <div>
          <h2 className="font-display fw-bold mb-1">
            Settings
          </h2>

          <p className="text-muted mb-0">
            Manage your student portal preferences and account settings.
          </p>
        </div>

      </div>

      <div className="row g-4">

        {/* ================= ACCOUNT ================= */}
        <div className="col-12 col-lg-6">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3 mb-1">

              <div className="aic-stat-icon">
                <i className="bi bi-person-circle"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  Account
                </h5>

                <p className="text-muted small mb-0">
                  Manage your account information.
                </p>
              </div>

            </div>

            <div className="mt-4">

              {/* Profile */}
              <div className="d-flex justify-content-between align-items-center border-bottom py-3">

                <div className="pe-3">

                  <div className="fw-semibold">
                    Profile
                  </div>

                  <div className="text-muted small">
                    Update your personal and academic information.
                  </div>

                </div>

                <button
                  type="button"
                  className="btn btn-aic-outline btn-sm flex-shrink-0"
                  onClick={() =>
                    navigate('/student/profile')
                  }
                >
                  <i className="bi bi-person me-1"></i>
                  View Profile
                </button>

              </div>

              {/* Portfolio */}
              <div className="d-flex justify-content-between align-items-center py-3">

                <div className="pe-3">

                  <div className="fw-semibold">
                    Portfolio
                  </div>

                  <div className="text-muted small">
                    View your complete career portfolio.
                  </div>

                </div>

                <button
                  type="button"
                  className="btn btn-aic-outline btn-sm flex-shrink-0"
                  onClick={() =>
                    navigate('/student/portfolio')
                  }
                >
                  <i className="bi bi-briefcase me-1"></i>
                  Open Portfolio
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ================= PREFERENCES ================= */}
        <div className="col-12 col-lg-6">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3 mb-1">

              <div className="aic-stat-icon">
                <i className="bi bi-sliders"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  Preferences
                </h5>

                <p className="text-muted small mb-0">
                  Customize your portal experience.
                </p>
              </div>

            </div>

            <div className="mt-4">

              {/* Notifications */}
              <div className="d-flex justify-content-between align-items-center border-bottom py-3">

                <div className="pe-3">

                  <div className="fw-semibold">
                    Notifications
                  </div>

                  <div className="text-muted small">
                    Receive career and application notifications.
                  </div>

                </div>

                <div className="form-check form-switch mb-0">

                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={notifications}
                    onChange={handleNotificationChange}
                    aria-label="Enable notifications"
                  />

                </div>

              </div>

              {/* Dark Mode */}
              <div className="d-flex justify-content-between align-items-center py-3">

                <div className="pe-3">

                  <div className="fw-semibold">
                    Dark Mode
                  </div>

                  <div className="text-muted small">
                    Use a darker appearance across the portal.
                  </div>

                </div>

                <div className="form-check form-switch mb-0">

                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={darkMode}
                    onChange={handleDarkModeChange}
                    aria-label="Enable dark mode"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= SECURITY ================= */}
        <div className="col-12">

          <div className="aic-card">

            <div className="d-flex align-items-center gap-3 mb-1">

              <div className="aic-stat-icon">
                <i className="bi bi-shield-lock-fill"></i>
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  Security
                </h5>

                <p className="text-muted small mb-0">
                  Manage your session and account security.
                </p>
              </div>

            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 border-top mt-4 pt-4">

              <div>

                <div className="fw-semibold">
                  Sign out
                </div>

                <div className="text-muted small">
                  Sign out from this student account on this device.
                </div>

              </div>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}