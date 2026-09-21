import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_ACADEMICIANS_CACHE_KEY = 'admin_academicians'

export default function AdminAcademicians() {
  const [users, setUsers] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_ACADEMICIANS_CACHE_KEY
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
        ADMIN_ACADEMICIANS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadAcademicians = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (users.length === 0) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/users')

      const allUsers = response.data || []

      const academicianUsers = allUsers.filter(
        (user) => user.role?.toLowerCase() === 'academician'
      )

      setUsers(academicianUsers)

      sessionStorage.setItem(
        ADMIN_ACADEMICIANS_CACHE_KEY,
        JSON.stringify(academicianUsers)
      )
    } catch (err) {
      console.error('Admin academicians error:', err)

      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else if (err.response?.status === 403) {
        setError('Admin access is required to view academicians.')
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load academicians.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_ACADEMICIANS_CACHE_KEY
    )

    if (!hasCache) {
      loadAcademicians()
    }
  }, [])

  const academicians = useMemo(() => {
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
              Unable to load academicians
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadAcademicians()}
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

          <div className="aic-page-icon bg-info-subtle text-info">
            <i className="bi bi-person-workspace"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Academicians
            </h2>

            <p className="text-muted mb-0">
              View and manage registered academician accounts.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadAcademicians({ force: true })}
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

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Academicians
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {users.length}
                </h3>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-person-workspace"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Search Results
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {academicians.length}
                </h3>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-search"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Current View
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {search ? 'Filtered' : 'All'}
                </h3>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-funnel"></i>
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
                Registered Academicians
              </h5>

              <p className="text-muted small mb-0">
                Search and view academician accounts.
              </p>
            </div>

            <div className="text-muted small">
              Showing{' '}
              <strong className="text-body">
                {academicians.length}
              </strong>{' '}
              of{' '}
              <strong className="text-body">
                {users.length}
              </strong>
            </div>

          </div>

        </div>

        {/* Search */}
        <div className="p-4 border-bottom">

          <div className="row g-3">

            <div className="col-12 col-lg-6">

              <label className="form-label fw-semibold">
                Search Academicians
              </label>

              <div className="input-group">

                <span className="input-group-text bg-body">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
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

          {academicians.length === 0 ? (

            <div className="text-center py-5 px-3">

              <div className="aic-page-icon mx-auto mb-3 bg-info-subtle text-info">
                <i className="bi bi-person-workspace"></i>
              </div>

              <h5 className="fw-bold">
                {search
                  ? 'No academicians found'
                  : 'No academicians registered'}
              </h5>

              <p className="text-muted mb-0">
                {search
                  ? 'Try a different search term.'
                  : 'Academician accounts will appear here after registration.'}
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Academician</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="pe-4">Registered Date</th>
                  </tr>
                </thead>

                <tbody>

                  {academicians.map((user) => (

                    <tr key={user.id}>

                      <td className="ps-4 text-muted">
                        #{user.id}
                      </td>

                      <td>

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                            style={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                            }}
                          >
                            {(user.name || 'A')
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <div className="fw-semibold">
                              {user.name || 'Unnamed User'}
                            </div>

                            <div className="text-muted small">
                              Academic Account
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
                        <span className="badge bg-info-subtle text-info">
                          Academician
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