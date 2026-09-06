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
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email', readOnly: true },
  { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'college', label: 'College', type: 'text' },
  { key: 'degree', label: 'Degree', type: 'text' },
  { key: 'branch', label: 'Branch', type: 'text' },
  { key: 'graduation_year', label: 'Graduation year', type: 'number' },
  { key: 'cgpa', label: 'CGPA', type: 'number', step: '0.01' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
]

export default function StudentProfile() {
  const [form, setForm] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [saving, setSaving] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeViewUrl, setResumeViewUrl] = useState('')
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeMessage, setResumeMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    getStudentProfile()
      .then(({ data }) => {
        setForm(data || {})
        setStatus('ready')
        if (data?.resume_url) {
          getStudentResumeUrl()
            .then(({ data: resumeData }) => setResumeViewUrl(resumeData.signed_url))
            .catch(() => setResumeViewUrl(''))
        }
      })
      .catch(() => setStatus('error'))
  }, [])

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateStudentProfile(form)
      toast.success('Profile updated.')
    } catch (err) {
      if (err.isNetworkError) toast.error('Cannot reach the server.')
      else toast.error(err.response?.data?.detail || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeFile(file)
    setResumeMessage({ type: '', text: '' })
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeMessage({ type: 'error', text: 'Please choose a PDF resume.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeMessage({ type: 'error', text: 'Resume must be 5 MB or smaller.' })
      return
    }

    setUploadingResume(true)
    try {
      const { data } = await uploadStudentResume(file)
      setForm((current) => ({ ...current, resume_url: data.resume_url }))
      setResumeViewUrl(data.signed_url || '')
      if (!data.signed_url) {
        getStudentResumeUrl()
          .then(({ data: resumeData }) => setResumeViewUrl(resumeData.signed_url))
          .catch(() => setResumeViewUrl(''))
      }
      setResumeMessage({ type: 'success', text: 'Resume uploaded successfully.' })
      toast.success('Resume uploaded.')
    } catch (err) {
      setResumeMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Could not upload your resume.',
      })
    } finally {
      setUploadingResume(false)
    }
  }

  const currentResumeName =resumeFile?.name || form?.resume_url?.split('/').pop()?.replace(/^[a-f0-9]{32}_/, '')
  if (status === 'loading') return <Loading label="Loading your profile…" fullPage />
  if (status === 'error') {
    return (
      <div className="aic-card">
        <EmptyState variant="error" description="We couldn't load your profile. Please refresh the page." />
      </div>
    )
  }

  return (
    <div>
      <h1 className="h4 font-display mb-1">My profile</h1>
      <p className="text-secondary mb-4">This information is visible to industry recruiters reviewing your applications.</p>

      <form onSubmit={handleSubmit} className="aic-card p-4" style={{ maxWidth: 640 }}>
        <div className="row g-3">
          {FIELDS.map((field) => (
            <div className={field.type === 'textarea' ? 'col-12' : 'col-md-6'} key={field.key}>
              <label htmlFor={field.key} className="form-label small fw-semibold">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.key}
                  className="form-control"
                  rows={3}
                  value={form[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  id={field.key}
                  type={field.type}
                  step={field.step}
                  className="form-control"
                  value={form[field.key] ?? ''}
                  readOnly={field.readOnly}
                  disabled={field.readOnly}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="border-top mt-4 pt-4">
          <h2 className="h6 mb-1">Resume</h2>
          <p className="text-secondary small mb-3">Upload your latest PDF resume for AI-powered opportunity matching.</p>
          <input
            id="resume-upload"
            type="file"
            accept="application/pdf,.pdf"
            className="form-control mb-2"
            onChange={handleResumeUpload}
            disabled={uploadingResume}
          />
          {resumeFile && <p className="small mb-2">Selected: {resumeFile.name}</p>}
          {uploadingResume && <Loading label="Uploading resume…" />}
          {resumeMessage.text && (
            <p className={`small ${resumeMessage.type === 'error' ? 'text-danger' : 'text-success'}`} role="status">
              {resumeMessage.text}
            </p>
          )}
          {currentResumeName && (
            <div className="d-flex flex-wrap align-items-center gap-2 small">
              <span>Current resume: <strong>{currentResumeName}</strong></span>
              {resumeViewUrl && (
                <a className="btn btn-aic-outline btn-sm" href={resumeViewUrl} target="_blank" rel="noreferrer">
                  View resume
                </a>
              )}
            </div>
          )}
          <p className="text-secondary small mb-0 mt-3">Your resume is used to improve AI-powered opportunity matching.</p>
        </div>

        <button type="submit" className="btn btn-aic-primary mt-4" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
