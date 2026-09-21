import { useEffect, useState } from 'react'
import { getCompanyDashboard } from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import StatCard from '../../components/StatCard.jsx'

const INDUSTRY_DASHBOARD_CACHE_KEY = 'industry_dashboard'

export default function IndustryDashboard() {
  const [dashboard, setDashboard] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        INDUSTRY_DASHBOARD_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        INDUSTRY_DASHBOARD_CACHE_KEY
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

      const { data } = await getCompanyDashboard()

      setDashboard(data)

      sessionStorage.setItem(
        INDUSTRY_DASHBOARD_CACHE_KEY,
        JSON.stringify(data)
      )
    } catch (err) {
      console.error('Industry dashboard error:', err)

      setError(
        err?.response?.data?.detail ||
        'We couldn\'t load your company dashboard. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      INDUSTRY_DASHBOARD_CACHE_KEY
    )

    if (!hasCache) {
      loadDashboard()
    }
  }, [])

  if (loading) {
    return (
      <Loading
        label="Loading company dashboard…"
        fullPage
      />
    )
  }

  if (error && !dashboard) {
    return (
      <div className="aic-card p-4">
        <EmptyState
          variant="error"
          description={error}
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

  if (!dashboard) {
    return null
  }

  const stats = dashboard.statistics || {}
  const company = dashboard.company || {}

  return (
    <div className="container-fluid py-2">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div>
          <div className="d-flex align-items-center gap-2 mb-2">

            <span className="aic-badge">
              <i className="bi bi-building me-1"></i>
              Industry Portal
            </span>

          </div>

          <h1 className="h4 font-display fw-bold mb-1">
            Welcome, {company.name || 'Company'}
          </h1>

          <p className="text-secondary mb-0">
            Your industry collaboration overview.
          </p>
        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() =>
            loadDashboard({ force: true })
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

      {/* Refresh Error */}
      {error && dashboard && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Primary Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-briefcase"
            label="Total Internships"
            value={stats.total_internships ?? 0}
            accent="indigo"
          />
        </div>

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-check-circle"
            label="Active Internships"
            value={stats.active_internships ?? 0}
            accent="teal"
          />
        </div>

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-suitcase-lg"
            label="Total Jobs"
            value={stats.total_jobs ?? 0}
            accent="amber"
          />
        </div>

        <div className="col-6 col-lg-3">
          <StatCard
            icon="bi-send-check"
            label="Total Applications"
            value={stats.total_applications ?? 0}
            accent="green"
          />
        </div>

      </div>

      {/* Secondary Statistics */}
      <div className="row g-3">

        <div className="col-md-4">
          <StatCard
            icon="bi-lightning-charge"
            label="Active Jobs"
            value={stats.active_jobs ?? 0}
            accent="teal"
          />
        </div>

        <div className="col-md-4">
          <StatCard
            icon="bi-hourglass-split"
            label="Pending Applications"
            value={stats.pending_applications ?? 0}
            accent="amber"
          />
        </div>

        <div className="col-md-4">
          <StatCard
            icon="bi-geo-alt"
            label="Location"
            value={company.location || 'Not set'}
            accent="indigo"
          />
        </div>

      </div>

      {/* Company Overview */}
      <div className="aic-card mt-4">

        <div className="p-4">

          <div className="d-flex align-items-center gap-3">

            <div className="aic-page-icon bg-primary-subtle text-primary">
              <i className="bi bi-building"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-1">
                Company Overview
              </h5>

              <p className="text-muted small mb-0">
                Your organization's current collaboration activity.
              </p>
            </div>

          </div>

          <hr />

          <div className="row g-3">

            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">

                <small className="text-muted">
                  Company
                </small>

                <div className="fw-semibold mt-1">
                  {company.name || 'Not set'}
                </div>

              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">

                <small className="text-muted">
                  Location
                </small>

                <div className="fw-semibold mt-1">
                  {company.location || 'Not set'}
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}