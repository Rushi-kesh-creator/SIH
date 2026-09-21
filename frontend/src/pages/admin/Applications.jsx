import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_APPLICATIONS_CACHE_KEY = 'admin_applications'

export default function AdminApplications() {
  const [applications, setApplications] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_APPLICATIONS_CACHE_KEY
      )
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ADMIN_APPLICATIONS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadApplications = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (applications.length === 0) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/applications')
      const result = response.data || []

      setApplications(result)

      sessionStorage.setItem(
        ADMIN_APPLICATIONS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error('Admin applications error:', err)

      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else if (err.response?.status === 403) {
        setError(
          'Admin access is required to view applications.'
        )
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load applications.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_APPLICATIONS_CACHE_KEY
    )

    if (!hasCache) {
      loadApplications()
    }
  }, [])

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase()

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        [
          application.student?.name,
          application.student?.email,
          application.company?.name,
          application.opportunity?.title,
          application.opportunity?.type,
        ]
          .filter(Boolean)
          .some((value) =>
            value.toString().toLowerCase().includes(query)
          )

      const matchesStatus =
        statusFilter === 'all' ||
        application.status?.toLowerCase() === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  const statusCounts = useMemo(() => {
    return {
      pending: applications.filter(
        (item) => item.status?.toLowerCase() === 'pending'
      ).length,

      accepted: applications.filter(
        (item) => item.status?.toLowerCase() === 'accepted'
      ).length,

      rejected: applications.filter(
        (item) => item.status?.toLowerCase() === 'rejected'
      ).length,

      applied: applications.filter(
        (item) => item.status?.toLowerCase() === 'applied'
      ).length,
    }
  }, [applications])

  const formatDate = (date) => {
    if (!date) return '—'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return '—'
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-success-subtle text-success'

      case 'rejected':
        return 'bg-danger-subtle text-danger'

      case 'pending':
        return 'bg-warning-subtle text-warning-emphasis'

      case 'applied':
        return 'bg-primary-subtle text-primary'

      default:
        return 'bg-secondary-subtle text-secondary'
    }
  }

  const formatOpportunityType = (type) => {
    if (!type) return '—'

    return type.charAt(0).toUpperCase() + type.slice(1)
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

  if (error && applications.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load applications
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadApplications()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-file-earmark-text"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Applications
            </h2>

            <p className="text-muted mb-0">
              Monitor applications submitted across the platform.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadApplications({ force: true })}
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
      {error && applications.length > 0 && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Applications
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {applications.length}
                </h3>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-file-earmark-text"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Pending
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {statusCounts.pending}
                </h3>
              </div>

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Accepted
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {statusCounts.accepted}
                </h3>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Rejected
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {statusCounts.rejected}
                </h3>
              </div>

              <div className="aic-stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-x-circle"></i>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Main Card */}
      <div className="aic-card">

        {/* Card Header */}
        <div className="p-4 border-bottom">

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Application Records
              </h5>

              <p className="text-muted small mb-0">
                Search and monitor student applications.
              </p>
            </div>

            <div className="text-muted small">
              Showing{' '}
              <strong className="text-body">
                {filteredApplications.length}
              </strong>{' '}
              of{' '}
              <strong className="text-body">
                {applications.length}
              </strong>
            </div>

          </div>

        </div>

        {/* Filters */}
        <div className="p-4 border-bottom">

          <div className="row g-3">

            <div className="col-12 col-lg-6">

              <label className="form-label fw-semibold">
                Search Applications
              </label>

              <div className="input-group">

                <span className="input-group-text bg-body">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student, company or opportunity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSearch('')}
                    title="Clear search"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

              </div>

            </div>

            <div className="col-12 col-md-6 col-lg-3">

              <label className="form-label fw-semibold">
                Status
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="applied">
                  Applied
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

            </div>

            <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">

              <button
                type="button"
                className="btn btn-aic-outline w-100"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
                disabled={
                  !search &&
                  statusFilter === 'all'
                }
              >
                <i className="bi bi-funnel me-2"></i>
                Clear Filters
              </button>

            </div>

          </div>

        </div>

        {/* Table */}
        <div>

          {filteredApplications.length === 0 ? (

            <div className="text-center py-5 px-3">

              <div className="aic-page-icon mx-auto mb-3 bg-primary-subtle text-primary">
                <i className="bi bi-file-earmark-text"></i>
              </div>

              <h5 className="fw-bold">
                {search || statusFilter !== 'all'
                  ? 'No applications found'
                  : 'No applications available'}
              </h5>

              <p className="text-muted mb-0">
                {search || statusFilter !== 'all'
                  ? 'Try changing your search or status filter.'
                  : 'Student applications will appear here.'}
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Student</th>
                    <th>Company</th>
                    <th>Opportunity</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="pe-4">
                      Applied
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredApplications.map((application) => (

                    <tr key={application.application_id}>

                      <td className="ps-4 text-muted">
                        #{application.application_id}
                      </td>

                      <td>

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                            }}
                          >
                            <i className="bi bi-person"></i>
                          </div>

                          <div>

                            <div className="fw-semibold">
                              {application.student?.name || '—'}
                            </div>

                            {application.student?.email && (
                              <div className="text-muted small">
                                {application.student.email}
                              </div>
                            )}

                          </div>

                        </div>

                      </td>

                      <td>
                        <span className="fw-medium">
                          {application.company?.name || '—'}
                        </span>
                      </td>

                      <td>
                        <span className="fw-semibold">
                          {application.opportunity?.title || '—'}
                        </span>
                      </td>

                      <td>

                        <span className="badge bg-info-subtle text-info">
                          {formatOpportunityType(
                            application.opportunity?.type
                          )}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`badge ${getStatusClass(
                            application.status
                          )}`}
                        >
                          {application.status || 'Unknown'}
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