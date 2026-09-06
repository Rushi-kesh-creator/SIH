import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminStudents() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/users')

        const students = (response.data || []).filter(
          (user) => user.role === 'student'
        )

        setUsers(students)
      } catch (err) {
        console.error('Admin students error:', err)

        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.')
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view students.')
        } else {
          setError('Unable to load student data.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [])

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return users

    return users.filter((student) =>
      [student.name, student.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [users, search])

  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Students</h2>
          <p className="text-muted mb-0">
            View and manage registered students on the portal.
          </p>
        </div>

        <div className="text-muted">
          <strong>{users.length}</strong> registered students
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Main Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Search */}
          <div className="row g-3 align-items-center mb-4">
            <div className="col-12 col-md-7 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="col-auto text-muted small">
              Showing {filteredStudents.length} of {users.length}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>

              <p className="text-muted mt-3 mb-0">
                Loading students...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            /* Empty */
            <div className="text-center py-5">
              <i className="bi bi-mortarboard fs-1 text-muted"></i>

              <h5 className="mt-3">
                {search ? 'No students found' : 'No students registered'}
              </h5>

              <p className="text-muted mb-0">
                {search
                  ? 'Try a different name or email.'
                  : 'Student accounts will appear here when they register.'}
              </p>
            </div>
          ) : (
            /* Table */
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="text-muted">
                        #{student.id}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 38,
                              height: 38,
                              flexShrink: 0,
                            }}
                          >
                            <i className="bi bi-person"></i>
                          </div>

                          <span className="fw-semibold">
                            {student.name || 'Unnamed Student'}
                          </span>
                        </div>
                      </td>

                      <td>{student.email || '—'}</td>

                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          Student
                        </span>
                      </td>

                      <td>{formatDate(student.created_at)}</td>
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