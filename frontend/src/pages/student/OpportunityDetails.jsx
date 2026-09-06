import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  createApplication,
  getApplications,
  getInternship,
  getJob,
} from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

function scorePercent(value) {
  return `${Math.round(value * 1000) / 10}%`
}

export default function OpportunityDetails() {
  const { type, id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const recommendation = location.state?.opportunity
  const [opportunity, setOpportunity] = useState(null)
  const [application, setApplication] = useState(null)
  const [status, setStatus] = useState('loading')
  const [submitting, setSubmitting] = useState(false)
  const [submittedNow, setSubmittedNow] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const getDetails = type === 'internship' ? getInternship(id) : getJob(id)
    Promise.all([getDetails, getApplications()])
      .then(([detailsResponse, applicationsResponse]) => {
        setOpportunity(detailsResponse.data)
        setApplication(applicationsResponse.data.find((item) => item.type === type && String(item.opportunity_id) === String(id)) || null)
        setStatus('ready')
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.detail || 'We could not load this opportunity.')
        setStatus('error')
      })
  }, [id, type])

  const handleApply = async () => {
    if (application) return
    setSubmitting(true)
    setError('')
    try {
      const payload = type === 'internship' ? { internship_id: Number(id) } : { job_id: Number(id) }
      const { data } = await createApplication(payload)
      setApplication({
        ...data.application,
        type,
        opportunity_id: Number(id),
      })
      setSubmittedNow(true)
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setApplication({ type, opportunity_id: Number(id), status: 'pending' })
      } else {
        setError(requestError.response?.data?.detail || 'Could not submit your application.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return <Loading label="Loading opportunity…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description={error} /></div>

  return (
    <div>
      <button type="button" onClick={() => navigate(-1)} className="btn btn-aic-outline btn-sm mb-3">Back</button>
      <div className="aic-card p-4 mb-3">
        <div className="d-flex flex-wrap justify-content-between gap-3">
          <div>
            <span className="text-uppercase small fw-semibold" style={{ color: 'var(--aic-indigo)' }}>{type}</span>
            <h1 className="h4 font-display mt-1 mb-2">{opportunity.title}</h1>
            <p className="text-secondary mb-2">{opportunity.company?.name || 'Company'}</p>
            {opportunity.location && <p className="text-secondary small mb-0"><i className="bi bi-geo-alt me-1" />{opportunity.location}</p>}
          </div>
          <div className="text-end">
            {recommendation && <span className="aic-badge aic-badge-ai d-block mb-2">{recommendation.overall_score}% AI match</span>}
            <button className="btn btn-aic-primary" onClick={handleApply} disabled={Boolean(application) || submitting}>
              {submitting ? 'Submitting…' : application ? (submittedNow ? 'Application Submitted' : 'Already Applied') : 'Apply Now'}
            </button>
            {application && <p className="small text-secondary mt-2 mb-0 text-capitalize">Status: {application.status}</p>}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="aic-card p-4 mb-3">
            <h2 className="h6 mb-3">Description</h2>
            <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>{opportunity.description || 'No description provided.'}</p>
          </div>
          <div className="aic-card p-4">
            <h2 className="h6 mb-3">Required skills</h2>
            <p className="text-secondary mb-0">{opportunity.skills || 'No specific skills listed.'}</p>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="aic-card p-4 mb-3">
            <h2 className="h6 mb-3">Opportunity information</h2>
            <dl className="small mb-0">
              {type === 'internship' && <><dt className="text-secondary fw-normal">Duration</dt><dd>{opportunity.duration || 'Not specified'}</dd><dt className="text-secondary fw-normal">Stipend</dt><dd>{opportunity.stipend || 'Not specified'}</dd></>}
              {type === 'job' && <><dt className="text-secondary fw-normal">Salary</dt><dd>{opportunity.salary || 'Not specified'}</dd></>}
              <dt className="text-secondary fw-normal">Created</dt><dd>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'Not specified'}</dd>
            </dl>
          </div>
          {recommendation && (
            <div className="aic-card p-4">
              <h2 className="h6 mb-3">AI match details</h2>
              <p className="small mb-1">Semantic similarity: <strong>{scorePercent(recommendation.semantic_similarity)}</strong></p>
              <p className="small mb-3">Skill coverage: <strong>{scorePercent(recommendation.skill_coverage)}</strong></p>
              <p className="small fw-semibold mb-1">Matching skills</p>
              <p className="text-secondary small mb-2">{recommendation.matching_skills?.join(', ') || 'None identified'}</p>
              <p className="small fw-semibold mb-1">Missing skills</p>
              <p className="text-secondary small mb-0">{recommendation.missing_skills?.join(', ') || 'None identified'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}