import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/settings')
        setSettings(response.data)
      } catch (err) {
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
      }
    }

    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">
            Loading settings...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    )
  }

  const profile = settings?.profile || {}
  const security = settings?.security || {}
  const portal = settings?.portal || {}

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Settings</h2>
        <p className="text-muted mb-0">
          Manage your administrator account and view portal configuration.
        </p>
      </div>

      <div className="row g-4">

        {/* Administrator Profile */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <h5 className="fw-bold mb-1">
                Administrator Profile
              </h5>

              <p className="text-muted mb-4">
                Current administrator account information.
              </p>

              <div className="mb-3">
                <label className="form-label text-muted">
                  Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={profile.name || ''}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  value={profile.email || ''}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted">
                  Role
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={profile.role || ''}
                  readOnly
                />
              </div>

              <div>
                <label className="form-label text-muted">
                  Account ID
                </label>

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

        {/* Security */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">

              <h5 className="fw-bold mb-1">
                Security
              </h5>

              <p className="text-muted mb-4">
                Current authentication and session status.
              </p>

              <div className="d-flex justify-content-between align-items-center border-bottom py-3">
                <span>Authentication</span>

                <span className="badge bg-light text-dark border">
                  {security.authentication || 'JWT'}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-3">
                <span>Session Status</span>

                <span className="badge bg-success">
                  {security.session_status || 'Active'}
                </span>
              </div>

              <div className="alert alert-light border mt-3 mb-0">
                <small>
                  Your administrator session is protected by
                  authenticated access control.
                </small>
              </div>

            </div>
          </div>
        </div>

        {/* Portal Statistics */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              <h5 className="fw-bold mb-1">
                Portal Overview
              </h5>

              <p className="text-muted mb-4">
                Current database statistics available to the administrator.
              </p>

              <div className="row g-3">

                <div className="col-6 col-md-4 col-xl">
                  <div className="border rounded-3 p-3 text-center h-100">
                    <small className="text-muted">
                      Users
                    </small>
                    <h4 className="fw-bold mb-0 mt-2">
                      {portal.total_users ?? 0}
                    </h4>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-xl">
                  <div className="border rounded-3 p-3 text-center h-100">
                    <small className="text-muted">
                      Students
                    </small>
                    <h4 className="fw-bold mb-0 mt-2">
                      {portal.total_students ?? 0}
                    </h4>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-xl">
                  <div className="border rounded-3 p-3 text-center h-100">
                    <small className="text-muted">
                      Companies
                    </small>
                    <h4 className="fw-bold mb-0 mt-2">
                      {portal.total_companies ?? 0}
                    </h4>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-xl">
                  <div className="border rounded-3 p-3 text-center h-100">
                    <small className="text-muted">
                      Skills
                    </small>
                    <h4 className="fw-bold mb-0 mt-2">
                      {portal.total_skills ?? 0}
                    </h4>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-xl">
                  <div className="border rounded-3 p-3 text-center h-100">
                    <small className="text-muted">
                      Internships
                    </small>
                    <h4 className="fw-bold mb-0 mt-2">
                      {portal.total_internships ?? 0}
                    </h4>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-xl">
                  <div className="border rounded-3 p-3 text-center h-100">
                    <small className="text-muted">
                      Jobs
                    </small>
                    <h4 className="fw-bold mb-0 mt-2">
                      {portal.total_jobs ?? 0}
                    </h4>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-xl">
                  <div className="border rounded-3 p-3 text-center h-100">
                    <small className="text-muted">
                      Applications
                    </small>
                    <h4 className="fw-bold mb-0 mt-2">
                      {portal.total_applications ?? 0}
                    </h4>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              <h5 className="fw-bold mb-3">
                System Status
              </h5>

              <div className="d-flex align-items-center">
                <span
                  className="rounded-circle bg-success me-2"
                  style={{
                    width: '10px',
                    height: '10px',
                    display: 'inline-block'
                  }}
                />

                <span className="fw-semibold">
                  Administration services are available
                </span>
              </div>

              <p className="text-muted small mt-2 mb-0">
                Settings and statistics are loaded from the authenticated
                administration API.
              </p>

            </div>
          </div>
        </div>

      </div>

    </div>
  )
}