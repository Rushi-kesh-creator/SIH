import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApplications } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const APPLICATIONS_CACHE_KEY = 'student_applications'

function statusClass(status) {
  const value = status?.toLowerCase()

  if (value === 'accepted') return 'aic-badge-success'
  if (value === 'rejected') return 'aic-badge-danger'

  return 'aic-badge-pending'
}

function getStatusCount(applications, status) {
  return applications.filter(
    (application) =>
      application.status?.toLowerCase() === status
  ).length
}

export default function StudentApplications() {
  const [applications, setApplications] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        APPLICATIONS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [status, setStatus] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        APPLICATIONS_CACHE_KEY
      )

      return cached ? 'ready' : 'loading'
    } catch {
      return 'loading'
    }
  })

  const [refreshing, setRefreshing] = useState(false)

  const loadApplications = async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(
          APPLICATIONS_CACHE_KEY
        )

        if (cached) {
          setStatus('ready')
          return
        }
      } catch {
        // Continue with API request.
      }
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setStatus('loading')
      }

      const { data } = await getApplications()

      const applicationData = data || []

      setApplications(applicationData)
      setStatus('ready')

      sessionStorage.setItem(
        APPLICATIONS_CACHE_KEY,
        JSON.stringify(applicationData)
      )
    } catch {
      setStatus('error')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  if (status === 'loading') {
    return (
      <Loading
        label="Loading your applications…"
        fullPage
      />
    )
  }

  if (status === 'error') {
    return (
      <div className="aic-card">
        <EmptyState
          variant="error"
          description="We couldn't load your applications. Please refresh the page."
        />
      </div>
    )
  }

  const pendingCount = getStatusCount(
    applications,
    'pending'
  )

  const acceptedCount = getStatusCount(
    applications,
    'accepted'
  )

  const rejectedCount = getStatusCount(
    applications,
    'rejected'
  )

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="text-uppercase small fw-semibold text-primary mb-1">
            Application Tracking
          </div>

          <h1 className="h4 font-display mb-1">
            My Applications
          </h1>

          <p className="text-secondary mb-0">
            Track the opportunities you have applied to and
            monitor their current status.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-aic-outline d-flex align-items-center gap-2"
          onClick={() => loadApplications(true)}
          disabled={refreshing}
        >
          <i
            className={`bi ${
              refreshing
                ? 'bi-arrow-repeat'
                : 'bi-arrow-clockwise'
            }`}
          />

          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="aic-card p-3 h-100">
            <div className="small text-secondary mb-1">
              Total applications
            </div>

            <div className="fs-3 fw-bold">
              {applications.length}
            </div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="aic-card p-3 h-100">
            <div className="small text-secondary mb-1">
              Pending
            </div>

            <div className="fs-3 fw-bold">
              {pendingCount}
            </div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="aic-card p-3 h-100">
            <div className="small text-secondary mb-1">
              Accepted
            </div>

            <div className="fs-3 fw-bold text-success">
              {acceptedCount}
            </div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="aic-card p-3 h-100">
            <div className="small text-secondary mb-1">
              Rejected
            </div>

            <div className="fs-3 fw-bold text-danger">
              {rejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="aic-card">
          <EmptyState
            description="Your applications will appear here after you apply to an internship or job."
          />
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h6 mb-1">
                Application history
              </h2>

              <p className="small text-secondary mb-0">
                Your submitted internship and job applications.
              </p>
            </div>

            <span className="aic-badge">
              {applications.length}{' '}
              {applications.length === 1
                ? 'application'
                : 'applications'}
            </span>
          </div>

          <div className="d-flex flex-column gap-3">
            {applications.map((application) => {
              const isInternship =
                application.type === 'internship'

              const opportunityPath = isInternship
                ? `/student/opportunity/internship/${application.opportunity_id}`
                : `/student/opportunity/job/${application.opportunity_id}`

              return (
                <div
                  className="aic-card p-4"
                  key={application.id}
                >
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    {/* Application information */}
                    <div className="d-flex gap-3">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          background:
                            'rgba(13, 110, 253, 0.1)',
                        }}
                      >
                        <i
                          className={`bi ${
                            isInternship
                              ? 'bi-mortarboard'
                              : 'bi-briefcase'
                          } text-primary fs-5`}
                        />
                      </div>

                      <div>
                        <span className="text-uppercase small fw-semibold text-secondary">
                          {application.type}
                        </span>

                        <h2 className="h6 mb-1 mt-1">
                          {application.opportunity_title ||
                            'Opportunity'}
                        </h2>

                        <p className="text-secondary small mb-1">
                          {application.company?.name ||
                            'Company'}

                          {application.location
                            ? ` · ${application.location}`
                            : ''}
                        </p>

                        <p className="text-secondary small mb-0">
                          Applied{' '}
                          {new Date(
                            application.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Status and action */}
                    <div className="text-md-end">
                      <span
                        className={`aic-badge ${statusClass(
                          application.status
                        )} text-capitalize`}
                      >
                        {application.status}
                      </span>

                      <Link
                        className="btn btn-aic-outline btn-sm d-block mt-2"
                        to={opportunityPath}
                      >
                        View opportunity
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}