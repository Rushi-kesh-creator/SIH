import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_PLACEMENT_ANALYTICS_CACHE_KEY =
  'admin_placement_analytics'

export default function AdminPlacementAnalytics() {
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_PLACEMENT_ANALYTICS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ADMIN_PLACEMENT_ANALYTICS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const loadAnalytics = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!data) {
        setLoading(true)
      }

      setError('')

      const response = await api.get(
        '/admin/placement-analytics'
      )

      const result = response.data

      setData(result)

      sessionStorage.setItem(
        ADMIN_PLACEMENT_ANALYTICS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error(
        'Admin placement analytics error:',
        err
      )

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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_PLACEMENT_ANALYTICS_CACHE_KEY
    )

    if (!hasCache) {
      loadAnalytics()
    }
  }, [])

  const summary = data?.summary || {}
  const opportunityType =
    data?.opportunity_type || {}

  const companies = useMemo(() => {
    const companyData =
      data?.company_analytics || []

    const query = search.trim().toLowerCase()

    if (!query) {
      return companyData
    }

    return companyData.filter((company) =>
      company.company
        ?.toString()
        .toLowerCase()
        .includes(query)
    )
  }, [data, search])

  const recentActivity =
    data?.recent_activity || []

  const totalApplications =
    summary.total_applications || 0

  const getPercentage = (value) => {
    if (!totalApplications) {
      return 0
    }

    return Math.min(
      100,
      (value / totalApplications) * 100
    )
  }

  const getStatusClass = (status) => {
    const normalized =
      status?.toLowerCase()

    if (normalized === 'accepted') {
      return 'bg-success-subtle text-success'
    }

    if (normalized === 'rejected') {
      return 'bg-danger-subtle text-danger'
    }

    if (normalized === 'pending') {
      return 'bg-warning-subtle text-warning-emphasis'
    }

    if (normalized === 'applied') {
      return 'bg-primary-subtle text-primary'
    }

    return 'bg-secondary-subtle text-secondary'
  }

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

            <h5 className="fw-bold mb-2">
              Unable to load placement analytics
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadAnalytics()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>

          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-bar-chart-line"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Placement Analytics
            </h2>

            <p className="text-muted mb-0">
              Analyze student applications and placement activity using portal data.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() =>
            loadAnalytics({ force: true })
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
      {error && data && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        {/* Students */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Students
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.total_students ?? 0}
                </h3>

                <small className="text-muted">
                  Students in the portal
                </small>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-people"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Applications */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Applications
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.total_applications ?? 0}
                </h3>

                <small className="text-muted">
                  Applications submitted
                </small>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-file-earmark-text"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Accepted */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Accepted
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.accepted ?? 0}
                </h3>

                <small className="text-muted">
                  Accepted applications
                </small>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Acceptance Rate
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.acceptance_rate ?? 0}%
                </h3>

                <small className="text-muted">
                  Based on applications
                </small>
              </div>

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-percent"></i>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Status + Opportunity Type */}
      <div className="row g-4 mb-4">

        {/* Application Status */}
        <div className="col-12 col-xl-7">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <h5 className="fw-bold mb-1">
                Application Status
              </h5>

              <p className="text-muted small mb-0">
                Distribution of applications by current status.
              </p>

            </div>

            <div className="p-4">

              {/* Applied */}
              <div className="mb-4">

                <div className="d-flex justify-content-between align-items-center mb-2">

                  <span className="fw-semibold">
                    Applied
                  </span>

                  <span className="text-muted small">
                    {summary.applied ?? 0}
                  </span>

                </div>

                <div
                  className="progress"
                  style={{ height: '8px' }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${getPercentage(
                        summary.applied || 0
                      )}%`,
                    }}
                  />
                </div>

              </div>

              {/* Pending */}
              <div className="mb-4">

                <div className="d-flex justify-content-between align-items-center mb-2">

                  <span className="fw-semibold">
                    Pending
                  </span>

                  <span className="text-muted small">
                    {summary.pending ?? 0}
                  </span>

                </div>

                <div
                  className="progress"
                  style={{ height: '8px' }}
                >
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${getPercentage(
                        summary.pending || 0
                      )}%`,
                    }}
                  />
                </div>

              </div>

              {/* Accepted */}
              <div className="mb-4">

                <div className="d-flex justify-content-between align-items-center mb-2">

                  <span className="fw-semibold">
                    Accepted
                  </span>

                  <span className="text-muted small">
                    {summary.accepted ?? 0}
                  </span>

                </div>

                <div
                  className="progress"
                  style={{ height: '8px' }}
                >
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${getPercentage(
                        summary.accepted || 0
                      )}%`,
                    }}
                  />
                </div>

              </div>

              {/* Rejected */}
              <div>

                <div className="d-flex justify-content-between align-items-center mb-2">

                  <span className="fw-semibold">
                    Rejected
                  </span>

                  <span className="text-muted small">
                    {summary.rejected ?? 0}
                  </span>

                </div>

                <div
                  className="progress"
                  style={{ height: '8px' }}
                >
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${getPercentage(
                        summary.rejected || 0
                      )}%`,
                    }}
                  />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Opportunity Type */}
        <div className="col-12 col-xl-5">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <h5 className="fw-bold mb-1">
                Applications by Opportunity Type
              </h5>

              <p className="text-muted small mb-0">
                Breakdown between jobs and internships.
              </p>

            </div>

            <div className="p-4">

              <div className="row g-3">

                {/* Jobs */}
                <div className="col-12">

                  <div className="p-4 rounded-3 bg-primary-subtle">

                    <div className="d-flex justify-content-between align-items-center">

                      <div>
                        <div className="text-primary small fw-semibold mb-1">
                          JOB APPLICATIONS
                        </div>

                        <h2 className="font-display fw-bold mb-0">
                          {opportunityType.jobs ?? 0}
                        </h2>
                      </div>

                      <i className="bi bi-briefcase fs-2 text-primary"></i>

                    </div>

                  </div>

                </div>

                {/* Internships */}
                <div className="col-12">

                  <div className="p-4 rounded-3 bg-success-subtle">

                    <div className="d-flex justify-content-between align-items-center">

                      <div>
                        <div className="text-success small fw-semibold mb-1">
                          INTERNSHIP APPLICATIONS
                        </div>

                        <h2 className="font-display fw-bold mb-0">
                          {opportunityType.internships ?? 0}
                        </h2>
                      </div>

                      <i className="bi bi-mortarboard fs-2 text-success"></i>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Company Analytics */}
      <div className="aic-card mb-4">

        <div className="p-4 border-bottom">

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Company-wise Placement Activity
              </h5>

              <p className="text-muted small mb-0">
                Applications and outcomes by company.
              </p>
            </div>

            <div className="text-muted small">
              {companies.length} compan
              {companies.length === 1
                ? 'y'
                : 'ies'}
            </div>

          </div>

        </div>

        {/* Search */}
        <div className="p-4 border-bottom">

          <div className="row">

            <div className="col-12 col-lg-5">

              <label className="form-label fw-semibold">
                Search Company
              </label>

              <div className="input-group">

                <span className="input-group-text bg-body">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search company..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setSearch('')
                    }
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>

        {companies.length === 0 ? (

          <div className="text-center text-muted py-5">

            <i className="bi bi-building fs-2 d-block mb-2"></i>

            <h6 className="fw-semibold">
              No company data available
            </h6>

            <p className="small mb-0">
              {search
                ? 'Try a different company name.'
                : 'There is no company application activity yet.'}
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead>
                <tr>

                  <th className="ps-4">
                    Company
                  </th>

                  <th>
                    Applications
                  </th>

                  <th>
                    Accepted
                  </th>

                  <th>
                    Pending
                  </th>

                  <th className="pe-4">
                    Rejected
                  </th>

                </tr>
              </thead>

              <tbody>

                {companies.map((company) => (

                  <tr key={company.company}>

                    <td className="ps-4">

                      <div className="d-flex align-items-center gap-2">

                        <div
                          className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                          }}
                        >
                          <i className="bi bi-building"></i>
                        </div>

                        <span className="fw-semibold">
                          {company.company}
                        </span>

                      </div>

                    </td>

                    <td>
                      <span className="fw-semibold">
                        {company.applications ?? 0}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-success-subtle text-success">
                        {company.accepted ?? 0}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-warning-subtle text-warning-emphasis">
                        {company.pending ?? 0}
                      </span>
                    </td>

                    <td className="pe-4">
                      <span className="badge bg-danger-subtle text-danger">
                        {company.rejected ?? 0}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Recent Activity */}
      <div className="aic-card">

        <div className="p-4 border-bottom">

          <h5 className="fw-bold mb-1">
            Recent Placement Activity
          </h5>

          <p className="text-muted small mb-0">
            Latest application activity across the portal.
          </p>

        </div>

        {recentActivity.length === 0 ? (

          <div className="text-center text-muted py-5">

            <i className="bi bi-clock-history fs-2 d-block mb-2"></i>

            <h6 className="fw-semibold">
              No recent activity
            </h6>

            <p className="small mb-0">
              Recent application activity will appear here.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead>
                <tr>

                  <th className="ps-4">
                    Student
                  </th>

                  <th>
                    Opportunity
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="pe-4">
                    Date
                  </th>

                </tr>
              </thead>

              <tbody>

                {recentActivity.map((item) => (

                  <tr key={item.application_id}>

                    <td className="ps-4">

                      <div className="d-flex align-items-center gap-2">

                        <div
                          className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                          }}
                        >
                          <i className="bi bi-person"></i>
                        </div>

                        <span className="fw-semibold">
                          {item.student}
                        </span>

                      </div>

                    </td>

                    <td>
                      {item.opportunity}
                    </td>

                    <td>
                      <span className="badge bg-body-secondary text-body border">
                        {item.type}
                      </span>
                    </td>

                    <td>

                      <span
                        className={`badge ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="pe-4">

                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
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
  )
}