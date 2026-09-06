import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminSkills() {
  const [skills, setSkills] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/skills')
        setSkills(response.data || [])
      } catch (err) {
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
      }
    }

    loadSkills()
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Skills</h2>
          <p className="text-muted mb-0">
            View skills available in the platform.
          </p>
        </div>

        <span className="badge bg-primary-subtle text-primary fs-6">
          {skills.length} Skill{skills.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Search Skills
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by skill or category..."
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
                Loading skills...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger mb-0">
              {error}
            </div>
          )}

          {!loading && !error && filteredSkills.length === 0 && (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">🧠</div>

              <h5 className="fw-semibold">
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
          )}

          {!loading && !error && filteredSkills.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">
                  Showing {filteredSkills.length} of {skills.length} skills
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Skill</th>
                      <th>Category</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSkills.map((skill) => (
                      <tr key={skill.id}>
                        <td className="fw-semibold">
                          #{skill.id}
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {skill.name || 'Unnamed Skill'}
                          </span>
                        </td>

                        <td>
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
            </>
          )}

        </div>
      </div>
    </div>
  )
}