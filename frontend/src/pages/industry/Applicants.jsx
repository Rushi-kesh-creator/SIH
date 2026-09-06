import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCompanyApplications, updateCompanyApplicationStatus } from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

function statusClass(status) {
  if (status === 'accepted') return 'aic-badge-success'
  if (status === 'rejected') return 'aic-badge-danger'
  return 'aic-badge-pending'
}

export default function IndustryApplicants() {
  const [applications, setApplications] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = () => getCompanyApplications().then(({ data }) => { setApplications(data || []); setStatus('ready') }).catch(() => setStatus('error'))
  useEffect(() => { load() }, [])

  const updateStatus = async (id, nextStatus) => {
    setUpdating(id)
    setError('')
    try { await updateCompanyApplicationStatus(id, nextStatus); await load() } catch (requestError) { setError(requestError.response?.data?.detail || 'Could not update application status.') } finally { setUpdating(null) }
  }

  if (status === 'loading') return <Loading label="Loading applications…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load applicant applications. Please refresh the page." /></div>

  return (
    <div>
      <h1 className="h4 font-display mb-1">Applications</h1>
      <p className="text-secondary mb-4">Review applications submitted to your company opportunities.</p>
      {error && <div className="alert alert-danger small">{error}</div>}
      {applications.length === 0 ? <div className="aic-card"><EmptyState description="No applications received yet." /></div> : <div className="d-flex flex-column gap-3">{applications.map((application) => <div className="aic-card p-4" key={application.application_id}><div className="d-flex flex-wrap justify-content-between gap-3"><div><span className="text-uppercase small text-secondary">{application.opportunity_type}</span><h2 className="h6 mt-1 mb-1">{application.student_name}</h2><p className="mb-1">{application.opportunity_title}</p><p className="text-secondary small mb-1">{application.student_college || 'College not provided'} · {application.student_branch || 'Branch not provided'} · CGPA {application.student_cgpa ?? 'Not provided'}</p><p className="text-secondary small mb-0">Applied {new Date(application.applied_at).toLocaleDateString()}</p></div><div className="text-end"><span className={`aic-badge ${statusClass(application.application_status)} text-capitalize`}>{application.application_status}</span><div className="d-flex gap-2 mt-2"><Link className="btn btn-aic-outline btn-sm" to={`/company/applications/${application.application_id}`}>View Application</Link>{application.application_status === 'pending' && <><button className="btn btn-aic-primary btn-sm" disabled={updating === application.application_id} onClick={() => updateStatus(application.application_id, 'accepted')}>Accept</button><button className="btn btn-aic-outline btn-sm" disabled={updating === application.application_id} onClick={() => updateStatus(application.application_id, 'rejected')}>Reject</button></>}</div></div></div></div>)}</div>}
    </div>
  )
}