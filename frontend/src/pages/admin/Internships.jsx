import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminInternships() {
  const [internships, setInternships] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInternships = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/internships')
        setInternships(response.data || [])
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.')
        } else if (err.response?.status === 403) {
          setError('Admin access is required to view internships.')
        } else {
          setError(
            err.response?.data?.detail ||
            'Unable to load internships.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadInternships()
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Internships</h2>
          <p className="text-muted mb-0">
            Monitor internships posted by companies.
          </p>
        </div>

        <span className="badge bg-primary-subtle text-primary fs-6">
          {internships.length} Internship
          {internships.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Search Internships
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search title, company, location or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label fw-semibold">
                Status
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
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
                Loading internships...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger mb-0">
              {error}
            </div>
          )}

          {!loading && !error && filteredInternships.length === 0 && (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">💼</div>

              <h5 className="fw-semibold">
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
          )}

          {!loading && !error && filteredInternships.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">
                  Showing {filteredInternships.length} of{' '}
                  {internships.length} internships
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Internship</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Duration</th>
                      <th>Stipend</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInternships.map((internship) => (
                      <tr key={internship.id}>
                        <td className="fw-semibold">
                          #{internship.id}
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {internship.title || 'Untitled Internship'}
                          </div>

                          {internship.skills && (
                            <div className="text-muted small mt-1">
                              {internship.skills}
                            </div>
                          )}
                        </td>

                        <td>
                          {internship.company_name || '—'}
                        </td>

                        <td>
                          {internship.location || '—'}
                        </td>

                        <td>
                          {internship.duration || '—'}
                        </td>

                        <td>
                          {internship.stipend || '—'}
                        </td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              internship.status
                            )}`}
                          >
                            {internship.status || 'Unknown'}
                          </span>
                        </td>

                        <td>
                          {formatDate(internship.created_at)}
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