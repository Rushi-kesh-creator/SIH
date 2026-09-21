import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_DASHBOARD_CACHE_KEY = 'admin_dashboard'

export default function AdminDashboard() {
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(ADMIN_DASHBOARD_CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(ADMIN_DASHBOARD_CACHE_KEY)
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadDashboard = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!data) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/dashboard')
      const result = response.data

      setData(result)

      sessionStorage.setItem(
        ADMIN_DASHBOARD_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error('Admin dashboard error:', err)

      if (err.response?.status === 403) {
        setError('You do not have permission to access the Admin Dashboard.')
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else {
        setError('Unable to load Admin Dashboard data.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!data) {
      loadDashboard()
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

  if (error && !data) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">
            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">Unable to load dashboard</h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadDashboard()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stats = data?.statistics || {}
  const recentUsers = data?.recent_users || []
  const recentApplications = data?.recent_applications || []
  const applicationsByStatus = stats.applications_by_status || {}

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users ?? 0,
      icon: 'bi-people',
      subtitle: 'Registered users',
    },
    {
      title: 'Students',
      value: stats.total_students ?? 0,
      icon: 'bi-mortarboard',
      subtitle: 'Student accounts',
    },
    {
      title: 'Companies',
      value: stats.total_companies ?? 0,
      icon: 'bi-building',
      subtitle: 'Industry partners',
    },
    {
      title: 'Academicians',
      value: stats.total_academicians ?? 0,
      icon: 'bi-person-workspace',
      subtitle: 'Academic users',
    },
    {
      title: 'Internships',
      value: stats.total_internships ?? 0,
      icon: 'bi-briefcase',
      subtitle: 'Internship opportunities',
    },
    {
      title: 'Jobs',
      value: stats.total_jobs ?? 0,
      icon: 'bi-person-badge',
      subtitle: 'Job opportunities',
    },
    {
      title: 'Applications',
      value: stats.total_applications ?? 0,
      icon: 'bi-send-check',
      subtitle: 'Student applications',
    },
  ]

  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-success-subtle text-success'

      case 'rejected':
        return 'bg-danger-subtle text-danger'

      case 'pending':
        return 'bg-warning-subtle text-warning-emphasis'

      default:
        return 'bg-secondary-subtle text-secondary'
    }
  }

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">
          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-speedometer2"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Admin Dashboard
            </h2>

            <p className="text-muted mb-0">
              Monitor users, opportunities and applications across the portal.
            </p>
          </div>
        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadDashboard({ force: true })}
          disabled={refreshing}
        >
          <i
            className={`bi ${
              refreshing
                ? 'bi-arrow-repeat'
                : 'bi-arrow-clockwise'
            } me-2`}
          ></i>

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Refresh error */}
      {error && data && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div
            className="col-12 col-sm-6 col-lg-4 col-xl"
            key={card.title}
          >
            <div className="aic-card h-100 p-3">

              <div className="d-flex justify-content-between align-items-start gap-3">

                <div>
                  <p className="text-muted small mb-2">
                    {card.title}
                  </p>

                  <h3 className="font-display fw-bold mb-1">
                    {card.value}
                  </h3>

                  <span className="text-muted small">
                    {card.subtitle}
                  </span>
                </div>

                <div className="aic-stat-icon bg-primary-subtle text-primary">
                  <i className={`bi ${card.icon}`}></i>
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Application Status + Recent Users */}
      <div className="row g-4 mb-4">

        {/* Application Status */}
        <div className="col-12 col-xl-5">
          <div className="aic-card h-100">

            <div className="p-4 border-bottom">
              <div className="d-flex align-items-center gap-3">

                <div className="aic-stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-bar-chart"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    Application Status
                  </h5>

                  <p className="text-muted small mb-0">
                    Current application distribution
                  </p>
                </div>

              </div>
            </div>

            <div className="p-4">

              {Object.keys(applicationsByStatus).length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-bar-chart fs-1 d-block mb-3"></i>
                  No application data available.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">

                  {Object.entries(applicationsByStatus).map(
                    ([status, count]) => (
                      <div
                        className="d-flex justify-content-between align-items-center"
                        key={status}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`rounded-circle d-inline-block ${getStatusClass(
                              status
                            )}`}
                            style={{
                              width: '10px',
                              height: '10px',
                            }}
                          ></span>

                          <span className="fw-medium">
                            {formatStatus(status)}
                          </span>
                        </div>

                        <span
                          className={`badge rounded-pill ${getStatusClass(
                            status
                          )}`}
                        >
                          {count}
                        </span>
                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="col-12 col-xl-7">
          <div className="aic-card h-100">

            <div className="p-4 border-bottom">
              <div className="d-flex align-items-center gap-3">

                <div className="aic-stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-people"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    Recent Users
                  </h5>

                  <p className="text-muted small mb-0">
                    Latest registered users
                  </p>
                </div>

              </div>
            </div>

            <div className="p-0">

              {recentUsers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-people fs-1 d-block mb-3"></i>
                  No users found.
                </div>
              ) : (
                <div className="table-responsive">

                  <table className="table align-middle mb-0">

                    <thead>
                      <tr>
                        <th className="ps-4">Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th className="pe-4">Joined</th>
                      </tr>
                    </thead>

                    <tbody>

                      {recentUsers.map((user) => (
                        <tr key={user.id}>

                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-2">

                              <div
                                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                                style={{
                                  width: '34px',
                                  height: '34px',
                                }}
                              >
                                {(user.name || 'U')
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span className="fw-medium">
                                {user.name || '—'}
                              </span>

                            </div>
                          </td>

                          <td>
                            <span className="text-muted">
                              {user.email || '—'}
                            </span>
                          </td>

                          <td>
                            <span className="badge bg-light text-dark border text-capitalize">
                              {user.role || '—'}
                            </span>
                          </td>

                          <td className="pe-4 text-muted">
                            {formatDate(user.created_at)}
                          </td>

                        </tr>
                      ))}

                    </tbody>
                  </table>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="aic-card">

        <div className="p-4 border-bottom">

          <div className="d-flex align-items-center gap-3">

            <div className="aic-stat-icon bg-primary-subtle text-primary">
              <i className="bi bi-send-check"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-1">
                Recent Applications
              </h5>

              <p className="text-muted small mb-0">
                Latest applications submitted by students
              </p>
            </div>

          </div>

        </div>

        <div className="p-0">

          {recentApplications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-send fs-1 d-block mb-3"></i>
              No applications found.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table align-middle mb-0">

                <thead>
                  <tr>
                    <th className="ps-4">Student</th>
                    <th>Company</th>
                    <th>Opportunity</th>
                    <th>Status</th>
                    <th className="pe-4">Applied</th>
                  </tr>
                </thead>

                <tbody>

                  {recentApplications.map((application) => (
                    <tr key={application.application_id}>

                      <td className="ps-4">
                        <div className="fw-medium">
                          {application.student_name || '—'}
                        </div>
                      </td>

                      <td>
                        {application.company_name || '—'}
                      </td>

                      <td>
                        <span className="fw-medium">
                          {application.opportunity_title || '—'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {formatStatus(application.status)}
                        </span>
                      </td>

                      <td className="pe-4 text-muted">
                        {formatDate(application.created_at)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  )
}