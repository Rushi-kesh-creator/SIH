import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminSkillAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/admin/skill-analytics')
      setAnalytics(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in again as administrator.')
      } else if (err.response?.status === 403) {
        setError('Admin access required.')
      } else {
        setError('Unable to load skill analytics.')
      }
    } finally {
      setLoading(false)
    }
  }

  const topStudentSkills = useMemo(() => {
    if (!analytics?.skill_distribution) return []

    return analytics.skill_distribution
      .filter((skill) => skill.student_count > 0)
      .slice(0, 10)
  }, [analytics])

  const topIndustrySkills = useMemo(() => {
    if (!analytics?.industry_demand) return []

    return analytics.industry_demand
      .filter((skill) => skill.industry_demand > 0)
      .slice(0, 10)
  }, [analytics])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="text-muted mt-3 mb-0">
            Loading skill analytics...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const { summary } = analytics

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Skill Analytics</h2>
          <p className="text-muted mb-0">
            Analyze student skills and current industry skill demand.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadAnalytics}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Total Skills
              </div>
              <h3 className="fw-bold mb-0">
                {summary.total_skills}
              </h3>
              <small className="text-muted">
                Skills available in portal
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Students With Skills
              </div>
              <h3 className="fw-bold mb-0">
                {summary.students_with_skills}
              </h3>
              <small className="text-muted">
                Students having at least one skill
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Active Jobs
              </div>
              <h3 className="fw-bold mb-0">
                {summary.active_jobs}
              </h3>
              <small className="text-muted">
                Current industry opportunities
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Active Internships
              </div>
              <h3 className="fw-bold mb-0">
                {summary.active_internships}
              </h3>
              <small className="text-muted">
                Current internship opportunities
              </small>
            </div>
          </div>
        </div>

      </div>

      <div className="row g-4">

        {/* Student Skills */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="mb-4">
                <h5 className="fw-bold mb-1">
                  Top Student Skills
                </h5>
                <p className="text-muted small mb-0">
                  Skills currently associated with students.
                </p>
              </div>

              {topStudentSkills.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No student skill data available.
                </div>
              ) : (
                <div>
                  {topStudentSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="mb-3"
                    >
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">
                          {skill.name}
                        </span>
                        <span className="text-muted">
                          {skill.student_count} student
                          {skill.student_count !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div
                        className="progress"
                        style={{ height: '8px' }}
                      >
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${
                              Math.min(
                                100,
                                (skill.student_count /
                                  Math.max(
                                    1,
                                    topStudentSkills[0]
                                      .student_count
                                  )) *
                                  100
                              )
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Industry Demand */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <div className="mb-4">
                <h5 className="fw-bold mb-1">
                  Industry Skill Demand
                </h5>
                <p className="text-muted small mb-0">
                  Skills requested by active jobs and internships.
                </p>
              </div>

              {topIndustrySkills.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No industry skill demand data available.
                </div>
              ) : (
                <div>
                  {topIndustrySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="mb-3"
                    >
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">
                          {skill.name}
                        </span>
                        <span className="text-muted">
                          {skill.industry_demand}{' '}
                          {skill.industry_demand === 1 ? 'opportunity' : 'opportunities'}
                        </span>
                      </div>

                      <div
                        className="progress"
                        style={{ height: '8px' }}
                      >
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{
                            width: `${
                              Math.min(
                                100,
                                (skill.industry_demand /
                                  Math.max(
                                    1,
                                    topIndustrySkills[0]
                                      .industry_demand
                                  )) *
                                  100
                              )
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Skill Comparison */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">

          <div className="mb-4">
            <h5 className="fw-bold mb-1">
              Student Skills vs Industry Demand
            </h5>
            <p className="text-muted small mb-0">
              Compare how many students have each skill with how often
              the skill is requested by active opportunities.
            </p>
          </div>

          {analytics.industry_demand.length === 0 ? (
            <div className="text-center text-muted py-4">
              No comparison data available.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Category</th>
                    <th>Students</th>
                    <th>Industry Demand</th>
                    <th>Gap Indicator</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.industry_demand.map((skill) => {
                    const gap =
                      skill.industry_demand -
                      skill.student_count

                    return (
                      <tr key={skill.id}>
                        <td className="fw-semibold">
                          {skill.name}
                        </td>

                        <td>
                          {skill.category || '—'}
                        </td>

                        <td>
                          {skill.student_count}
                        </td>

                        <td>
                          {skill.industry_demand}
                        </td>

                        <td>
                          {gap > 0 ? (
                            <span className="badge text-bg-warning">
                              Industry demand higher
                            </span>
                          ) : gap < 0 ? (
                            <span className="badge text-bg-success">
                              Student availability higher
                            </span>
                          ) : (
                            <span className="badge text-bg-secondary">
                              Balanced
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}