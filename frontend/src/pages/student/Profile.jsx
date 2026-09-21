import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getStudentProfile,
  getStudentResumeUrl,
  updateStudentProfile,
  uploadStudentResume,
} from '../../api/studentApi'
import Loading from '../../components/Loading.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const FIELDS = [
  {
    key: 'name',
    label: 'Full Name',
    type: 'text',
    icon: 'bi-person',
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'email',
    icon: 'bi-envelope',
    readOnly: true,
  },
  {
    key: 'phone',
    label: 'Phone Number',
    type: 'tel',
    icon: 'bi-telephone',
  },
  {
    key: 'college',
    label: 'College',
    type: 'text',
    icon: 'bi-building',
  },
  {
    key: 'degree',
    label: 'Degree',
    type: 'text',
    icon: 'bi-mortarboard',
  },
  {
    key: 'branch',
    label: 'Branch',
    type: 'text',
    icon: 'bi-diagram-3',
  },
  {
    key: 'graduation_year',
    label: 'Graduation Year',
    type: 'number',
    icon: 'bi-calendar',
  },
  {
    key: 'cgpa',
    label: 'CGPA',
    type: 'number',
    step: '0.01',
    icon: 'bi-bar-chart',
  },
  {
    key: 'bio',
    label: 'About You',
    type: 'textarea',
    icon: 'bi-person-lines-fill',
  },
]

const PROFILE_CACHE_KEY = 'student_profile'

