import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_INDUSTRIES_CACHE_KEY = 'admin_industries'

export default function AdminIndustries() {
  const [users, setUsers] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_INDUSTRIES_CACHE_KEY
      )
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ADMIN_INDUSTRIES_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadIndustries = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (users.length === 0) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/users')

      const allUsers = response.data || []

      const industryUsers = allUsers.filter((user) =>
        ['company', 'industry'].includes(
          user.role?.toLowerCase()
        )
      )

      setUsers(industryUsers)

      sessionStorage.setItem(
        ADMIN_INDUSTRIES_CACHE_KEY,
        JSON.stringify(industryUsers)
      )
    } catch (err) {
      console.error('Admin industries error:', err)

      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else if (err.response?.status === 403) {
        setError('Admin access is required to view industries.')
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load industries.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_INDUSTRIES_CACHE_KEY
    )

    if (!hasCache) {
      loadIndustries()
    }
  }, [])

  const industries = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        )
    )
  }, [users, search])

  const totalIndustries = users.length

  const companyCount = useMemo(
    () =>
      users.filter(
        (user) => user.role?.toLowerCase() === 'company'
      ).length,
    [users]
  )

  const industryCount = useMemo(
    () =>
      users.filter(
        (user) => user.role?.toLowerCase() === 'industry'
      ).length,
    [users]
  )

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

  const formatRole = (role) => {
    if (role?.toLowerCase() === 'company') {
      return 'Company'
    }

    if (role?.toLowerCase() === 'industry') {
      return 'Industry'
    }

    return role || '—'
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

  if (error && users.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load industries
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadIndustries()}
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

          <div className="aic-page-icon bg-success-subtle text-success">
            <i className="bi bi-building"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Industries
            </h2>

            <p className="text-muted mb-0">
              View registered industry and company accounts.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadIndustries({ force: true })}
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
      {error && users.length > 0 && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Accounts
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {totalIndustries}
                </h3>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-building"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Companies
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {companyCount}
                </h3>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-buildings"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Industry Accounts
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {industryCount}
                </h3>
              </div>

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-briefcase"></i>
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
                Registered Industry Accounts
              </h5>

              <p className="text-muted small mb-0">
                Search and view company and industry accounts.
              </p>
            </div>

            <div className="text-muted small">
              Showing{' '}
              <strong className="text-body">
                {industries.length}
              </strong>{' '}
              of{' '}
              <strong className="text-body">
                {totalIndustries}
              </strong>
            </div>

          </div>

        </div>

        {/* Search */}
        <div className="p-4 border-bottom">

          <div className="row g-3">

            <div className="col-12 col-lg-6">

              <label className="form-label fw-semibold">
                Search Industries
              </label>

              <div className="input-group">

                <span className="input-group-text bg-body">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by company name or email..."
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

          </div>

        </div>

        {/* Table / Empty */}
        <div className="p-0">

          {industries.length === 0 ? (

            <div className="text-center py-5 px-3">

              <div className="aic-page-icon mx-auto mb-3 bg-success-subtle text-success">
                <i className="bi bi-building"></i>
              </div>

              <h5 className="fw-bold">
                {search
                  ? 'No industries found'
                  : 'No industries registered'}
              </h5>

              <p className="text-muted mb-0">
                {search
                  ? 'Try a different search term.'
                  : 'Industry accounts will appear here after registration.'}
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Industry / Company</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="pe-4">Registered Date</th>
                  </tr>
                </thead>

                <tbody>

                  {industries.map((user) => (

                    <tr key={user.id}>

                      <td className="ps-4 text-muted">
                        #{user.id}
                      </td>

                      <td>

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                            style={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                            }}
                          >
                            {(user.name || 'C')
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <div className="fw-semibold">
                              {user.name || 'Unnamed Account'}
                            </div>

                            <div className="text-muted small">
                              {formatRole(user.role)} Account
                            </div>

                          </div>

                        </div>

                      </td>

                      <td>
                        <span className="text-muted">
                          {user.email || '—'}
                        </span>
                      </td>

                      <td>
                        <span className="badge bg-success-subtle text-success">
                          {formatRole(user.role)}
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
  )
}