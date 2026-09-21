import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_REPORTS_CACHE_KEY = 'admin_reports'

export default function AdminReports() {
  const [reports, setReports] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_REPORTS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ADMIN_REPORTS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadReports = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!reports) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/reports')

      const result = response.data

      setReports(result)

      sessionStorage.setItem(
        ADMIN_REPORTS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error('Admin reports error:', err)

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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_REPORTS_CACHE_KEY
    )

    if (!hasCache) {
      loadReports()
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

  if (error && !reports) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load reports
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadReports()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>

          </div>
        </div>
      </div>
    )
  }

  if (!reports) {
    return null
  }

  const users = reports.users || {}
  const skills = reports.skills || {}
  const opportunities =
    reports.opportunities || {}
  const applications =
    reports.applications || {}

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-file-earmark-bar-graph"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Reports
            </h2>

            <p className="text-muted mb-0">
              Overview of users, skills, opportunities and application outcomes.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() =>
            loadReports({ force: true })
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
      {error && reports && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Users
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {users.total ?? 0}
                </h3>

                <small className="text-muted">
                  Registered portal users
                </small>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-people"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active Jobs
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {opportunities.active_jobs ?? 0}
                </h3>

                <small className="text-muted">
                  Currently available jobs
                </small>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-briefcase"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active Internships
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {opportunities.active_internships ?? 0}
                </h3>

                <small className="text-muted">
                  Current internship opportunities
                </small>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-mortarboard"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Applications
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {applications.total ?? 0}
                </h3>

                <small className="text-muted">
                  Applications submitted
                </small>
              </div>

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-file-earmark-text"></i>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* User Report */}
      <div className="aic-card mb-4">

        <div className="p-4 border-bottom">

          <h5 className="fw-bold mb-1">
            User Report
          </h5>

          <p className="text-muted small mb-0">
            Current portal user distribution.
          </p>

        </div>

        <div className="p-4">

          <div className="row g-3">

            {[
              {
                label: 'Total Users',
                value: users.total,
                icon: 'bi-people',
                bg: 'bg-primary-subtle',
                text: 'text-primary',
              },
              {
                label: 'Students',
                value: users.students,
                icon: 'bi-person',
                bg: 'bg-success-subtle',
                text: 'text-success',
              },
              {
                label: 'Companies',
                value: users.companies,
                icon: 'bi-building',
                bg: 'bg-info-subtle',
                text: 'text-info',
              },
              {
                label: 'Academicians',
                value: users.academicians,
                icon: 'bi-mortarboard',
                bg: 'bg-warning-subtle',
                text: 'text-warning-emphasis',
              },
            ].map((item) => (

              <div
                className="col-12 col-sm-6 col-xl-3"
                key={item.label}
              >

                <div className="p-3 rounded-3 border h-100">

                  <div className="d-flex align-items-center gap-3">

                    <div
                      className={`${item.bg} ${item.text} rounded-circle d-flex align-items-center justify-content-center`}
                      style={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
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

      {/* Opportunities Report */}
      <div className="aic-card mb-4">

        <div className="p-4 border-bottom">

          <h5 className="fw-bold mb-1">
            Opportunities Report
          </h5>

          <p className="text-muted small mb-0">
            Internship and job opportunities currently available in the portal.
          </p>

        </div>

        <div className="p-4">

          <div className="row g-3">

            {[
              {
                label: 'Total Internships',
                value: opportunities.total_internships,
                icon: 'bi-mortarboard',
              },
              {
                label: 'Active Internships',
                value: opportunities.active_internships,
                icon: 'bi-check-circle',
                success: true,
              },
              {
                label: 'Total Jobs',
                value: opportunities.total_jobs,
                icon: 'bi-briefcase',
              },
              {
                label: 'Active Jobs',
                value: opportunities.active_jobs,
                icon: 'bi-check-circle',
                success: true,
              },
            ].map((item) => (

              <div
                className="col-12 col-sm-6 col-xl-3"
                key={item.label}
              >

                <div className="p-3 rounded-3 border h-100">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <small className="text-muted">
                        {item.label}
                      </small>

                      <h3
                        className={`font-display fw-bold mb-0 mt-1 ${
                          item.success
                            ? 'text-success'
                            : ''
                        }`}
                      >
                        {item.value ?? 0}
                      </h3>
                    </div>

                    <i
                      className={`bi ${item.icon} fs-4 ${
                        item.success
                          ? 'text-success'
                          : 'text-muted'
                      }`}
                    ></i>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Application Report */}
      <div className="aic-card mb-4">

        <div className="p-4 border-bottom">

          <h5 className="fw-bold mb-1">
            Application Report
          </h5>

          <p className="text-muted small mb-0">
            Application status and placement outcome summary.
          </p>

        </div>

        <div className="p-4">

          <div className="row g-3">

            {[
              {
                label: 'Total',
                value: applications.total,
              },
              {
                label: 'Applied',
                value: applications.applied,
              },
              {
                label: 'Pending',
                value: applications.pending,
              },
              {
                label: 'Accepted',
                value: applications.accepted,
                className: 'text-success',
              },
              {
                label: 'Rejected',
                value: applications.rejected,
                className: 'text-danger',
              },
            ].map((item) => (

              <div
                className="col-12 col-sm-6 col-lg-4 col-xl"
                key={item.label}
              >

                <div className="p-3 rounded-3 border h-100">

                  <small className="text-muted">
                    {item.label}
                  </small>

                  <h3
                    className={`font-display fw-bold mb-0 mt-1 ${
                      item.className || ''
                    }`}
                  >
                    {item.value ?? 0}
                  </h3>

                </div>

              </div>

            ))}

          </div>

          {/* Acceptance Rate */}
          <div className="mt-4 pt-4 border-top">

            <div className="d-flex justify-content-between align-items-center mb-2">

              <div>
                <span className="fw-semibold">
                  Acceptance Rate
                </span>

                <p className="text-muted small mb-0">
                  Percentage of applications accepted.
                </p>
              </div>

              <span className="font-display fw-bold fs-5">
                {applications.acceptance_rate ?? 0}%
              </span>

            </div>

            <div
              className="progress"
              style={{ height: '10px' }}
            >
              <div
                className="progress-bar bg-success"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      applications.acceptance_rate ?? 0
                    )
                  )}%`,
                }}
              />
            </div>

          </div>

        </div>

      </div>

      {/* Skills Report */}
      <div className="aic-card mb-4">

        <div className="p-4 border-bottom">

          <h5 className="fw-bold mb-1">
            Skills Report
          </h5>

          <p className="text-muted small mb-0">
            Skills currently registered in the portal.
          </p>

        </div>

        <div className="p-4">

          <div className="d-flex align-items-center justify-content-between p-4 rounded-3 bg-primary-subtle">

            <div>

              <small className="text-primary fw-semibold">
                TOTAL SKILLS
              </small>

              <h2 className="font-display fw-bold mb-0 mt-1">
                {skills.total ?? 0}
              </h2>

            </div>

            <i className="bi bi-lightbulb fs-1 text-primary"></i>

          </div>

        </div>

      </div>

      {/* Report Summary */}
      <div className="aic-card">

        <div className="p-4 border-bottom">

          <h5 className="fw-bold mb-1">
            Report Summary
          </h5>

          <p className="text-muted small mb-0">
            Current high-level portal snapshot.
          </p>

        </div>

        <div className="p-4">

          <div className="alert alert-light border mb-0">

            <div className="d-flex gap-3">

              <i className="bi bi-info-circle text-primary fs-5"></i>

              <div>

                <strong>Portal Overview</strong>

                <p className="mb-0 mt-1 text-muted">
                  The portal currently has{' '}
                  <strong>
                    {users.total ?? 0}
                  </strong>{' '}
                  registered users,{' '}
                  <strong>
                    {opportunities.active_jobs ?? 0}
                  </strong>{' '}
                  active jobs,{' '}
                  <strong>
                    {opportunities.active_internships ?? 0}
                  </strong>{' '}
                  active internships, and{' '}
                  <strong>
                    {applications.total ?? 0}
                  </strong>{' '}
                  applications. The current acceptance rate is{' '}
                  <strong>
                    {applications.acceptance_rate ?? 0}%
                  </strong>.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}