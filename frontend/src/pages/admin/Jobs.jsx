import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/jobs')
        setJobs(response.data || [])
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.')
        } else if (err.response?.status === 403) {
          setError('Admin access is required to view jobs.')
        } else {
          setError(
            err.response?.data?.detail ||
            'Unable to load jobs.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [
          job.title,
          job.company_name,
          job.location,
          job.skills,
          job.salary,
        ]
          .filter(Boolean)
          .some((value) =>
            value.toString().toLowerCase().includes(query)
          )

      const matchesStatus =
        statusFilter === 'all' ||
        job.status?.toLowerCase() === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [jobs, search, statusFilter])

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
          <h2 className="fw-bold mb-1">Jobs</h2>
          <p className="text-muted mb-0">
            Monitor jobs posted by companies.
          </p>
        </div>

        <span className="badge bg-primary-subtle text-primary fs-6">
          {jobs.length} Job
          {jobs.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Search Jobs
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
                Loading jobs...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger mb-0">
              {error}
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">💼</div>

              <h5 className="fw-semibold">
                {search || statusFilter !== 'all'
                  ? 'No jobs found'
                  : 'No jobs available'}
              </h5>

              <p className="text-muted mb-0">
                {search || statusFilter !== 'all'
                  ? 'Try changing your search or status filter.'
                  : 'Jobs posted by companies will appear here.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Job</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id}>
                        <td className="fw-semibold">
                          #{job.id}
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {job.title || 'Untitled Job'}
                          </div>

                          {job.skills && (
                            <div className="text-muted small mt-1">
                              {job.skills}
                            </div>
                          )}
                        </td>

                        <td>
                          {job.company_name || '—'}
                        </td>

                        <td>
                          {job.location || '—'}
                        </td>

                        <td>
                          {job.salary || '—'}
                        </td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              job.status
                            )}`}
                          >
                            {job.status || 'Unknown'}
                          </span>
                        </td>

                        <td>
                          {formatDate(job.created_at)}
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