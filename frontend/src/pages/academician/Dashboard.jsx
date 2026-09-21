import { useEffect, useState } from 'react'
import { getAcademicianDashboard } from '../../api/academicianApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import StatCard from '../../components/StatCard.jsx'

const ACADEMICIAN_DASHBOARD_CACHE_KEY =
  'academician_dashboard'

export default function AcademicianDashboard() {
  const [dashboard, setDashboard] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ACADEMICIAN_DASHBOARD_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ACADEMICIAN_DASHBOARD_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadDashboard = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!dashboard) {
        setLoading(true)
      }

      setError('')

      const { data } = await getAcademicianDashboard()

      setDashboard(data)

      sessionStorage.setItem(
        ACADEMICIAN_DASHBOARD_CACHE_KEY,
        JSON.stringify(data)
      )
    } catch (requestError) {
      console.error(
        'Academician dashboard error:',
        requestError
      )

      setError(
        requestError.response?.data?.detail ||
        "We couldn't load your academician dashboard."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const cached = sessionStorage.getItem(
      ACADEMICIAN_DASHBOARD_CACHE_KEY
    )

    if (!cached) {
      loadDashboard()
    }
  }, [])

  if (loading) {
    return (
      <Loading
        label="Loading academician dashboard…"
        fullPage
      />
    )
  }

  if (!dashboard) {
    return (
      <div className="aic-card p-4">
        <EmptyState
          variant="error"
          description={
            error ||
            "We couldn't load your academician dashboard."
          }
        />

        <div className="text-center mt-3">
          <button
            className="btn btn-aic-primary"
            onClick={() => loadDashboard()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const stats = dashboard.statistics || {}

  const completed =
    dashboard.profile_completion?.completed || 0

  const available =
    dashboard.profile_completion?.available || 1

  const profilePercentage = Math.round(
    (completed / available) * 100
  )

  return (
    <div className="container-fluid py-2">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="aic-badge aic-badge-success">
              <i className="bi bi-mortarboard me-1"></i>
              Academician Portal
            </span>
          </div>

          <h1 className="h4 font-display fw-bold mb-1">
            Welcome, {dashboard.academician?.name || 'Academician'}
          </h1>

          <p className="text-secondary mb-0">
            Manage academic programs, understand student skills,
            and recommend learning opportunities.
          </p>
        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadDashboard({ force: true })}
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

      {/* Error */}
      {error && dashboard && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-people"
            label="Total Students"
            value={stats.total_students ?? 0}
            accent="indigo"
          />
        </div>

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-person-check"
            label="Students With Skills"
            value={stats.students_with_skills ?? 0}
            accent="teal"
          />
        </div>

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-book"
            label="Academic Programs"
            value={stats.academic_programs ?? 0}
            accent="amber"
          />
        </div>

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-lightbulb"
            label="Recommendations"
            value={stats.recommendations ?? 0}
            accent="green"
          />
        </div>

      </div>

      <div className="row g-4">

        {/* Profile */}
        <div className="col-lg-5">

          <div className="aic-card p-4 h-100">

            <div className="d-flex justify-content-between align-items-start mb-4">

              <div>
                <h2 className="h6 fw-bold mb-1">
                  Academic Profile
                </h2>

                <p className="text-secondary small mb-0">
                  Your academician account information.
                </p>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-person-badge"></i>
              </div>

            </div>

            <div className="d-flex align-items-center gap-3 mb-4">

              <div
                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                style={{
                  width: 52,
                  height: 52,
                  fontSize: 22,
                }}
              >
                <i className="bi bi-person"></i>
              </div>

              <div>
                <h3 className="h6 fw-bold mb-1">
                  {dashboard.academician?.name ||
                    'Academician'}
                </h3>

                <p className="text-secondary small mb-0">
                  {dashboard.academician?.email || ''}
                </p>
              </div>

            </div>

            <div className="mb-2 d-flex justify-content-between">

              <span className="small fw-semibold">
                Profile Completion
              </span>

              <span className="small text-secondary">
                {profilePercentage}%
              </span>

            </div>

            <div
              className="progress"
              style={{ height: 8 }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${profilePercentage}%`,
                }}
                aria-valuenow={profilePercentage}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

          </div>

        </div>

        {/* Portal Overview */}
        <div className="col-lg-7">

          <div className="aic-card p-4 h-100">

            <div className="d-flex align-items-start gap-3 mb-4">

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-diagram-3"></i>
              </div>

              <div>
                <h2 className="h6 fw-bold mb-1">
                  Academic Collaboration
                </h2>

                <p className="text-secondary small mb-0">
                  Connect academic learning with student
                  skills and career development.
                </p>
              </div>

            </div>

            <div className="row g-3">

              <div className="col-md-4">
                <div className="border rounded-3 p-3 h-100">

                  <i className="bi bi-book text-primary fs-5"></i>

                  <h3 className="small fw-bold mt-2 mb-1">
                    Academic Programs
                  </h3>

                  <p className="text-secondary small mb-0">
                    Create and manage courses and learning
                    programs.
                  </p>

                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded-3 p-3 h-100">

                  <i className="bi bi-people text-success fs-5"></i>

                  <h3 className="small fw-bold mt-2 mb-1">
                    Student Skills
                  </h3>

                  <p className="text-secondary small mb-0">
                    Understand the skills students currently
                    have.
                  </p>

                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded-3 p-3 h-100">

                  <i className="bi bi-lightbulb text-warning fs-5"></i>

                  <h3 className="small fw-bold mt-2 mb-1">
                    Recommendations
                  </h3>

                  <p className="text-secondary small mb-0">
                    Recommend learning opportunities based
                    on skill needs.
                  </p>

                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}