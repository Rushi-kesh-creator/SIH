import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_SETTINGS_CACHE_KEY = 'admin_settings'

export default function AdminSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_SETTINGS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ADMIN_SETTINGS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadSettings = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!settings) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/settings')
      const result = response.data

      setSettings(result)

      sessionStorage.setItem(
        ADMIN_SETTINGS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error('Admin settings error:', err)

      if (err.response?.status === 401) {
        setError('Please log in again.')
      } else if (err.response?.status === 403) {
        setError('Admin access required.')
      } else {
        setError(
          err.response?.data?.detail ||
          'Failed to load settings.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_SETTINGS_CACHE_KEY
    )

    if (!hasCache) {
      loadSettings()
    }
  }, [])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loading />
        </div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load settings
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadSettings()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>

          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return null
  }

  const profile = settings.profile || {}
  const security = settings.security || {}
  const portal = settings.portal || {}

  const statistics = [
    {
      label: 'Users',
      value: portal.total_users,
      icon: 'bi-people',
      bg: 'bg-primary-subtle',
      text: 'text-primary',
    },
    {
      label: 'Students',
      value: portal.total_students,
      icon: 'bi-person',
      bg: 'bg-success-subtle',
      text: 'text-success',
    },
    {
      label: 'Companies',
      value: portal.total_companies,
      icon: 'bi-building',
      bg: 'bg-info-subtle',
      text: 'text-info',
    },
    {
      label: 'Skills',
      value: portal.total_skills,
      icon: 'bi-lightbulb',
      bg: 'bg-warning-subtle',
      text: 'text-warning-emphasis',
    },
    {
      label: 'Internships',
      value: portal.total_internships,
      icon: 'bi-mortarboard',
      bg: 'bg-primary-subtle',
      text: 'text-primary',
    },
    {
      label: 'Jobs',
      value: portal.total_jobs,
      icon: 'bi-briefcase',
      bg: 'bg-success-subtle',
      text: 'text-success',
    },
    {
      label: 'Applications',
      value: portal.total_applications,
      icon: 'bi-file-earmark-text',
      bg: 'bg-danger-subtle',
      text: 'text-danger',
    },
  ]

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-gear"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Settings
            </h2>

            <p className="text-muted mb-0">
              Manage your administrator account and view portal configuration.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() =>
            loadSettings({ force: true })
          }
          disabled={refreshing}
        >
          <i
            className={`bi ${
              refreshing
                ? 'bi-arrow-repeat'
                : 'bi-arrow-clockwise'
            } me-2`}
          ></i>

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* Refresh Error */}
      {error && settings && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="row g-4">

        {/* Administrator Profile */}
        <div className="col-lg-7">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <div className="d-flex align-items-center gap-3">

                <div className="aic-page-icon bg-primary-subtle text-primary">
                  <i className="bi bi-person-badge"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    Administrator Profile
                  </h5>

                  <p className="text-muted small mb-0">
                    Current administrator account information.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-4">

              <div className="mb-3">

                <label className="form-label text-muted small fw-semibold">
                  Name
                </label>

                <div className="input-group">

                  <span className="input-group-text bg-light">
                    <i className="bi bi-person"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    value={profile.name || ''}
                    readOnly
                  />

                </div>

              </div>

              <div className="mb-3">

                <label className="form-label text-muted small fw-semibold">
                  Email
                </label>

                <div className="input-group">

                  <span className="input-group-text bg-light">
                    <i className="bi bi-envelope"></i>
                  </span>

                  <input
                    type="email"
                    className="form-control"
                    value={profile.email || ''}
                    readOnly
                  />

                </div>

              </div>

              <div className="mb-3">

                <label className="form-label text-muted small fw-semibold">
                  Role
                </label>

                <div className="input-group">

                  <span className="input-group-text bg-light">
                    <i className="bi bi-shield-check"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    value={profile.role || ''}
                    readOnly
                  />

                </div>

              </div>

              <div>

                <label className="form-label text-muted small fw-semibold">
                  Account ID
                </label>

                <div className="input-group">

                  <span className="input-group-text bg-light">
                    <i className="bi bi-fingerprint"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    value={profile.id ?? ''}
                    readOnly
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Security */}
        <div className="col-lg-5">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <div className="d-flex align-items-center gap-3">

                <div className="aic-page-icon bg-success-subtle text-success">
                  <i className="bi bi-shield-lock"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    Security
                  </h5>

                  <p className="text-muted small mb-0">
                    Current authentication and session status.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-4">

              <div className="d-flex justify-content-between align-items-center border-bottom py-3">

                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-key text-muted"></i>
                  <span>Authentication</span>
                </div>

                <span className="badge bg-light text-dark border">
                  {security.authentication || 'JWT'}
                </span>

              </div>

              <div className="d-flex justify-content-between align-items-center py-3">

                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-activity text-success"></i>
                  <span>Session Status</span>
                </div>

                <span className="badge bg-success">
                  {security.session_status || 'Active'}
                </span>

              </div>

              <div className="alert alert-light border mt-3 mb-0">

                <div className="d-flex gap-2">

                  <i className="bi bi-info-circle text-primary"></i>

                  <small>
                    Your administrator session is protected by
                    authenticated access control.
                  </small>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Portal Statistics */}
        <div className="col-12">

          <div className="aic-card">

            <div className="p-4 border-bottom">

              <div className="d-flex align-items-center gap-3">

                <div className="aic-page-icon bg-info-subtle text-info">
                  <i className="bi bi-bar-chart"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    Portal Overview
                  </h5>

                  <p className="text-muted small mb-0">
                    Current database statistics available to the administrator.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-4">

              <div className="row g-3">

                {statistics.map((item) => (

                  <div
                    className="col-6 col-md-4 col-xl"
                    key={item.label}
                  >

                    <div className="border rounded-3 p-3 h-100">

                      <div className="d-flex flex-column gap-3">

                        <div
                          className={`${item.bg} ${item.text} rounded-circle d-flex align-items-center justify-content-center`}
                          style={{
                            width: 42,
                            height: 42,
                          }}
                        >
                          <i
                            className={`bi ${item.icon}`}
                          ></i>
                        </div>

                        <div>

                          <small className="text-muted">
                            {item.label}
                          </small>

                          <h4 className="font-display fw-bold mb-0 mt-1">
                            {item.value ?? 0}
                          </h4>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* System Status */}
        <div className="col-12">

          <div className="aic-card">

            <div className="p-4">

              <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

                <div>

                  <h5 className="fw-bold mb-1">
                    System Status
                  </h5>

                  <p className="text-muted small mb-0">
                    Current administration service availability.
                  </p>

                </div>

                <span className="badge bg-success-subtle text-success align-self-start px-3 py-2">
                  <i className="bi bi-check-circle me-1"></i>
                  Operational
                </span>

              </div>

              <hr />

              <div className="d-flex align-items-center">

                <span
                  className="rounded-circle bg-success me-2"
                  style={{
                    width: '10px',
                    height: '10px',
                    display: 'inline-block',
                  }}
                />

                <span className="fw-semibold">
                  Administration services are available
                </span>

              </div>

              <p className="text-muted small mt-2 mb-0">
                Settings and statistics are loaded from the
                authenticated administration API.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}