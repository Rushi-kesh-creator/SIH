import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_SKILL_ANALYTICS_CACHE_KEY =
  'admin_skill_analytics'

export default function AdminSkillAnalytics() {
  const [analytics, setAnalytics] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_SKILL_ANALYTICS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ADMIN_SKILL_ANALYTICS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadAnalytics = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!analytics) {
        setLoading(true)
      }

      setError('')

      const response = await api.get(
        '/admin/skill-analytics'
      )

      const result = response.data

      setAnalytics(result)

      sessionStorage.setItem(
        ADMIN_SKILL_ANALYTICS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error(
        'Admin skill analytics error:',
        err
      )

      if (err.response?.status === 401) {
        setError(
          'Please log in again as administrator.'
        )
      } else if (err.response?.status === 403) {
        setError('Admin access required.')
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load skill analytics.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_SKILL_ANALYTICS_CACHE_KEY
    )

    if (!hasCache) {
      loadAnalytics()
    }
  }, [])

  const topStudentSkills = useMemo(() => {
    if (!analytics?.skill_distribution) {
      return []
    }

    return analytics.skill_distribution
      .filter(
        (skill) => skill.student_count > 0
      )
      .slice(0, 10)
  }, [analytics])

  const topIndustrySkills = useMemo(() => {
    if (!analytics?.industry_demand) {
      return []
    }

    return analytics.industry_demand
      .filter(
        (skill) => skill.industry_demand > 0
      )
      .slice(0, 10)
  }, [analytics])

  const filteredComparison = useMemo(() => {
    if (!analytics?.industry_demand) {
      return []
    }

    const query = search.trim().toLowerCase()

    if (!query) {
      return analytics.industry_demand
    }

    return analytics.industry_demand.filter(
      (skill) =>
        [skill.name, skill.category]
          .filter(Boolean)
          .some((value) =>
            value
              .toString()
              .toLowerCase()
              .includes(query)
          )
    )
  }, [analytics, search])

  const getGapClass = (gap) => {
    if (gap > 0) {
      return 'bg-warning-subtle text-warning-emphasis'
    }

    if (gap < 0) {
      return 'bg-success-subtle text-success'
    }

    return 'bg-secondary-subtle text-secondary'
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

  if (error && !analytics) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load skill analytics
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadAnalytics()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>

          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const summary = analytics.summary || {}

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-bar-chart-line"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Skill Analytics
            </h2>

            <p className="text-muted mb-0">
              Analyze student skills and current industry skill demand.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() =>
            loadAnalytics({ force: true })
          }
          disabled={refreshing}
        >
          <i
            className={`bi ${
              refreshing
                ? 'bi-arrow-repeat'
                : 'bi-arrow-clockwise'
            } me-2`}
          ></i>

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* Refresh error */}
      {error && analytics && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        {/* Total Skills */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Total Skills
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.total_skills ?? 0}
                </h3>

                <small className="text-muted">
                  Skills available in portal
                </small>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-lightbulb"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Students With Skills */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Students With Skills
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.students_with_skills ?? 0}
                </h3>

                <small className="text-muted">
                  Students with at least one skill
                </small>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-people"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Active Jobs */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active Jobs
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.active_jobs ?? 0}
                </h3>

                <small className="text-muted">
                  Current job opportunities
                </small>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-briefcase"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Active Internships */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active Internships
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.active_internships ?? 0}
                </h3>

                <small className="text-muted">
                  Current internship opportunities
                </small>
              </div>

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-mortarboard"></i>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Analytics Panels */}
      <div className="row g-4">

        {/* Student Skills */}
        <div className="col-12 col-xl-6">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <h5 className="fw-bold mb-1">
                Top Student Skills
              </h5>

              <p className="text-muted small mb-0">
                Skills currently associated with students.
              </p>

            </div>

            <div className="p-4">

              {topStudentSkills.length === 0 ? (

                <div className="text-center text-muted py-4">
                  <i className="bi bi-bar-chart fs-2 d-block mb-2"></i>
                  No student skill data available.
                </div>

              ) : (

                <div>

                  {topStudentSkills.map(
                    (skill, index) => {

                      const maxCount = Math.max(
                        1,
                        topStudentSkills[0]
                          .student_count
                      )

                      const percentage = Math.min(
                        100,
                        (skill.student_count /
                          maxCount) *
                          100
                      )

                      return (
                        <div
                          key={skill.id}
                          className="mb-4"
                        >

                          <div className="d-flex justify-content-between align-items-center mb-2">

                            <div className="d-flex align-items-center gap-2">

                              <span className="text-muted small">
                                {index + 1}
                              </span>

                              <span className="fw-semibold">
                                {skill.name}
                              </span>

                            </div>

                            <span className="text-muted small">
                              {skill.student_count}{' '}
                              student
                              {skill.student_count !== 1
                                ? 's'
                                : ''}
                            </span>

                          </div>

                          <div
                            className="progress"
                            style={{
                              height: '8px',
                            }}
                          >
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${percentage}%`,
                              }}
                              aria-valuenow={
                                percentage
                              }
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>

                        </div>
                      )
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

        {/* Industry Demand */}
        <div className="col-12 col-xl-6">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <h5 className="fw-bold mb-1">
                Industry Skill Demand
              </h5>

              <p className="text-muted small mb-0">
                Skills requested by active jobs and internships.
              </p>

            </div>

            <div className="p-4">

              {topIndustrySkills.length === 0 ? (

                <div className="text-center text-muted py-4">
                  <i className="bi bi-graph-up fs-2 d-block mb-2"></i>
                  No industry skill demand data available.
                </div>

              ) : (

                <div>

                  {topIndustrySkills.map(
                    (skill, index) => {

                      const maxDemand = Math.max(
                        1,
                        topIndustrySkills[0]
                          .industry_demand
                      )

                      const percentage = Math.min(
                        100,
                        (skill.industry_demand /
                          maxDemand) *
                          100
                      )

                      return (
                        <div
                          key={skill.id}
                          className="mb-4"
                        >

                          <div className="d-flex justify-content-between align-items-center mb-2">

                            <div className="d-flex align-items-center gap-2">

                              <span className="text-muted small">
                                {index + 1}
                              </span>

                              <span className="fw-semibold">
                                {skill.name}
                              </span>

                            </div>

                            <span className="text-muted small">
                              {skill.industry_demand}{' '}
                              {skill.industry_demand === 1
                                ? 'opportunity'
                                : 'opportunities'}
                            </span>

                          </div>

                          <div
                            className="progress"
                            style={{
                              height: '8px',
                            }}
                          >
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${percentage}%`,
                              }}
                              aria-valuenow={
                                percentage
                              }
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>

                        </div>
                      )
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* Skill Comparison */}
      <div className="aic-card mt-4">

        <div className="p-4 border-bottom">

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

            <div>
              <h5 className="fw-bold mb-1">
                Student Skills vs Industry Demand
              </h5>

              <p className="text-muted small mb-0">
                Compare student availability with demand from active opportunities.
              </p>
            </div>

            <div className="text-muted small">
              {filteredComparison.length} skill
              {filteredComparison.length !== 1
                ? 's'
                : ''}
            </div>

          </div>

        </div>

        {/* Search */}
        <div className="p-4 border-bottom">

          <div className="row">

            <div className="col-12 col-lg-5">

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
                  placeholder="Search skill or category..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSearch('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* Comparison Table */}
        {filteredComparison.length === 0 ? (

          <div className="text-center text-muted py-5">

            <i className="bi bi-search fs-2 d-block mb-2"></i>

            <h6 className="fw-semibold">
              No matching skills
            </h6>

            <p className="small mb-0">
              Try a different search term.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead>
                <tr>
                  <th className="ps-4">
                    Skill
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Students
                  </th>

                  <th>
                    Industry Demand
                  </th>

                  <th className="pe-4">
                    Gap Indicator
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredComparison.map(
                  (skill) => {

                    const gap =
                      skill.industry_demand -
                      skill.student_count

                    return (
                      <tr key={skill.id}>

                        <td className="ps-4">

                          <div className="d-flex align-items-center gap-2">

                            <div
                              className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: 34,
                                height: 34,
                                flexShrink: 0,
                              }}
                            >
                              <i className="bi bi-lightbulb"></i>
                            </div>

                            <span className="fw-semibold">
                              {skill.name}
                            </span>

                          </div>

                        </td>

                        <td>
                          {skill.category || '—'}
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {skill.student_count}
                          </span>
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {skill.industry_demand}
                          </span>
                        </td>

                        <td className="pe-4">

                          <span
                            className={`badge ${getGapClass(
                              gap
                            )}`}
                          >
                            {gap > 0
                              ? 'Industry demand higher'
                              : gap < 0
                              ? 'Student availability higher'
                              : 'Balanced'}
                          </span>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  )
}