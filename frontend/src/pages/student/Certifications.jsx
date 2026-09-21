import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getStudentCertifications,
  addStudentCertification,
} from '../../api/studentApi'
import Loading from '../../components/Loading.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const CERTIFICATIONS_CACHE_KEY = 'student_certifications'

const EMPTY_FORM = {
  name: '',
  issuer: '',
  issue_date: '',
  credential_url: '',
}

export default function StudentCertifications() {
  const [certifications, setCertifications] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        CERTIFICATIONS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        CERTIFICATIONS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [form, setForm] = useState(EMPTY_FORM)

  const loadCertifications = async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(
          CERTIFICATIONS_CACHE_KEY
        )

        if (cached) {
          setCertifications(JSON.parse(cached))
          setLoading(false)
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
        setLoading(true)
      }

      const { data } = await getStudentCertifications()

      const certificationData =
        data?.certifications || []

      setCertifications(certificationData)

      sessionStorage.setItem(
        CERTIFICATIONS_CACHE_KEY,
        JSON.stringify(certificationData)
      )
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          'Could not load certifications.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadCertifications()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Certification name is required.')
      return
    }

    setSaving(true)

    try {
      const { data } = await addStudentCertification({
        name: form.name.trim(),
        issuer: form.issuer.trim() || null,
        issue_date: form.issue_date || null,
        credential_url:
          form.credential_url.trim() || null,
      })

      /*
       * If the backend returns the created certification,
       * add it directly to the current list.
       */
      const newCertification =
        data?.certification || data

      let updatedCertifications

      if (
        newCertification &&
        typeof newCertification === 'object' &&
        newCertification.id
      ) {
        updatedCertifications = [
          newCertification,
          ...certifications,
        ]
      } else {
        /*
         * Fallback: reload from backend if the POST response
         * does not contain the created certification.
         */
        const response =
          await getStudentCertifications()

        updatedCertifications =
          response.data?.certifications || []
      }

      setCertifications(updatedCertifications)

      sessionStorage.setItem(
        CERTIFICATIONS_CACHE_KEY,
        JSON.stringify(updatedCertifications)
      )

      toast.success(
        'Certification added successfully.'
      )

      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          'Could not add certification.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Loading
        label="Loading certifications…"
        fullPage
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="text-uppercase small fw-semibold text-primary mb-1">
            Achievements
          </div>

          <h1 className="h4 font-display mb-1">
            Certifications
          </h1>

          <p className="text-secondary mb-0">
            Showcase your professional and academic
            certifications to recruiters.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-aic-outline d-flex align-items-center gap-2"
            onClick={() => loadCertifications(true)}
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

          <button
            type="button"
            className="btn btn-aic-primary"
            onClick={() =>
              setShowForm((current) => !current)
            }
          >
            <i className="bi bi-plus-lg me-2" />

            Add certification
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <div className="aic-card p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 44,
                  height: 44,
                  background:
                    'rgba(13, 110, 253, 0.1)',
                }}
              >
                <i className="bi bi-award text-primary fs-5" />
              </div>

              <div>
                <div className="small text-secondary">
                  Certifications
                </div>

                <div className="fs-4 fw-bold">
                  {certifications.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add certification form */}
      {showForm && (
        <div className="aic-card p-4 mb-4">
          <div className="d-flex align-items-start gap-3 mb-4">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 42,
                height: 42,
                background:
                  'rgba(13, 110, 253, 0.1)',
              }}
            >
              <i className="bi bi-plus-circle text-primary fs-5" />
            </div>

            <div>
              <h2 className="h6 fw-semibold mb-1">
                Add certification
              </h2>

              <p className="text-secondary small mb-0">
                Add a certification that strengthens your
                professional profile.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label
                  htmlFor="certification-name"
                  className="form-label small fw-semibold"
                >
                  Certification name *
                </label>

                <input
                  id="certification-name"
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="certification-issuer"
                  className="form-label small fw-semibold"
                >
                  Issuing organization
                </label>

                <input
                  id="certification-issuer"
                  type="text"
                  name="issuer"
                  className="form-control"
                  placeholder="e.g. Amazon Web Services"
                  value={form.issuer}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="certification-date"
                  className="form-label small fw-semibold"
                >
                  Issue date
                </label>

                <input
                  id="certification-date"
                  type="date"
                  name="issue_date"
                  className="form-control"
                  value={form.issue_date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="certification-url"
                  className="form-label small fw-semibold"
                >
                  Credential URL
                </label>

                <input
                  id="certification-url"
                  type="url"
                  name="credential_url"
                  className="form-control"
                  placeholder="https://..."
                  value={form.credential_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-aic-primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving…'
                  : 'Save certification'}
              </button>

              <button
                type="button"
                className="btn btn-aic-outline"
                onClick={() => {
                  setShowForm(false)
                  setForm(EMPTY_FORM)
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certification list */}
      {certifications.length === 0 ? (
        <div className="aic-card p-4">
          <EmptyState
            icon="bi-award"
            title="No certifications yet"
            description="Add your certifications to showcase your achievements to recruiters."
          />
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h6 mb-1">
                Your certifications
              </h2>

              <p className="small text-secondary mb-0">
                Credentials you've added to your profile.
              </p>
            </div>

            <span className="aic-badge">
              {certifications.length}{' '}
              {certifications.length === 1
                ? 'credential'
                : 'credentials'}
            </span>
          </div>

          <div className="row g-3">
            {certifications.map((certification) => (
              <div
                className="col-md-6"
                key={certification.id}
              >
                <div className="aic-card p-4 h-100">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 46,
                        height: 46,
                        background:
                          'var(--aic-soft-green)',
                      }}
                    >
                      <i className="bi bi-award fs-5" />
                    </div>

                    <div className="flex-grow-1">
                      <h3 className="h6 fw-semibold mb-1">
                        {certification.name}
                      </h3>

                      {certification.issuer && (
                        <p className="text-secondary small mb-2">
                          <i className="bi bi-building me-1" />
                          {certification.issuer}
                        </p>
                      )}

                      {certification.issue_date && (
                        <p className="text-secondary small mb-2">
                          <i className="bi bi-calendar3 me-1" />
                          Issued{' '}
                          {new Date(
                            certification.issue_date
                          ).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}

                      {certification.credential_url && (
                        <a
                          href={
                            certification.credential_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-aic-outline btn-sm"
                        >
                          <i className="bi bi-box-arrow-up-right me-1" />
                          View credential
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}