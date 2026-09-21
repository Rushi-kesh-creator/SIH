import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getAcademicianProfile,
  updateAcademicianProfile,
} from '../../api/academicianApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const CACHE_KEY = 'academician_profile'

export default function AcademicianProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(CACHE_KEY)
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

      const { data } = await getAcademicianProfile()

      setProfile(data)

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify(data)
      )
    } catch (requestError) {
      console.error('Academician profile error:', requestError)

      setError(
        requestError.response?.data?.detail ||
        "We couldn't load your profile."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY)

    if (!cached) {
      loadProfile()
    }
  }, [])

  const save = async (event) => {
    event.preventDefault()

    if (!profile.name?.trim()) {
      toast.error('Name is required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const { data } = await updateAcademicianProfile({
        name: profile.name.trim(),
      })

      setProfile(data)

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify(data)
      )

      setEditing(false)

      toast.success('Profile updated successfully.')
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.detail ||
        'Could not save your profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditing(false)

    // Reload cached/saved profile so unsaved changes disappear.
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)

      if (cached) {
        setProfile(JSON.parse(cached))
      }
    } catch {
      // Keep current profile if cache cannot be parsed.
    }
  }

  if (loading) {
    return (
      <Loading
        label="Loading academician profile…"
        fullPage
      />
    )
  }

  if (!profile) {
    return (
      <div className="aic-card p-4">
        <EmptyState
          variant="error"
          description={
            error ||
            "We couldn't load your profile."
          }
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

  const profilePercentage = profile.profile_completion
    ? Math.round(
        (profile.profile_completion /
          profile.profile_fields_available) *
          100
      )
    : 0

  return (
    <div>

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div>
          <span className="aic-badge aic-badge-success mb-2">
            <i className="bi bi-person-badge me-1"></i>
            Academician
          </span>

          <h1 className="h4 font-display fw-bold mb-1">
            Academician Profile
          </h1>

          <p className="text-secondary mb-0">
            Manage your academician account information.
          </p>
        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() => loadProfile({ force: true })}
          disabled={refreshing || editing}
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

      {error && (
        <div className="alert alert-warning small mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="row g-4">

        {/* Profile Card */}
        <div className="col-lg-8">

          <form
            className="aic-card p-4"
            onSubmit={save}
          >

            <div className="d-flex justify-content-between align-items-start mb-4">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                  style={{
                    width: 58,
                    height: 58,
                    fontSize: 24,
                  }}
                >
                  <i className="bi bi-person"></i>
                </div>

                <div>
                  <h2 className="h6 fw-bold mb-1">
                    Personal Information
                  </h2>

                  <p className="text-secondary small mb-0">
                    Basic details associated with your account.
                  </p>
                </div>

              </div>

              {!editing && (
                <button
                  type="button"
                  className="btn btn-aic-outline btn-sm"
                  onClick={() => setEditing(true)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit
                </button>
              )}

            </div>

            <div className="row g-3">

              {/* Name */}
              <div className="col-12">

                <label
                  className="form-label small fw-semibold"
                  htmlFor="academician-name"
                >
                  Full Name
                </label>

                <input
                  id="academician-name"
                  className="form-control"
                  value={profile.name || ''}
                  disabled={!editing}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter your name"
                />

              </div>

              {/* Email */}
              <div className="col-md-6">

                <label
                  className="form-label small fw-semibold"
                  htmlFor="academician-email"
                >
                  Email
                </label>

                <input
                  id="academician-email"
                  type="email"
                  className="form-control"
                  value={profile.email || ''}
                  disabled
                />

                <div className="form-text">
                  Email cannot be changed from the profile.
                </div>

              </div>

              {/* Role */}
              <div className="col-md-6">

                <label
                  className="form-label small fw-semibold"
                  htmlFor="academician-role"
                >
                  Account Role
                </label>

                <input
                  id="academician-role"
                  className="form-control text-capitalize"
                  value={profile.role || 'academician'}
                  disabled
                />

              </div>

            </div>

            {editing && (
              <div className="d-flex gap-2 mt-4">

                <button
                  type="submit"
                  className="btn btn-aic-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-aic-outline"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>
            )}

          </form>

        </div>

        {/* Profile Completion */}
        <div className="col-lg-4">

          <div className="aic-card p-4 h-100">

            <div className="d-flex align-items-center gap-3 mb-4">

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-person-check"></i>
              </div>

              <div>
                <h2 className="h6 fw-bold mb-1">
                  Profile Completion
                </h2>

                <p className="text-secondary small mb-0">
                  Account profile status
                </p>
              </div>

            </div>

            <div className="text-center mb-4">

              <div className="display-6 fw-bold">
                {profilePercentage}%
              </div>

              <div className="text-secondary small">
                Profile completed
              </div>

            </div>

            <div
              className="progress mb-3"
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

            <div className="small text-secondary">
              {profile.profile_completion || 0} of{' '}
              {profile.profile_fields_available || 0}{' '}
              available profile fields completed.
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}