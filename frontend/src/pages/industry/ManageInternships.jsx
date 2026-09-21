import { useEffect, useMemo, useState } from 'react'
import {
  closeCompanyInternship,
  createCompanyInternship,
  getCompanyInternships,
  updateCompanyInternship,
} from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OpportunityForm from '../../components/OpportunityForm.jsx'

const INDUSTRY_INTERNSHIPS_CACHE_KEY =
  'industry_company_internships'

export default function IndustryManageInternships() {
  const [internships, setInternships] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        INDUSTRY_INTERNSHIPS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        INDUSTRY_INTERNSHIPS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (
        !sessionStorage.getItem(
          INDUSTRY_INTERNSHIPS_CACHE_KEY
        )
      ) {
        setLoading(true)
      }

      setError('')

      const { data } = await getCompanyInternships()

      const result = data || []

      setInternships(result)

      sessionStorage.setItem(
        INDUSTRY_INTERNSHIPS_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (requestError) {
      console.error(
        'Company internships error:',
        requestError
      )

      setError(
        requestError.response?.data?.detail ||
        'We couldn\'t load your internships.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      INDUSTRY_INTERNSHIPS_CACHE_KEY
    )

    if (!hasCache) {
      load()
    }
  }, [])

  const save = async (payload) => {
    setSaving(true)
    setError('')

    try {
      if (form?.id) {
        await updateCompanyInternship(
          form.id,
          payload
        )
      } else {
        await createCompanyInternship(payload)
      }

      setForm(null)

      // Get latest data and update cache.
      await load()
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Could not save the internship.'
      )
    } finally {
      setSaving(false)
    }
  }

  const close = async (id) => {
    if (!window.confirm('Close this internship?')) {
      return
    }

    try {
      setError('')

      await closeCompanyInternship(id)

      await load()
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Could not close the internship.'
      )
    }
  }

  const statistics = useMemo(() => {
    const total = internships.length

    const active = internships.filter(
      (item) =>
        item.status?.toLowerCase() === 'active'
    ).length

    const published = internships.filter(
      (item) =>
        item.status?.toLowerCase() === 'published'
    ).length

    const closed = internships.filter(
      (item) =>
        item.status?.toLowerCase() === 'closed' ||
        item.status?.toLowerCase() === 'inactive'
    ).length

    return {
      total,
      active,
      published,
      closed,
    }
  }, [internships])

  if (loading) {
    return (
      <Loading
        label="Loading internships…"
        fullPage
      />
    )
  }

  if (error && internships.length === 0) {
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
            <i className="bi bi-briefcase"></i>
          </div>

          <div>

            <h1 className="h4 font-display fw-bold mb-1">
              Company Internships
            </h1>

            <p className="text-secondary mb-0">
              Manage internships posted by your company.
            </p>

          </div>

        </div>

        <div className="d-flex flex-wrap gap-2">

          <button
            className="btn btn-aic-outline"
            onClick={() => load({ force: true })}
            disabled={refreshing || saving}
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

          <button
            className="btn btn-aic-primary"
            onClick={() =>
              setForm({ status: 'active' })
            }
            disabled={saving}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Create Internship
          </button>

        </div>

      </div>

      {/* Refresh / Action Error */}
      {error && internships.length > 0 && (
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
                  Total
                </small>

                <h3 className="font-display fw-bold mb-0 mt-1">
                  {statistics.total}
                </h3>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-briefcase"></i>
              </div>

            </div>

          </div>

        </div>

        <div className="col-6 col-lg-3">

          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <small className="text-muted">
                  Active
                </small>

                <h3 className="font-display fw-bold text-success mb-0 mt-1">
                  {statistics.active}
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
                  Published
                </small>

                <h3 className="font-display fw-bold mb-0 mt-1">
                  {statistics.published}
                </h3>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-megaphone"></i>
              </div>

            </div>

          </div>

        </div>

        <div className="col-6 col-lg-3">

          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <small className="text-muted">
                  Closed
                </small>

                <h3 className="font-display fw-bold text-danger mb-0 mt-1">
                  {statistics.closed}
                </h3>
              </div>

              <div className="aic-stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-x-circle"></i>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Create / Edit Form */}
      {form && (
        <div className="mb-4">

          <OpportunityForm
            type="internship"
            initialValue={
              form.id ? form : null
            }
            saving={saving}
            onSave={save}
            onCancel={() => setForm(null)}
          />

        </div>
      )}

      {/* Internship List */}
      {internships.length === 0 ? (

        <div className="aic-card p-4">

          <EmptyState
            description="No internships posted yet."
          />

          <div className="text-center mt-3">

            <button
              className="btn btn-aic-primary"
              onClick={() =>
                setForm({ status: 'active' })
              }
            >
              <i className="bi bi-plus-lg me-2"></i>
              Create Your First Internship
            </button>

          </div>

        </div>

      ) : (

        <div className="d-flex flex-column gap-3">

          {internships.map((internship) => {

            const isClosed =
              internship.status?.toLowerCase() ===
                'closed' ||
              internship.status?.toLowerCase() ===
                'inactive'

            return (
              <div
                className="aic-card p-4"
                key={internship.id}
              >

                <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">

                  {/* Details */}
                  <div className="flex-grow-1">

                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">

                      <span
                        className={`aic-badge ${
                          isClosed
                            ? 'aic-badge-danger'
                            : 'aic-badge-success'
                        } text-capitalize`}
                      >
                        {internship.status}
                      </span>

                    </div>

                    <h2 className="h6 fw-bold mb-2">
                      {internship.title}
                    </h2>

                    <div className="d-flex flex-wrap gap-3 text-secondary small mb-3">

                      {internship.location && (
                        <span>
                          <i className="bi bi-geo-alt me-1"></i>
                          {internship.location}
                        </span>
                      )}

                      {internship.skills && (
                        <span>
                          <i className="bi bi-lightbulb me-1"></i>
                          {internship.skills}
                        </span>
                      )}

                    </div>

                    <div className="d-flex flex-wrap gap-3 text-muted small">

                      <span>
                        <i className="bi bi-calendar3 me-1"></i>
                        {internship.duration ||
                          'Duration not specified'}
                      </span>

                      {internship.stipend && (
                        <span>
                          <i className="bi bi-cash-stack me-1"></i>
                          {internship.stipend}
                        </span>
                      )}

                      {internship.created_at && (
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          Created{' '}
                          {new Date(
                            internship.created_at
                          ).toLocaleDateString()}
                        </span>
                      )}

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="d-flex align-items-start gap-2">

                    <button
                      className="btn btn-aic-outline btn-sm"
                      onClick={() =>
                        setForm(internship)
                      }
                      disabled={saving}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>

                    {!isClosed && (
                      <button
                        className="btn btn-aic-outline btn-sm"
                        onClick={() =>
                          close(internship.id)
                        }
                        disabled={saving}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Close
                      </button>
                    )}

                  </div>

                </div>

              </div>
            )
          })}

        </div>

      )}

    </div>
  )
}