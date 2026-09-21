import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getCompanyProfile,
  updateCompanyProfile,
} from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const INDUSTRY_PROFILE_CACHE_KEY = 'industry_company_profile'

export default function IndustryCompanyProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        INDUSTRY_PROFILE_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        INDUSTRY_PROFILE_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadProfile = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!profile) {
        setLoading(true)
      }

      setError('')

      const { data } = await getCompanyProfile()

      setProfile(data)

      sessionStorage.setItem(
        INDUSTRY_PROFILE_CACHE_KEY,
        JSON.stringify(data)
      )
    } catch (err) {
      console.error('Company profile error:', err)

      setError(
        err?.response?.data?.detail ||
        'We couldn\'t load your company profile.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      INDUSTRY_PROFILE_CACHE_KEY
    )

    if (!hasCache) {
      loadProfile()
    }
  }, [])

  const handleSave = async (event) => {
    event.preventDefault()

    setSaving(true)

    try {
      const { data } = await updateCompanyProfile({
        website: profile.website,
        location: profile.location,
        description: profile.description,
      })

      setProfile(data)

      sessionStorage.setItem(
        INDUSTRY_PROFILE_CACHE_KEY,
        JSON.stringify(data)
      )

      setEditing(false)

      toast.success('Company profile updated.')
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        'Could not save company profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    setEditing(false)

    // Restore the last saved version from cache.
    try {
      const cached = sessionStorage.getItem(
        INDUSTRY_PROFILE_CACHE_KEY
      )

      if (cached) {
        setProfile(JSON.parse(cached))
      }
    } catch {
      // Keep current profile if cache cannot be read.
    }
  }

  if (loading) {
    return (
      <Loading
        label="Loading company profile…"
        fullPage
      />
    )
  }

  if (error && !profile) {
    return (
      <div className="aic-card p-4">

        <EmptyState
          variant="error"
          description={error}
        />

        <div className="text-center mt-3">

          <button
            className="btn btn-aic-primary"
            onClick={() => loadProfile()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>

        </div>

      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container-fluid py-2">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-building"></i>
          </div>

          <div>
            <h1 className="h4 font-display fw-bold mb-1">
              Company Profile
            </h1>

            <p className="text-secondary mb-0">
              Manage the company information used across your
              industry portal.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="btn btn-aic-outline"
          onClick={() => loadProfile({ force: true })}
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

      </div>

      {/* Refresh Error */}
      {error && profile && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="row g-4">

        {/* Main Profile */}
        <div className="col-lg-8">

          <form onSubmit={handleSave}>

            <div className="aic-card">

              {/* Card Header */}
              <div className="p-4 border-bottom">

                <div className="d-flex align-items-center gap-3">

                  <div className="aic-page-icon bg-primary-subtle text-primary">
                    <i className="bi bi-person-vcard"></i>
                  </div>

                  <div>
                    <h5 className="fw-bold mb-1">
                      Company Information
                    </h5>

                    <p className="text-muted small mb-0">
                      Update the information displayed across
                      your company profile.
                    </p>
                  </div>

                </div>

              </div>

              {/* Form */}
              <div className="p-4">

                {/* Company Name */}
                <div className="mb-4">

                  <label
                    className="form-label small fw-semibold"
                    htmlFor="company-name"
                  >
                    Company Name
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-building"></i>
                    </span>

                    <input
                      id="company-name"
                      className="form-control"
                      value={profile.name || ''}
                      disabled
                    />

                  </div>

                  <small className="text-muted">
                    Company name cannot be changed here.
                  </small>

                </div>

                {/* Email */}
                <div className="mb-4">

                  <label
                    className="form-label small fw-semibold"
                    htmlFor="company-email"
                  >
                    Email
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>

                    <input
                      id="company-email"
                      type="email"
                      className="form-control"
                      value={profile.email || ''}
                      disabled
                    />

                  </div>

                  <small className="text-muted">
                    Account email is managed by the authentication system.
                  </small>

                </div>

                {/* Website */}
                <div className="mb-4">

                  <label
                    className="form-label small fw-semibold"
                    htmlFor="company-website"
                  >
                    Website
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-globe"></i>
                    </span>

                    <input
                      id="company-website"
                      type="url"
                      className="form-control"
                      placeholder="https://example.com"
                      value={profile.website || ''}
                      disabled={!editing}
                      onChange={(event) =>
                        setProfile({
                          ...profile,
                          website: event.target.value,
                        })
                      }
                    />

                  </div>

                </div>

                {/* Location */}
                <div className="mb-4">

                  <label
                    className="form-label small fw-semibold"
                    htmlFor="company-location"
                  >
                    Location
                  </label>

                  <div className="input-group">

                    <span className="input-group-text bg-light">
                      <i className="bi bi-geo-alt"></i>
                    </span>

                    <input
                      id="company-location"
                      className="form-control"
                      placeholder="Company location"
                      value={profile.location || ''}
                      disabled={!editing}
                      onChange={(event) =>
                        setProfile({
                          ...profile,
                          location: event.target.value,
                        })
                      }
                    />

                  </div>

                </div>

                {/* Description */}
                <div className="mb-4">

                  <label
                    className="form-label small fw-semibold"
                    htmlFor="company-description"
                  >
                    Company Description
                  </label>

                  <textarea
                    id="company-description"
                    className="form-control"
                    rows={6}
                    placeholder="Tell students and academic partners about your company..."
                    value={profile.description || ''}
                    disabled={!editing}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        description: event.target.value,
                      })
                    }
                  />

                </div>

                {/* Actions */}
                {editing ? (

                  <div className="d-flex flex-wrap gap-2">

                    <button
                      type="submit"
                      className="btn btn-aic-primary"
                      disabled={saving}
                    >
                      <i
                        className={`bi ${
                          saving
                            ? 'bi-arrow-repeat'
                            : 'bi-check-lg'
                        } me-2`}
                      ></i>

                      {saving
                        ? 'Saving...'
                        : 'Save Changes'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-aic-outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Cancel
                    </button>

                  </div>

                ) : (

                  <button
                    type="button"
                    className="btn btn-aic-primary"
                    onClick={() => setEditing(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Edit Profile
                  </button>

                )}

              </div>

            </div>

          </form>

        </div>

        {/* Profile Summary */}
        <div className="col-lg-4">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <h5 className="fw-bold mb-1">
                Profile Overview
              </h5>

              <p className="text-muted small mb-0">
                Your current company information.
              </p>

            </div>

            <div className="p-4">

              <div className="text-center mb-4">

                <div
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: 72,
                    height: 72,
                    fontSize: '1.7rem',
                  }}
                >
                  <i className="bi bi-building"></i>
                </div>

                <h5 className="fw-bold mb-1">
                  {profile.name || 'Company'}
                </h5>

                <p className="text-muted small mb-0">
                  {profile.email || 'No email available'}
                </p>

              </div>

              <div className="border rounded-3 p-3 mb-3">

                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-geo-alt text-primary"></i>
                  <span className="small fw-semibold">
                    Location
                  </span>
                </div>

                <span className="text-muted small">
                  {profile.location || 'Not set'}
                </span>

              </div>

              <div className="border rounded-3 p-3">

                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-globe text-primary"></i>
                  <span className="small fw-semibold">
                    Website
                  </span>
                </div>

                {profile.website ? (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="small text-decoration-none"
                  >
                    Visit company website
                    <i className="bi bi-box-arrow-up-right ms-1"></i>
                  </a>
                ) : (
                  <span className="text-muted small">
                    Not set
                  </span>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}