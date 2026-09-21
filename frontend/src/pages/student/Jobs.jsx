import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications, getJobs } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OpportunityCard from '../../components/OpportunityCard.jsx'

const JOBS_CACHE_KEY = 'student_jobs'

export default function StudentJobs() {
  const navigate = useNavigate()

  const [jobs, setJobs] = useState(() => {
    try {
      const cached = sessionStorage.getItem(JOBS_CACHE_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [appliedIds, setAppliedIds] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        `${JOBS_CACHE_KEY}_applied`
      )

      return cached
        ? new Set(JSON.parse(cached))
        : new Set()
    } catch {
      return new Set()
    }
  })

  const [status, setStatus] = useState(() => {
    try {
      const cached = sessionStorage.getItem(JOBS_CACHE_KEY)
      return cached ? 'ready' : 'loading'
    } catch {
      return 'loading'
    }
  })

  const [refreshing, setRefreshing] = useState(false)

  const loadJobs = async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(JOBS_CACHE_KEY)

        if (cached) {
          setStatus('ready')
          return
        }
      } catch {
        // Continue with API request
      }
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setStatus('loading')
      }

      const [jobResponse, applicationResponse] =
        await Promise.all([
          getJobs(),
          getApplications(),
        ])

      const jobData = jobResponse.data || []

      const applicationIds = (
        applicationResponse.data || []
      )
        .filter((item) => item.type === 'job')
        .map((item) => item.opportunity_id)

      setJobs(jobData)
      setAppliedIds(new Set(applicationIds))
      setStatus('ready')

      sessionStorage.setItem(
        JOBS_CACHE_KEY,
        JSON.stringify(jobData)
      )

      sessionStorage.setItem(
        `${JOBS_CACHE_KEY}_applied`,
        JSON.stringify(applicationIds)
      )
    } catch {
      setStatus('error')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  if (status === 'loading') {
    return (
      <Loading
        label="Loading jobs…"
        fullPage
      />
    )
  }

  if (status === 'error') {
    return (
      <div className="aic-card">
        <EmptyState
          variant="error"
          description="We couldn't load jobs. Please refresh the page."
        />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="text-uppercase small fw-semibold text-primary mb-1">
            Career Opportunities
          </div>

          <h1 className="h4 font-display mb-1">
            Jobs
          </h1>

          <p className="text-secondary mb-0">
            Browse active job opportunities from industry
            partners and find roles that match your goals.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-aic-outline d-flex align-items-center gap-2"
          onClick={() => loadJobs(true)}
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

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <div className="aic-card p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(13, 110, 253, 0.1)',
                }}
              >
                <i className="bi bi-briefcase text-primary fs-5" />
              </div>

              <div>
                <div className="small text-secondary">
                  Available jobs
                </div>

                <div className="fs-4 fw-bold">
                  {jobs.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="aic-card p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(25, 135, 84, 0.1)',
                }}
              >
                <i className="bi bi-check-circle text-success fs-5" />
              </div>

              <div>
                <div className="small text-secondary">
                  Already applied
                </div>

                <div className="fs-4 fw-bold">
                  {appliedIds.size}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job list */}
      {jobs.length === 0 ? (
        <div className="aic-card">
          <EmptyState
            description="No active jobs are available right now."
          />
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h6 mb-1">
                Available opportunities
              </h2>

              <p className="small text-secondary mb-0">
                Browse jobs and view their full details.
              </p>
            </div>

            <span className="aic-badge">
              {jobs.length}{' '}
              {jobs.length === 1
                ? 'opportunity'
                : 'opportunities'}
            </span>
          </div>

          <div className="row g-3">
            {jobs.map((job) => (
              <div
                className="col-md-6 col-xl-4"
                key={job.id}
              >
                <OpportunityCard
                  title={job.title}
                  company={job.company?.name || 'Company'}
                  location={job.location}
                  type="Job"
                  compensation={job.salary}
                  applied={appliedIds.has(job.id)}
                  onApply={() =>
                    navigate(
                      `/student/opportunity/job/${job.id}`
                    )
                  }
                  onViewDetails={() =>
                    navigate(
                      `/student/opportunity/job/${job.id}`
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}