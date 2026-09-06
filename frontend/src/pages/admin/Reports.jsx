import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminReports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/reports')
        setReports(response.data)
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please log in again.')
        } else if (err.response?.status === 403) {
          setError('Admin access required.')
        } else {
          setError(
            err.response?.data?.detail ||
            'Failed to load reports.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">
            Loading reports...
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

  const users = reports?.users || {}
  const skills = reports?.skills || {}
  const opportunities = reports?.opportunities || {}
  const applications = reports?.applications || {}

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Reports</h2>
        <p className="text-muted mb-0">
          Overview of users, skills, opportunities and application outcomes.
        </p>
      </div>

      {/* User Report */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-1">
            User Report
          </h5>

          <p className="text-muted mb-4">
            Current portal user distribution.
          </p>

          <div className="row g-3">

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Total Users
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {users.total ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Students
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {users.students ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Companies
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {users.companies ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Academicians
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {users.academicians ?? 0}
                </h3>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Opportunities Report */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-1">
            Opportunities Report
          </h5>

          <p className="text-muted mb-4">
            Internship and job opportunities currently available in the portal.
          </p>

          <div className="row g-3">

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Total Internships
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {opportunities.total_internships ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Active Internships
                </small>
                <h3 className="fw-bold text-success mb-0 mt-1">
                  {opportunities.active_internships ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Total Jobs
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {opportunities.total_jobs ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-3">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Active Jobs
                </small>
                <h3 className="fw-bold text-success mb-0 mt-1">
                  {opportunities.active_jobs ?? 0}
                </h3>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Application Report */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-1">
            Application Report
          </h5>

          <p className="text-muted mb-4">
            Application status and placement outcome summary.
          </p>

          <div className="row g-3">

            <div className="col-md-4 col-xl">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Total
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {applications.total ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-4 col-xl">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Applied
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {applications.applied ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-4 col-xl">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Pending
                </small>
                <h3 className="fw-bold mb-0 mt-1">
                  {applications.pending ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-4 col-xl">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Accepted
                </small>
                <h3 className="fw-bold text-success mb-0 mt-1">
                  {applications.accepted ?? 0}
                </h3>
              </div>
            </div>

            <div className="col-md-4 col-xl">
              <div className="border rounded-3 p-3">
                <small className="text-muted">
                  Rejected
                </small>
                <h3 className="fw-bold text-danger mb-0 mt-1">
                  {applications.rejected ?? 0}
                </h3>
              </div>
            </div>

          </div>

          <hr className="my-4" />

          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">
              Acceptance Rate
            </span>

            <span className="fw-bold fs-5">
              {applications.acceptance_rate ?? 0}%
            </span>
          </div>

          <div className="progress mt-2" style={{ height: '10px' }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${applications.acceptance_rate ?? 0}%`
              }}
            />
          </div>

        </div>
      </div>

      {/* Skills Report */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <h5 className="fw-bold mb-1">
            Skills Report
          </h5>

          <p className="text-muted mb-4">
            Skills currently registered in the portal.
          </p>

          <div className="border rounded-3 p-4">
            <small className="text-muted">
              Total Skills
            </small>

            <h2 className="fw-bold mb-0 mt-1">
              {skills.total ?? 0}
            </h2>
          </div>

        </div>
      </div>

      {/* Report Summary */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Report Summary
          </h5>

          <div className="alert alert-light border mb-0">
            <strong>Portal Overview:</strong>{' '}
            The portal currently has{' '}
            <strong>{users.total ?? 0}</strong> registered users,
            {' '}<strong>{opportunities.active_jobs ?? 0}</strong> active jobs,
            {' '}<strong>{opportunities.active_internships ?? 0}</strong> active internships,
            and <strong>{applications.total ?? 0}</strong> applications.
            The current acceptance rate is{' '}
            <strong>{applications.acceptance_rate ?? 0}%</strong>.
          </div>

        </div>
      </div>

    </div>
  )
}