import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCompanyApplications,
  updateCompanyApplicationStatus,
} from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const INDUSTRY_APPLICATIONS_CACHE_KEY =
  'industry_company_applications'

function statusClass(status) {
  const normalized = status?.toLowerCase()

  if (normalized === 'accepted') {
    return 'aic-badge-success'
  }

  if (normalized === 'rejected') {
    return 'aic-badge-danger'
  }

  return 'aic-badge-pending'
}

export default function IndustryApplicants() {
  const [applications, setApplications] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        INDUSTRY_APPLICATIONS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        INDUSTRY_APPLICATIONS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (
        !sessionStorage.getItem(
          INDUSTRY_APPLICATIONS_CACHE_KEY
        )
      ) {
        setLoading(true)
      }

      setError('')

      const { data } = await getCompanyApplications()

      const result = data || []

      setApplications(result)

      sessionStorage.setItem(
        INDUSTRY_APPLICATIONS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (requestError) {
      console.error(
        'Company applications error:',
        requestError
      )

      setError(
        requestError.response?.data?.detail ||
        "We couldn't load applicant applications."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const cached = sessionStorage.getItem(
      INDUSTRY_APPLICATIONS_CACHE_KEY
    )

    if (!cached) {
      load()
    }
  }, [])

  const updateStatus = async (id, nextStatus) => {
    setUpdating(id)
    setError('')

    try {
      await updateCompanyApplicationStatus(
        id,
        nextStatus
      )

      // Fetch latest data after status change.
      await load()
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Could not update application status.'
      )
    } finally {
      setUpdating(null)
    }
  }

  const statistics = useMemo(() => {
    const total = applications.length

    const pending = applications.filter(
      (application) =>
        application.application_status?.toLowerCase() ===
        'pending'
    ).length

    const accepted = applications.filter(
      (application) =>
        application.application_status?.toLowerCase() ===
        'accepted'
    ).length

    const rejected = applications.filter(
      (application) =>
        application.application_status?.toLowerCase() ===
        'rejected'
    ).length

    return {
      total,
      pending,
      accepted,
      rejected,
    }
  }, [applications])

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase()

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.student_name
          ?.toLowerCase()
          .includes(query) ||
        application.student_email
          ?.toLowerCase()
          .includes(query) ||
        application.opportunity_title
          ?.toLowerCase()
          .includes(query) ||
        application.opportunity_type
          ?.toLowerCase()
          .includes(query) ||
        application.student_college
          ?.toLowerCase()
          .includes(query) ||
        application.student_branch
          ?.toLowerCase()
          .includes(query)

      const matchesStatus =
        statusFilter === 'all' ||
        application.application_status?.toLowerCase() ===
          statusFilter

      return matchesSearch && matchesStatus
    })
  }, [
    applications,
    search,
    statusFilter,
  ])

  if (loading) {
    return (
      <Loading
        label="Loading applications…"
        fullPage
      />
    )
  }

  if (
    error &&
    applications.length === 0
  ) {
    return (
      <div className="aic-card p-4">

        <EmptyState
          variant="error"
          description={error}
        />

        <div className="text-center mt-3">

          <button
            className="btn btn-aic-primary"
            onClick={() => load()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="container-fluid py-2">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-people"></i>
          </div>

          <div>

            <h1 className="h4 font-display fw-bold mb-1">
              Applications
            </h1>

            <p className="text-secondary mb-0">
              Review applications submitted to your company opportunities.
            </p>

          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => load({ force: true })}
          disabled={refreshing || updating !== null}
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

      {/* Error */}
      {error && applications.length > 0 && (
        <div className="alert alert-warning d-flex align-items-center mb-4">

          <i className="bi bi-exclamation-triangle me-2"></i>

          <span>{error}</span>

        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-lg-3">

          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>

                <small className="text-muted">
                  Total Applications
                </small>

                <h3 className="font-display fw-bold mb-0 mt-1">
                  {statistics.total}
                </h3>

              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-people"></i>
              </div>

            </div>

          </div>

        </div>

        <div className="col-6 col-lg-3">

          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>

                <small className="text-muted">
                  Pending
                </small>

                <h3 className="font-display fw-bold text-warning mb-0 mt-1">
                  {statistics.pending}
                </h3>

              </div>

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>

            </div>

          </div>

        </div>

        <div className="col-6 col-lg-3">

          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>

                <small className="text-muted">
                  Accepted
                </small>

                <h3 className="font-display fw-bold text-success mb-0 mt-1">
                  {statistics.accepted}
                </h3>

              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>

            </div>

          </div>

        </div>

        <div className="col-6 col-lg-3">

          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>

                <small className="text-muted">
                  Rejected
                </small>

                <h3 className="font-display fw-bold text-danger mb-0 mt-1">
                  {statistics.rejected}
                </h3>

              </div>

              <div className="aic-stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-x-circle"></i>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Applications Card */}
      <div className="aic-card">

        {/* Filters */}
        <div className="p-4 border-bottom">

          <div className="row g-3">

            <div className="col-lg-8">

              <div className="input-group">

                <span className="input-group-text bg-transparent">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="search"
                  className="form-control"
                  placeholder="Search by student, opportunity, college, or branch..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

              </div>

            </div>

            <div className="col-lg-4">

              <select
                className="form-select"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="rejected">
                  Rejected
                </option>

              </select>

            </div>

          </div>

          {(search || statusFilter !== 'all') && (
            <div className="mt-3">

              <button
                className="btn btn-aic-outline btn-sm"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
              >
                <i className="bi bi-x-lg me-1"></i>
                Clear Filters
              </button>

            </div>
          )}

        </div>

        {/* List */}
        <div className="p-4">

          {filteredApplications.length === 0 ? (

            <EmptyState
              description={
                applications.length === 0
                  ? 'No applications received yet.'
                  : 'No applications match your current filters.'
              }
            />

          ) : (

            <div className="d-flex flex-column gap-3">

              {filteredApplications.map(
                (application) => {

                  const applicationStatus =
                    application.application_status?.toLowerCase()

                  const isPending =
                    applicationStatus === 'pending'

                  return (
                    <div
                      className="border rounded-3 p-3 p-lg-4"
                      key={
                        application.application_id
                      }
                    >

                      <div className="d-flex flex-column flex-xl-row justify-content-between gap-4">

                        {/* Applicant */}
                        <div className="d-flex gap-3">

                          <div className="aic-stat-icon bg-primary-subtle text-primary flex-shrink-0">
                            <i className="bi bi-person"></i>
                          </div>

                          <div>

                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">

                              <h2 className="h6 fw-bold mb-0">
                                {application.student_name ||
                                  'Unknown Student'}
                              </h2>

                              <span className="text-uppercase small text-secondary">
                                {application.opportunity_type}
                              </span>

                            </div>

                            <p className="mb-1 fw-medium">
                              {application.opportunity_title ||
                                'Opportunity not specified'}
                            </p>

                            <div className="d-flex flex-wrap gap-2 text-secondary small">

                              <span>
                                <i className="bi bi-building me-1"></i>
                                {application.student_college ||
                                  'College not provided'}
                              </span>

                              <span>
                                <i className="bi bi-mortarboard me-1"></i>
                                {application.student_branch ||
                                  'Branch not provided'}
                              </span>

                              <span>
                                <i className="bi bi-star me-1"></i>
                                CGPA{' '}
                                {application.student_cgpa ??
                                  'Not provided'}
                              </span>

                            </div>

                            <p className="text-muted small mb-0 mt-2">

                              <i className="bi bi-calendar3 me-1"></i>

                              Applied{' '}

                              {application.applied_at
                                ? new Date(
                                    application.applied_at
                                  ).toLocaleDateString()
                                : 'Date not available'}

                            </p>

                          </div>

                        </div>

                        {/* Actions */}
                        <div className="d-flex flex-column align-items-xl-end gap-2">

                          <span
                            className={`aic-badge ${statusClass(
                              applicationStatus
                            )} text-capitalize`}
                          >
                            {application.application_status ||
                              'pending'}
                          </span>

                          <div className="d-flex flex-wrap gap-2">

                            <Link
                              className="btn btn-aic-outline btn-sm"
                              to={`/company/applications/${application.application_id}`}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View Application
                            </Link>

                            {isPending && (
                              <>
                                <button
                                  className="btn btn-aic-primary btn-sm"
                                  disabled={
                                    updating ===
                                    application.application_id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      application.application_id,
                                      'accepted'
                                    )
                                  }
                                >
                                  <i className="bi bi-check-lg me-1"></i>
                                  Accept
                                </button>

                                <button
                                  className="btn btn-aic-outline btn-sm"
                                  disabled={
                                    updating ===
                                    application.application_id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      application.application_id,
                                      'rejected'
                                    )
                                  }
                                >
                                  <i className="bi bi-x-lg me-1"></i>
                                  Reject
                                </button>
                              </>
                            )}

                          </div>

                        </div>

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
  )
}