export default function StudentProfile() {
  const [form, setForm] = useState(() => {
    try {
      const cached =
        sessionStorage.getItem(PROFILE_CACHE_KEY)

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [status, setStatus] = useState(() => {
    try {
      const cached =
        sessionStorage.getItem(PROFILE_CACHE_KEY)

      return cached ? 'ready' : 'loading'
    } catch {
      return 'loading'
    }
  })

  const [saving, setSaving] = useState(false)

  const [resumeFile, setResumeFile] = useState(null)

  const [resumeViewUrl, setResumeViewUrl] =
    useState('')

  const [uploadingResume, setUploadingResume] =
    useState(false)

  const [resumeMessage, setResumeMessage] =
    useState({
      type: '',
      text: '',
    })

  /*
   * Load profile only when no cached profile exists.
   */
  useEffect(() => {
    if (form) {
      loadResumeUrl(form)
      return
    }

    let mounted = true

    const loadProfile = async () => {
      try {
        const { data } =
          await getStudentProfile()

        if (!mounted) return

        const profile = data || {}

        setForm(profile)
        setStatus('ready')

        sessionStorage.setItem(
          PROFILE_CACHE_KEY,
          JSON.stringify(profile)
        )

        if (profile.resume_url) {
          try {
            const { data: resumeData } =
              await getStudentResumeUrl()

            if (mounted) {
              setResumeViewUrl(
                resumeData?.signed_url || ''
              )
            }
          } catch {
            if (mounted) {
              setResumeViewUrl('')
            }
          }
        }
      } catch (err) {
        console.error(
          'Failed to load profile:',
          err
        )

        if (mounted) {
          setStatus('error')
        }
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  /*
   * Load signed resume URL for cached profile.
   */
  const loadResumeUrl = async (profile) => {
    if (!profile?.resume_url || resumeViewUrl) {
      return
    }

    try {
      const { data } =
        await getStudentResumeUrl()

      setResumeViewUrl(
        data?.signed_url || ''
      )
    } catch {
      setResumeViewUrl('')
    }
  }

  const handleChange = (key, value) => {
    setForm((current) => ({
      ...(current || {}),
      [key]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form) return

    setSaving(true)

    try {
      const response =
        await updateStudentProfile(form)

      const updatedProfile =
        response?.data || form

      setForm(updatedProfile)

      sessionStorage.setItem(
        PROFILE_CACHE_KEY,
        JSON.stringify(updatedProfile)
      )

      toast.success('Profile updated successfully.')
    } catch (err) {
      console.error(
        'Failed to update profile:',
        err
      )

      if (err.isNetworkError) {
        toast.error(
          'Cannot reach the server.'
        )
      } else {
        toast.error(
          err.response?.data?.detail ||
            'Could not save your profile.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setResumeFile(file)

    setResumeMessage({
      type: '',
      text: '',
    })

    /*
     * PDF validation
     */
    if (
      file.type !== 'application/pdf' ||
      !file.name
        .toLowerCase()
        .endsWith('.pdf')
    ) {
      setResumeMessage({
        type: 'error',
        text: 'Please choose a PDF resume.',
      })

      return
    }

    /*
     * 5 MB limit
     */
    if (file.size > 5 * 1024 * 1024) {
      setResumeMessage({
        type: 'error',
        text: 'Resume must be 5 MB or smaller.',
      })

      return
    }

    setUploadingResume(true)

    try {
      const { data } =
        await uploadStudentResume(file)

      setForm((current) => {
        const updatedProfile = {
          ...(current || {}),
          resume_url: data.resume_url,
        }

        sessionStorage.setItem(
          PROFILE_CACHE_KEY,
          JSON.stringify(updatedProfile)
        )

        return updatedProfile
      })

      setResumeViewUrl(
        data?.signed_url || ''
      )

      /*
       * If upload response doesn't contain
       * signed URL, request it separately.
       */
      if (!data?.signed_url) {
        try {
          const { data: resumeData } =
            await getStudentResumeUrl()

          setResumeViewUrl(
            resumeData?.signed_url || ''
          )
        } catch {
          setResumeViewUrl('')
        }
      }

      setResumeMessage({
        type: 'success',
        text: 'Resume uploaded successfully.',
      })

      toast.success(
        'Resume uploaded successfully.'
      )
    } catch (err) {
      console.error(
        'Resume upload failed:',
        err
      )

      setResumeMessage({
        type: 'error',
        text:
          err.response?.data?.detail ||
          'Could not upload your resume.',
      })
    } finally {
      setUploadingResume(false)
    }
  }

  const currentResumeName =
    resumeFile?.name ||
    form?.resume_url
      ?.split('/')
      .pop()
      ?.replace(
        /^[a-f0-9]{32}_/,
        ''
      )

  /*
   * Profile completion
   */
  const completionFields = [
    form?.name,
    form?.phone,
    form?.college,
    form?.degree,
    form?.branch,
    form?.graduation_year,
    form?.cgpa,
    form?.bio,
  ]

  const completedFields =
    completionFields.filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ''
    ).length

  const profileCompletion = Math.round(
    (completedFields /
      completionFields.length) *
      100
  )

  if (status === 'loading') {
    return (
      <Loading
        label="Loading your profile…"
        fullPage
      />
    )
  }

  if (status === 'error') {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card">
          <EmptyState
            variant="error"
            description="We couldn't load your profile. Please refresh the page."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER ================= */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">

        <div>

          <div className="d-flex align-items-center gap-2 mb-1">

            <div className="aic-page-icon">
              <i className="bi bi-person-fill"></i>
            </div>

            <h2 className="font-display fw-bold mb-0">
              My Profile
            </h2>

          </div>

          <p className="text-muted mb-0">
            Manage your personal, academic and
            professional information.
          </p>

        </div>

        {/* Completion */}
        <div className="aic-card py-2 px-3">

          <div className="d-flex align-items-center gap-3">

            <div>
              <div className="text-muted small">
                Profile Completion
              </div>

              <div className="fw-bold">
                {profileCompletion}%
              </div>
            </div>

            <div
              className="progress"
              style={{
                width: '100px',
                height: '8px',
              }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${profileCompletion}%`,
                }}
              />
            </div>

          </div>

        </div>

      </div>

      <div className="row g-4">

        {/* ================= PROFILE FORM ================= */}
        <div className="col-12 col-xl-8">

          <form
            onSubmit={handleSubmit}
            className="aic-card"
          >

            <div className="mb-4">

              <h5 className="fw-bold mb-1">
                <i className="bi bi-person-vcard me-2"></i>
                Personal & Academic Details
              </h5>

              <p className="text-muted small mb-0">
                Keep your profile information
                accurate and up to date.
              </p>

            </div>

            <div className="row g-3">

              {FIELDS.map((field) => (

                <div
                  className={
                    field.type === 'textarea'
                      ? 'col-12'
                      : 'col-12 col-md-6'
                  }
                  key={field.key}
                >

                  <label
                    htmlFor={field.key}
                    className="form-label small fw-semibold"
                  >
                    <i
                      className={`bi ${field.icon} me-1`}
                    ></i>

                    {field.label}

                    {field.readOnly && (
                      <span className="text-muted ms-1">
                        (read-only)
                      </span>
                    )}
                  </label>

                  {field.type === 'textarea' ? (

                    <textarea
                      id={field.key}
                      className="form-control"
                      rows={4}
                      placeholder="Tell recruiters about yourself..."
                      value={
                        form?.[field.key] || ''
                      }
                      onChange={(event) =>
                        handleChange(
                          field.key,
                          event.target.value
                        )
                      }
                    />

                  ) : (

                    <input
                      id={field.key}
                      type={field.type}
                      step={field.step}
                      className="form-control"
                      value={
                        form?.[field.key] ?? ''
                      }
                      readOnly={field.readOnly}
                      disabled={field.readOnly}
                      placeholder={
                        field.key === 'phone'
                          ? 'Enter phone number'
                          : field.key === 'college'
                            ? 'Enter college name'
                            : field.key === 'degree'
                              ? 'e.g. B.Tech'
                              : field.key === 'branch'
                                ? 'e.g. CSE - AI & ML'
                                : ''
                      }
                      onChange={(event) =>
                        handleChange(
                          field.key,
                          event.target.value
                        )
                      }
                    />

                  )}

                </div>

              ))}

            </div>

            {/* Save */}
            <div className="border-top mt-4 pt-4 d-flex justify-content-end">

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
                    <i className="bi bi-check2-circle me-2"></i>
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

        {/* ================= PROFILE SUMMARY ================= */}
        <div className="col-12 col-xl-4">

          <div className="aic-card mb-4">

            <h5 className="fw-bold mb-1">
              <i className="bi bi-person-badge me-2"></i>
              Profile Summary
            </h5>

            <p className="text-muted small mb-4">
              Information recruiters can use to
              understand your profile.
            </p>

            <div className="text-center mb-4">

              <div
                className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center"
                style={{
                  width: '80px',
                  height: '80px',
                  fontSize: '32px',
                }}
              >
                <i className="bi bi-person"></i>
              </div>

              <h5 className="fw-bold mt-3 mb-1">
                {form?.name ||
                  'Your Name'}
              </h5>

              <p className="text-muted small mb-0">
                {form?.branch ||
                  'Branch not added'}
              </p>

            </div>

            <div className="border-top pt-3">

              <div className="d-flex justify-content-between py-2">

                <span className="text-muted small">
                  College
                </span>

                <span className="fw-semibold small text-end">
                  {form?.college ||
                    'Not added'}
                </span>

              </div>

              <div className="d-flex justify-content-between py-2">

                <span className="text-muted small">
                  Degree
                </span>

                <span className="fw-semibold small">
                  {form?.degree ||
                    'Not added'}
                </span>

              </div>

              <div className="d-flex justify-content-between py-2">

                <span className="text-muted small">
                  CGPA
                </span>

                <span className="fw-semibold small">
                  {form?.cgpa ??
                    'Not added'}
                </span>

              </div>

              <div className="d-flex justify-content-between py-2">

                <span className="text-muted small">
                  Graduation
                </span>

                <span className="fw-semibold small">
                  {form?.graduation_year ||
                    'Not added'}
                </span>

              </div>

            </div>

          </div>

          {/* ================= RESUME ================= */}
          <div className="aic-card">

            <div className="d-flex align-items-center gap-3 mb-1">

              <div className="aic-stat-icon">
                <i className="bi bi-file-earmark-pdf"></i>
              </div>

              <div>

                <h5 className="fw-bold mb-0">
                  Resume
                </h5>

                <p className="text-muted small mb-0">
                  AI matching document
                </p>

              </div>

            </div>

            <p className="text-muted small mt-3">
              Upload your latest PDF resume to
              improve AI-powered opportunity matching.
            </p>

            <input
              id="resume-upload"
              type="file"
              accept="application/pdf,.pdf"
              className="form-control"
              onChange={handleResumeUpload}
              disabled={uploadingResume}
            />

            {resumeFile && (
              <div className="small mt-2">
                <i className="bi bi-file-earmark-pdf me-1"></i>

                Selected:{' '}
                <strong>
                  {resumeFile.name}
                </strong>
              </div>
            )}

            {uploadingResume && (
              <div className="mt-3">

                <div className="d-flex align-items-center gap-2">

                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></div>

                  <span className="small text-muted">
                    Uploading resume...
                  </span>

                </div>

              </div>
            )}

            {resumeMessage.text && (
              <div
                className={`small mt-3 ${
                  resumeMessage.type === 'error'
                    ? 'text-danger'
                    : 'text-success'
                }`}
                role="status"
              >
                <i
                  className={`bi ${
                    resumeMessage.type === 'error'
                      ? 'bi-exclamation-circle'
                      : 'bi-check-circle'
                  } me-1`}
                ></i>

                {resumeMessage.text}
              </div>
            )}

            {currentResumeName && (
              <div className="border rounded p-3 mt-3">

                <div className="d-flex align-items-center gap-2">

                  <i className="bi bi-file-earmark-pdf text-danger fs-4"></i>

                  <div className="flex-grow-1 overflow-hidden">

                    <div className="small text-muted">
                      Current Resume
                    </div>

                    <div
                      className="fw-semibold small text-truncate"
                      title={currentResumeName}
                    >
                      {currentResumeName}
                    </div>

                  </div>

                </div>

                {resumeViewUrl && (
                  <a
                    className="btn btn-aic-outline btn-sm w-100 mt-3"
                    href={resumeViewUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="bi bi-eye me-2"></i>
                    View Resume
                  </a>
                )}

              </div>
            )}

            <div className="small text-muted mt-3">
              <i className="bi bi-info-circle me-1"></i>
              PDF only · Maximum 5 MB
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}