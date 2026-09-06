import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/dashboard')
        setData(response.data)
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
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3 text-muted">Loading Admin Dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
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
    },
    {
      title: 'Students',
      value: stats.total_students ?? 0,
      icon: 'bi-mortarboard',
    },
    {
      title: 'Companies',
      value: stats.total_companies ?? 0,
      icon: 'bi-building',
    },
    {
      title: 'Academicians',
      value: stats.total_academicians ?? 0,
      icon: 'bi-person-workspace',
    },
    {
      title: 'Internships',
      value: stats.total_internships ?? 0,
      icon: 'bi-briefcase',
    },
    {
      title: 'Jobs',
      value: stats.total_jobs ?? 0,
      icon: 'bi-person-badge',
    },
    {
      title: 'Applications',
      value: stats.total_applications ?? 0,
      icon: 'bi-send-check',
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
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Admin Dashboard</h2>
        <p className="text-muted mb-0">
          Overview of the Academia–Industry collaboration portal.
        </p>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div className="col-12 col-sm-6 col-xl" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-2">{card.title}</p>
                    <h3 className="fw-bold mb-0">{card.value}</h3>
                  </div>

                  <div className="bg-primary-subtle text-primary rounded-3 p-2">
                    <i className={`bi ${card.icon} fs-5`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Status */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-4">Application Status</h5>

              {Object.keys(applicationsByStatus).length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-bar-chart fs-2 d-block mb-2"></i>
                  No application data available.
                </div>
              ) : (
                Object.entries(applicationsByStatus).map(([status, count]) => (
                  <div
                    className="d-flex justify-content-between align-items-center mb-3"
                    key={status}
                  >
                    <span className="text-capitalize">
                      {formatStatus(status)}
                    </span>

                    <span
                      className={`badge rounded-pill ${getStatusClass(status)}`}
                    >
                      {count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Recent Users</h5>

              {recentUsers.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No users found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="fw-medium">{user.name || '—'}</td>
                          <td>{user.email || '—'}</td>
                          <td>
                            <span className="badge bg-light text-dark border text-capitalize">
                              {user.role || '—'}
                            </span>
                          </td>
                          <td>{formatDate(user.created_at)}</td>
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
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="fw-semibold mb-3">Recent Applications</h5>

          {recentApplications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-send fs-2 d-block mb-2"></i>
              No applications found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Company</th>
                    <th>Opportunity</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>

                <tbody>
                  {recentApplications.map((application) => (
                    <tr key={application.application_id}>
                      <td>
                        <div className="fw-medium">
                          {application.student_name || '—'}
                        </div>
                      </td>

                      <td>{application.company_name || '—'}</td>

                      <td>
                        {application.opportunity_title || '—'}
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

                      <td>{formatDate(application.created_at)}</td>
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