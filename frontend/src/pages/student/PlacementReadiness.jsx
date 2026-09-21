import { useEffect, useState } from 'react'
import { getStudentProfile } from '../../api/studentApi'

const PLACEMENT_CACHE_KEY =
  'student_placement_profile'

export default function StudentPlacementReadiness() {
  const [profile, setProfile] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        PLACEMENT_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        PLACEMENT_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadProfile = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response = await getStudentProfile()

      const data = response.data || {}

      setProfile(data)

      sessionStorage.setItem(
        PLACEMENT_CACHE_KEY,
        JSON.stringify(data)
      )
    } catch (err) {
      console.error(
        'Failed to load placement profile:',
        err
      )

      setError(
        err.response?.data?.detail ||
          'Unable to load placement readiness data.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const cached = sessionStorage.getItem(
      PLACEMENT_CACHE_KEY
    )

    if (!cached) {
      loadProfile(false)
    }
  }, [])

  const handleRefresh = () => {
    loadProfile(true)
  }

  if (loading) {
    return (
      <div className="container-fluid py-4">

        <div className="text-center py-5">

          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Loading placement readiness...
          </p>

        </div>

      </div>
    )
  }

  const safeProfile = profile || {}

  const cgpa = Number(safeProfile.cgpa || 0)

  const profileFields = [
    safeProfile.name,
    safeProfile.email,
    safeProfile.college,
    safeProfile.degree,
    safeProfile.branch,
    safeProfile.graduation_year,
    safeProfile.bio,
  ]

  const completedFields =
    profileFields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ''
    ).length

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) *
      100
  )

  const academicReadiness = Math.min(
    100,
    Math.round((cgpa / 10) * 100)
  )

  const profileItems = [
    {
      label: 'Name',
      completed: !!safeProfile.name,
    },
    {
      label: 'Email',
      completed: !!safeProfile.email,
    },
    {
      label: 'College',
      completed: !!safeProfile.college,
    },
    {
      label: 'Branch',
      completed: !!safeProfile.branch,
    },
    {
      label: 'Degree',
      completed: !!safeProfile.degree,
    },
    {
      label: 'Bio',
      completed: !!safeProfile.bio,
    },
  ]

  const preparationItems = [
    'Complete your student profile',
    'Upload an updated resume',
    'Build relevant technical skills',
    'Complete skill assessments',
    'Work on practical projects',
    'Apply for relevant internships and jobs',
  ]

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">

        <div>

          <div className="d-flex align-items-center gap-2 mb-1">

            <div className="aic-page-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>

            <h2 className="font-display fw-bold mb-0">
              Placement Readiness
            </h2>

          </div>

          <p className="text-muted mb-0">
            Track your academic profile and prepare
            for internship and placement opportunities.
          </p>

        </div>

        <button
          type="button"
          className="btn btn-aic-outline"
          onClick={handleRefresh}
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

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>

          {error}

          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">

          <div className="aic-card h-100">

            <div className="text-muted small">
              CGPA
            </div>

            <div className="fs-3 fw-bold">
              {cgpa
                ? cgpa.toFixed(2)
                : 'Not added'}
            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="aic-card h-100">

            <div className="text-muted small">
              Profile Completion
            </div>

            <div className="fs-3 fw-bold">
              {profileCompletion}%
            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="aic-card h-100">

            <div className="text-muted small">
              Graduation Year
            </div>

            <div className="fs-3 fw-bold">
              {safeProfile.graduation_year ||
                'Not added'}
            </div>

          </div>

        </div>

      </div>

      <div className="row g-4">

        {/* Academic Readiness */}
        <div className="col-12 col-lg-6">

          <div className="aic-card h-100">

            <h5 className="fw-bold mb-1">
              <i className="bi bi-mortarboard me-2"></i>
              Academic Readiness
            </h5>

            <p className="text-muted small">
              Your current academic profile.
            </p>

            <div className="mt-4">

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">
                  CGPA Readiness
                </span>

                <strong>
                  {academicReadiness}%
                </strong>
              </div>

              <div
                className="progress"
                style={{ height: '10px' }}
              >
                <div
                  className="progress-bar"
                  style={{
                    width: `${academicReadiness}%`,
                  }}
                />
              </div>

            </div>

            <div className="row g-3 mt-3">

              <div className="col-6">

                <div className="border rounded p-3">

                  <div className="text-muted small">
                    Degree
                  </div>

                  <div className="fw-semibold mt-1">
                    {safeProfile.degree ||
                      'Not added'}
                  </div>

                </div>

              </div>

              <div className="col-6">

                <div className="border rounded p-3">

                  <div className="text-muted small">
                    Branch
                  </div>

                  <div className="fw-semibold mt-1">
                    {safeProfile.branch ||
                      'Not added'}
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Profile Readiness */}
        <div className="col-12 col-lg-6">

          <div className="aic-card h-100">

            <h5 className="fw-bold mb-1">
              <i className="bi bi-person-check me-2"></i>
              Profile Readiness
            </h5>

            <p className="text-muted small">
              Complete these profile details before
              applying.
            </p>

            <div className="mt-3">

              {profileItems.map((item) => (

                <div
                  key={item.label}
                  className="d-flex align-items-center gap-3 py-2"
                >

                  <i
                    className={`bi ${
                      item.completed
                        ? 'bi-check-circle-fill text-success'
                        : 'bi-circle text-muted'
                    }`}
                  ></i>

                  <span
                    className={
                      item.completed
                        ? ''
                        : 'text-muted'
                    }
                  >
                    {item.label}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* Preparation */}
        <div className="col-12">

          <div className="aic-card">

            <h5 className="fw-bold mb-1">
              <i className="bi bi-list-check me-2"></i>
              Placement Preparation
            </h5>

            <p className="text-muted small mb-4">
              Recommended preparation activities.
            </p>

            <div className="row g-3">

              {preparationItems.map(
                (item, index) => (

                  <div
                    className="col-12 col-md-6"
                    key={item}
                  >

                    <div className="d-flex align-items-center gap-3 border rounded p-3 h-100">

                      <div className="aic-stat-icon flex-shrink-0">
                        {index + 1}
                      </div>

                      <span className="fw-semibold">
                        {item}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}