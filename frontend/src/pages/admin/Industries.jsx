import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminIndustries() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadIndustries = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/users')
        setUsers(response.data || [])
      } catch (err) {
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
      }
    }

    loadIndustries()
  }, [])

  const industries = useMemo(() => {
    const filtered = users.filter((user) =>
      ['company', 'industry'].includes(user.role?.toLowerCase())
    )

    const query = search.trim().toLowerCase()

    if (!query) {
      return filtered
    }

    return filtered.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [users, search])

  const totalIndustries = useMemo(
    () =>
      users.filter((user) =>
        ['company', 'industry'].includes(user.role?.toLowerCase())
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Industries</h2>
          <p className="text-muted mb-0">
            View registered industry and company accounts.
          </p>
        </div>

        <span className="badge bg-primary-subtle text-primary fs-6">
          {totalIndustries} Account
          {totalIndustries !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Search Industries
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by company name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
                aria-label="Loading"
              />

              <p className="text-muted mt-3 mb-0">
                Loading industries...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger mb-0">
              {error}
            </div>
          )}

          {!loading && !error && industries.length === 0 && (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">🏢</div>

              <h5 className="fw-semibold">
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
          )}

          {!loading && !error && industries.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">
                  Showing {industries.length} of {totalIndustries}{' '}
                  industry accounts
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Industry / Company</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {industries.map((user) => (
                      <tr key={user.id}>
                        <td className="fw-semibold">
                          #{user.id}
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {user.name || 'Unnamed Account'}
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

                        <td>
                          {formatDate(user.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}