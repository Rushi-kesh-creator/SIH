import { useEffect, useState } from 'react'
import { getStudentDashboard } from '../../api/studentApi'
import { useAuth } from '../../context/AuthContext.jsx'
import StatCard from '../../components/StatCard.jsx'
import Loading from '../../components/Loading.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const DASHBOARD_CACHE_KEY = 'student_dashboard'

export default function StudentDashboard() {
  const { user } = useAuth()

  const [dashboard, setDashboard] = useState(() => {
    try {
      const cached = sessionStorage.getItem(DASHBOARD_CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [status, setStatus] = useState(() => {
    try {
      const cached = sessionStorage.getItem(DASHBOARD_CACHE_KEY)
      return cached ? 'ready' : 'loading'
    } catch {
      return 'loading'
    }
  })

  const [errorStatus, setErrorStatus] = useState(null)

  useEffect(() => {
    // If cached data exists, don't show the loading screen again.
    if (dashboard) return

    let cancelled = false

    getStudentDashboard()
      .then(({ data }) => {
        if (cancelled) return

        setDashboard(data)

        sessionStorage.setItem(
          DASHBOARD_CACHE_KEY,
          JSON.stringify(data)
        )

        setStatus(
          data?.student && data?.counts
            ? 'ready'
            : 'empty'
        )
      })
      .catch((error) => {
        if (cancelled) return

        setErrorStatus(
          error.response?.status || null
        )

        setStatus(
          error.response?.status === 404
            ? 'empty'
            : 'error'
        )
      })

    return () => {
      cancelled = true
    }
  }, [dashboard])

  const student = dashboard?.student
  const counts = dashboard?.counts || {}
  const recentApplications =
    dashboard?.recent_applications || []

  const profileFields = student
    ? [
        student.college,
        student.degree,
        student.branch,
        student.cgpa,
      ]
    : []

  const profileFieldsFilled =
    profileFields.filter(
      (value) =>
        value !== null &&
        value !== '' &&
        value !== undefined
    ).length

  const profileFieldsTotal =
    profileFields.length || 1

  const completionPct = Math.round(
    (profileFieldsFilled / profileFieldsTotal) * 100
  )

  const errorDescription =
    errorStatus === 403
      ? 'You do not have access to the student dashboard.'
      : errorStatus === 401
        ? 'Your session has expired. Please sign in again.'
        : "We couldn't load your dashboard. Please refresh the page."

  if (status === 'loading') {
    return (
      <Loading
        label="Loading your dashboard…"
        fullPage
      />
    )
  }

  if (status === 'error') {
    return (
      <div className="aic-card">
        <EmptyState
          variant="error"
          description={errorDescription}
        />
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="aic-card">
        <EmptyState
          description={
            errorStatus === 404
              ? 'Complete your student profile to see dashboard data.'
              : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className="student-dashboard">

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <div className="small text-secondary fw-semibold mb-1">
            STUDENT PORTAL
          </div>

          <h1 className="h3 font-display fw-bold mb-1">
            Welcome{student?.name ? `, ${student.name}` : ''}
          </h1>

          <p className="text-secondary mb-0">
            Here's a quick overview of your academic and
            career progress.
          </p>
        </div>

        <div className="text-md-end">
          <div className="small text-secondary">
            Signed in as
          </div>

          <div className="small fw-semibold">
            {user?.email}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-xl-3">
          <StatCard
            icon="bi-person-check"
            label="Profile completion"
            value={`${completionPct}%`}
            accent="indigo"
          />
        </div>

        <div className="col-6 col-xl-3">
          <StatCard
            icon="bi-lightning-charge"
            label="Skills logged"
            value={counts.skills ?? 0}
            accent="teal"
          />
        </div>

        <div className="col-6 col-xl-3">
          <StatCard
            icon="bi-send-check"
            label="Applications"
            value={counts.applications ?? 0}
            accent="amber"
          />
        </div>

        <div className="col-6 col-xl-3">
          <StatCard
            icon="bi-award"
            label="Certifications"
            value={counts.certifications ?? 0}
            accent="green"
          />
        </div>

      </div>

      {/* Main content */}
      <div className="row g-3">

        {/* Profile overview */}
        <div className="col-xl-5">
          <div className="aic-card p-4 h-100">

            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <div className="small text-secondary mb-1">
                  PROFILE
                </div>

                <h2 className="h5 fw-bold mb-0">
                  Student overview
                </h2>
              </div>

              <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
                {completionPct}% complete
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-secondary">
                  Profile completion
                </span>

                <span className="fw-semibold">
                  {completionPct}%
                </span>
              </div>

              <div
                className="progress"
                style={{ height: 7 }}
              >
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${completionPct}%`,
                  }}
                  aria-valuenow={completionPct}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>

            <div className="row g-3 small">

              <div className="col-6">
                <span className="text-secondary d-block mb-1">
                  College
                </span>

                <span className="fw-semibold">
                  {student?.college || '—'}
                </span>
              </div>

              <div className="col-6">
                <span className="text-secondary d-block mb-1">
                  Degree
                </span>

                <span className="fw-semibold">
                  {student?.degree || '—'}
                </span>
              </div>

              <div className="col-6">
                <span className="text-secondary d-block mb-1">
                  Branch
                </span>

                <span className="fw-semibold">
                  {student?.branch || '—'}
                </span>
              </div>

              <div className="col-6">
                <span className="text-secondary d-block mb-1">
                  CGPA
                </span>

                <span className="fw-semibold">
                  {student?.cgpa ?? '—'}
                </span>
              </div>

              <div className="col-6">
                <span className="text-secondary d-block mb-1">
                  Projects
                </span>

                <span className="fw-semibold">
                  {counts.projects ?? 0}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Application summary */}
        <div className="col-xl-7">
          <div className="aic-card p-4 h-100">

            <div className="mb-4">
              <div className="small text-secondary mb-1">
                APPLICATIONS
              </div>

              <h2 className="h5 fw-bold mb-0">
                Application summary
              </h2>
            </div>

            <div className="row g-3 mb-4">

              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-secondary mb-1">
                    Pending
                  </div>

                  <div className="h4 fw-bold mb-0">
                    {counts.pending_applications ?? 0}
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-secondary mb-1">
                    Accepted
                  </div>

                  <div className="h4 fw-bold mb-0">
                    {counts.accepted_applications ?? 0}
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-secondary mb-1">
                    Rejected
                  </div>

                  <div className="h4 fw-bold mb-0">
                    {counts.rejected_applications ?? 0}
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-secondary mb-1">
                    Internships / Jobs
                  </div>

                  <div className="h4 fw-bold mb-0">
                    {counts.internship_applications ?? 0}
                    {' / '}
                    {counts.job_applications ?? 0}
                  </div>
                </div>
              </div>

            </div>

            {/* Recent applications */}
            <div>
              <h3 className="h6 fw-bold mb-3">
                Recent applications
              </h3>

              {recentApplications.length === 0 ? (
                <EmptyState
                  description="Your recent applications will appear here."
                />
              ) : (
                <div className="d-flex flex-column gap-2">

                  {recentApplications.map(
                    (application) => (
                      <div
                        key={application.id}
                        className="d-flex justify-content-between align-items-center border rounded-3 p-3"
                      >
                        <div className="min-w-0">
                          <div className="small fw-semibold text-truncate">
                            {application.title ||
                              'Untitled opportunity'}
                          </div>

                          <div className="text-secondary small text-capitalize mt-1">
                            {application.type}
                          </div>
                        </div>

                        <span className="badge rounded-pill bg-body-secondary text-body text-capitalize ms-3">
                          {application.status ||
                            'Unknown'}
                        </span>
                      </div>
                    )
                  )}

                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}