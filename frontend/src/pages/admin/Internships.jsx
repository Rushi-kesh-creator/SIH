import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_INTERNSHIPS_CACHE_KEY = 'admin_internships'

export default function AdminInternships() {
  const [internships, setInternships] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_INTERNSHIPS_CACHE_KEY
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
        ADMIN_INTERNSHIPS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadInternships = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (internships.length === 0) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/internships')
      const result = response.data || []

      setInternships(result)

      sessionStorage.setItem(
        ADMIN_INTERNSHIPS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error('Admin internships error:', err)

      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else if (err.response?.status === 403) {
        setError(
          'Admin access is required to view internships.'
        )
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load internships.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_INTERNSHIPS_CACHE_KEY
    )

    if (!hasCache) {
      loadInternships()
    }
  }, [])

  const filteredInternships = useMemo(() => {
    const query = search.trim().toLowerCase()

    return internships.filter((internship) => {
      const matchesSearch =
        !query ||
        [
          internship.title,
          internship.company_name,
          internship.location,
          internship.skills,
        ]
          .filter(Boolean)
          .some((value) =>
            value.toString().toLowerCase().includes(query)
          )

      const matchesStatus =
        statusFilter === 'all' ||
        internship.status?.toLowerCase() === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [internships, search, statusFilter])

  const statusCounts = useMemo(() => {
    return {
      active: internships.filter(
        (item) =>
          item.status?.toLowerCase() === 'active'
      ).length,

      published: internships.filter(
        (item) =>
          item.status?.toLowerCase() === 'published'
      ).length,

      closed: internships.filter(
        (item) =>
          item.status?.toLowerCase() === 'closed'
      ).length,
    }
  }, [internships])

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
    const value = status?.toLowerCase()

    if (value === 'active' || value === 'published') {
      return 'bg-success-subtle text-success'
    }

    if (value === 'closed') {
      return 'bg-danger-subtle text-danger'
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

  if (error && internships.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load internships
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadInternships()}
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
            <i className="bi bi-briefcase"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Internships
            </h2>

            <p className="text-muted mb-0">
              Monitor internships posted by companies.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadInternships({ force: true })}
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
      {error && internships.length > 0 && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary */}
      <div className="row g-3 mb-4">

        {/* Total */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Internships
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {internships.length}
                </h3>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-briefcase"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Active */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {statusCounts.active}
                </h3>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Published */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Published
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {statusCounts.published}
                </h3>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-megaphone"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Closed */}
        <div className="col-12 col-md-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Closed
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {statusCounts.closed}
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
                Internship Listings
              </h5>

              <p className="text-muted small mb-0">
                Search and monitor internship opportunities.
              </p>
            </div>

            <div className="text-muted small">
              Showing{' '}
              <strong className="text-body">
                {filteredInternships.length}
              </strong>{' '}
              of{' '}
              <strong className="text-body">
                {internships.length}
              </strong>
            </div>

          </div>

        </div>

        {/* Filters */}
        <div className="p-4 border-bottom">

          <div className="row g-3">

            {/* Search */}
            <div className="col-12 col-lg-6">

              <label className="form-label fw-semibold">
                Search Internships
              </label>

              <div className="input-group">

                <span className="input-group-text bg-body">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search title, company, location or skills..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
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

            {/* Status */}
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

                <option value="active">
                  Active
                </option>

                <option value="published">
                  Published
                </option>

                <option value="closed">
                  Closed
                </option>
              </select>

            </div>

            {/* Clear */}
            <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">

              <button
                type="button"
                className="btn btn-aic-outline w-100"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
                disabled={!search && statusFilter === 'all'}
              >
                <i className="bi bi-funnel me-2"></i>
                Clear Filters
              </button>

            </div>

          </div>

        </div>

        {/* Table */}
        <div>

          {filteredInternships.length === 0 ? (

            <div className="text-center py-5 px-3">

              <div className="aic-page-icon mx-auto mb-3 bg-primary-subtle text-primary">
                <i className="bi bi-briefcase"></i>
              </div>

              <h5 className="fw-bold">
                {search || statusFilter !== 'all'
                  ? 'No internships found'
                  : 'No internships available'}
              </h5>

              <p className="text-muted mb-0">
                {search || statusFilter !== 'all'
                  ? 'Try changing your search or status filter.'
                  : 'Internships posted by companies will appear here.'}
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Internship</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Duration</th>
                    <th>Stipend</th>
                    <th>Status</th>
                    <th className="pe-4">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredInternships.map((internship) => (

                    <tr key={internship.id}>

                      {/* ID */}
                      <td className="ps-4 text-muted">
                        #{internship.id}
                      </td>

                      {/* Internship */}
                      <td>

                        <div className="d-flex align-items-start gap-3">

                          <div
                            className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                            }}
                          >
                            <i className="bi bi-briefcase"></i>
                          </div>

                          <div>

                            <div className="fw-semibold">
                              {internship.title ||
                                'Untitled Internship'}
                            </div>

                            {internship.skills && (
                              <div className="text-muted small mt-1">
                                {internship.skills}
                              </div>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* Company */}
                      <td>
                        <span className="fw-medium">
                          {internship.company_name || '—'}
                        </span>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="text-muted">
                          {internship.location || '—'}
                        </span>
                      </td>

                      {/* Duration */}
                      <td>
                        {internship.duration || '—'}
                      </td>

                      {/* Stipend */}
                      <td>
                        {internship.stipend || '—'}
                      </td>

                      {/* Status */}
                      <td>

                        <span
                          className={`badge ${getStatusClass(
                            internship.status
                          )}`}
                        >
                          {internship.status || 'Unknown'}
                        </span>

                      </td>

                      {/* Created */}
                      <td className="pe-4 text-muted">
                        {formatDate(
                          internship.created_at
                        )}
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