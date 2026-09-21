import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_SKILLS_CACHE_KEY = 'admin_skills'

export default function AdminSkills() {
  const [skills, setSkills] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_SKILLS_CACHE_KEY
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
        ADMIN_SKILLS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadSkills = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (skills.length === 0) {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/admin/skills')
      const result = response.data || []

      setSkills(result)

      sessionStorage.setItem(
        ADMIN_SKILLS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error('Admin skills error:', err)

      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else if (err.response?.status === 403) {
        setError('Admin access is required to view skills.')
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load skills.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_SKILLS_CACHE_KEY
    )

    if (!hasCache) {
      loadSkills()
    }
  }, [])

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return skills

    return skills.filter((skill) =>
      [skill.name, skill.category]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        )
    )
  }, [skills, search])

  const categories = useMemo(() => {
    return new Set(
      skills
        .map((skill) => skill.category)
        .filter(Boolean)
    ).size
  }, [skills])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loading />
        </div>
      </div>
    )
  }

  if (error && skills.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load skills
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadSkills()}
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
            <i className="bi bi-lightbulb"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Skills
            </h2>

            <p className="text-muted mb-0">
              View skills available across the platform.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadSkills({ force: true })}
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
      {error && skills.length > 0 && (
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
                  Total Skills
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {skills.length}
                </h3>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-lightbulb"></i>
              </div>

            </div>

          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Categories
                </p>

                <h3 className="font-display fw-bold mb-0">
                  {categories}
                </h3>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-grid"></i>
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
                  {filteredSkills.length}
                </h3>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-search"></i>
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
                Platform Skills
              </h5>

              <p className="text-muted small mb-0">
                Search and view available skills and categories.
              </p>
            </div>

            <div className="text-muted small">
              Showing{' '}
              <strong className="text-body">
                {filteredSkills.length}
              </strong>{' '}
              of{' '}
              <strong className="text-body">
                {skills.length}
              </strong>
            </div>

          </div>

        </div>

        {/* Search */}
        <div className="p-4 border-bottom">

          <div className="row g-3">

            <div className="col-12 col-lg-6">

              <label className="form-label fw-semibold">
                Search Skills
              </label>

              <div className="input-group">

                <span className="input-group-text bg-body">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by skill or category..."
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

          {filteredSkills.length === 0 ? (

            <div className="text-center py-5 px-3">

              <div className="aic-page-icon mx-auto mb-3 bg-primary-subtle text-primary">
                <i className="bi bi-lightbulb"></i>
              </div>

              <h5 className="fw-bold">
                {search
                  ? 'No skills found'
                  : 'No skills available'}
              </h5>

              <p className="text-muted mb-0">
                {search
                  ? 'Try a different search term.'
                  : 'Skills will appear here when they are available in the database.'}
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Skill</th>
                    <th className="pe-4">Category</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredSkills.map((skill) => (

                    <tr key={skill.id}>

                      <td className="ps-4 text-muted">
                        #{skill.id}
                      </td>

                      <td>

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 38,
                              height: 38,
                              flexShrink: 0,
                            }}
                          >
                            <i className="bi bi-lightbulb"></i>
                          </div>

                          <span className="fw-semibold">
                            {skill.name || 'Unnamed Skill'}
                          </span>

                        </div>

                      </td>

                      <td className="pe-4">

                        {skill.category ? (
                          <span className="badge bg-info-subtle text-info">
                            {skill.category}
                          </span>
                        ) : (
                          <span className="text-muted">
                            —
                          </span>
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