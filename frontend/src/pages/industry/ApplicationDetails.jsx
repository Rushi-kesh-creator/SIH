import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCompanyApplication, updateCompanyApplicationStatus } from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

export default function IndustryApplicationDetails() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = () => getCompanyApplication(applicationId).then(({ data }) => { setApplication(data); setStatus('ready') }).catch((requestError) => { setError(requestError.response?.data?.detail || 'Could not load this application.'); setStatus('error') })
  useEffect(() => { load() }, [applicationId])

  const updateStatus = async (nextStatus) => {
    setUpdating(true)
    setError('')
    try { await updateCompanyApplicationStatus(applicationId, nextStatus); await load() } catch (requestError) { setError(requestError.response?.data?.detail || 'Could not update application status.') } finally { setUpdating(false) }
  }

  if (status === 'loading') return <Loading label="Loading application…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description={error} /></div>

  return <div><button type="button" className="btn btn-aic-outline btn-sm mb-3" onClick={() => navigate(-1)}>Back</button>{error && <div className="alert alert-danger small">{error}</div>}<div className="aic-card p-4 mb-3"><div className="d-flex flex-wrap justify-content-between gap-3"><div><span className="text-uppercase small text-secondary">{application.opportunity_type}</span><h1 className="h4 font-display mt-1 mb-2">{application.student_name}</h1><p className="text-secondary mb-0">Applied for {application.opportunity_title}</p></div><div className="text-end"><span className={`aic-badge ${application.application_status === 'accepted' ? 'aic-badge-success' : application.application_status === 'rejected' ? 'aic-badge-danger' : 'aic-badge-pending'} text-capitalize`}>{application.application_status}</span>{application.application_status === 'pending' && <div className="d-flex gap-2 mt-2"><button className="btn btn-aic-primary btn-sm" disabled={updating} onClick={() => updateStatus('accepted')}>Accept Application</button><button className="btn btn-aic-outline btn-sm" disabled={updating} onClick={() => updateStatus('rejected')}>Reject Application</button></div>}</div></div></div><div className="row g-3"><div className="col-lg-6"><div className="aic-card p-4 h-100"><h2 className="h6 mb-3">Student Information</h2><dl className="small mb-0"><dt className="text-secondary fw-normal">Email</dt><dd>{application.student_email}</dd><dt className="text-secondary fw-normal">Phone</dt><dd>{application.student_phone || 'Not provided'}</dd><dt className="text-secondary fw-normal">College</dt><dd>{application.student_college || 'Not provided'}</dd><dt className="text-secondary fw-normal">Degree</dt><dd>{application.student_degree || 'Not provided'}</dd><dt className="text-secondary fw-normal">Branch</dt><dd>{application.student_branch || 'Not provided'}</dd><dt className="text-secondary fw-normal">Graduation year</dt><dd>{application.student_graduation_year || 'Not provided'}</dd><dt className="text-secondary fw-normal">CGPA</dt><dd>{application.student_cgpa ?? 'Not provided'}</dd><dt className="text-secondary fw-normal">Bio</dt><dd>{application.student_bio || 'Not provided'}</dd></dl>{application.resume_signed_url && <a className="btn btn-aic-outline btn-sm" href={application.resume_signed_url} target="_blank" rel="noreferrer">View Resume</a>}</div></div><div className="col-lg-6"><div className="aic-card p-4 h-100"><h2 className="h6 mb-3">Opportunity</h2><h3 className="h6">{application.opportunity.title}</h3><p className="text-secondary small">{application.opportunity.type} · {application.opportunity.location || 'Location not provided'}</p><p className="small"><strong>Skills:</strong> {application.opportunity.skills || 'Not specified'}</p><p className="text-secondary small" style={{ whiteSpace: 'pre-line' }}>{application.opportunity.description || 'No description provided.'}</p><p className="text-secondary small mb-0">Applied {new Date(application.applied_at).toLocaleDateString()}</p></div></div></div><Link className="btn btn-aic-outline btn-sm mt-3" to="/company/applications">Back to Applications</Link></div>
}