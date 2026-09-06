import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminPlacementAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/placement-analytics')
        setData(response.data)
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please log in again.')
        } else if (err.response?.status === 403) {
          setError('Admin access required.')
        } else {
          setError(
            err.response?.data?.detail ||
            'Failed to load placement analytics.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">
            Loading placement analytics...
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

  const summary = data?.summary || {}
  const opportunityType = data?.opportunity_type || {}
  const companies = data?.company_analytics || []
  const recentActivity = data?.recent_activity || []

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Placement Analytics</h2>
        <p className="text-muted mb-0">
          Analyze student applications and placement outcomes using real portal data.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Total Students</p>
              <h3 className="fw-bold mb-0">
                {summary.total_students ?? 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Total Applications</p>
              <h3 className="fw-bold mb-0">
                {summary.total_applications ?? 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Accepted</p>
              <h3 className="fw-bold mb-0 text-success">
                {summary.accepted ?? 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Acceptance Rate</p>
              <h3 className="fw-bold mb-0">
                {summary.acceptance_rate ?? 0}%
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Application Status */}
      <div className="row g-4 mb-4">

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h5 className="fw-bold mb-4">
                Application Status
              </h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Applied</span>
                  <strong>{summary.applied ?? 0}</strong>
                </div>

                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${summary.total_applications
                        ? (summary.applied / summary.total_applications) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Pending</span>
                  <strong>{summary.pending ?? 0}</strong>
                </div>

                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${summary.total_applications
                        ? (summary.pending / summary.total_applications) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Accepted</span>
                  <strong>{summary.accepted ?? 0}</strong>
                </div>

                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${summary.total_applications
                        ? (summary.accepted / summary.total_applications) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Rejected</span>
                  <strong>{summary.rejected ?? 0}</strong>
                </div>

                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${summary.total_applications
                        ? (summary.rejected / summary.total_applications) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Opportunity Type */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h5 className="fw-bold mb-4">
                Applications by Opportunity Type
              </h5>

              <div className="row text-center">

                <div className="col-6">
                  <div className="border rounded-3 p-4">
                    <h2 className="fw-bold mb-1">
                      {opportunityType.jobs ?? 0}
                    </h2>
                    <p className="text-muted mb-0">
                      Job Applications
                    </p>
                  </div>
                </div>

                <div className="col-6">
                  <div className="border rounded-3 p-4">
                    <h2 className="fw-bold mb-1">
                      {opportunityType.internships ?? 0}
                    </h2>
                    <p className="text-muted mb-0">
                      Internship Applications
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Company Analytics */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">
                Company-wise Placement Activity
              </h5>
              <p className="text-muted mb-0">
                Applications and outcomes by company.
              </p>
            </div>
          </div>

          {companies.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No company application data available.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">

                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Applications</th>
                    <th>Accepted</th>
                    <th>Pending</th>
                    <th>Rejected</th>
                  </tr>
                </thead>

                <tbody>
                  {companies.map((company) => (
                    <tr key={company.company}>
                      <td className="fw-semibold">
                        {company.company}
                      </td>
                      <td>{company.applications}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success">
                          {company.accepted}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-warning-subtle text-warning-emphasis">
                          {company.pending}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger">
                          {company.rejected}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {/* Recent Activity */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Recent Placement Activity
          </h5>

          {recentActivity.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No recent application activity.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table align-middle mb-0">

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Opportunity</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentActivity.map((item) => (
                    <tr key={item.application_id}>

                      <td className="fw-semibold">
                        {item.student}
                      </td>

                      <td>
                        {item.opportunity}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {item.type}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            item.status === 'accepted'
                              ? 'bg-success'
                              : item.status === 'rejected'
                              ? 'bg-danger'
                              : item.status === 'pending'
                              ? 'bg-warning text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : '-'}
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