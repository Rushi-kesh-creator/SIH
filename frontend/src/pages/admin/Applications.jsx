import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/applications')
        setApplications(response.data || [])
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.')
        } else if (err.response?.status === 403) {
          setError('Admin access is required to view applications.')
        } else {
          setError(
            err.response?.data?.detail ||
            'Unable to load applications.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Applications</h2>

          <p className="text-muted mb-0">
            Monitor applications submitted across the platform.
          </p>
        </div>

        <span className="badge bg-primary-subtle text-primary fs-6">
          {applications.length} Application
          {applications.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Search Applications
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search student, company or opportunity..."
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
                <option value="applied">Applied</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
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
                Loading applications...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger mb-0">
              {error}
            </div>
          )}

          {!loading && !error && filteredApplications.length === 0 && (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">📋</div>

              <h5 className="fw-semibold">
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
          )}

          {!loading && !error && filteredApplications.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">
                  Showing {filteredApplications.length} of{' '}
                  {applications.length} applications
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Company</th>
                      <th>Opportunity</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Applied</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.application_id}>

                        <td className="fw-semibold">
                          #{application.application_id}
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {application.student?.name || '—'}
                          </div>

                          {application.student?.email && (
                            <div className="text-muted small">
                              {application.student.email}
                            </div>
                          )}
                        </td>

                        <td>
                          {application.company?.name || '—'}
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

                        <td>
                          {formatDate(application.created_at)}
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