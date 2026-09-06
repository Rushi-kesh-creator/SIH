import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApplications } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

function statusClass(status) {
  if (status?.toLowerCase() === 'accepted') return 'aic-badge-success'
  if (status?.toLowerCase() === 'rejected') return 'aic-badge-danger'
  return 'aic-badge-pending'
}

export default function StudentApplications() {
  const [applications, setApplications] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getApplications()
      .then(({ data }) => {
        setApplications(data || [])
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <Loading label="Loading your applications…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load your applications. Please refresh the page." /></div>

  return (
    <div>
      <h1 className="h4 font-display mb-1">My Applications</h1>
      <p className="text-secondary mb-4">Track the opportunities you have applied to.</p>
      {applications.length === 0 ? <div className="aic-card"><EmptyState description="Your applications will appear here after you apply." /></div> : (
        <div className="d-flex flex-column gap-3">
          {applications.map((application) => (
            <div className="aic-card p-4" key={application.id}>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div>
                  <span className="text-uppercase small fw-semibold text-secondary">{application.type}</span>
                  <h2 className="h6 mb-1 mt-1">{application.opportunity_title || 'Opportunity'}</h2>
                  <p className="text-secondary small mb-1">{application.company?.name || 'Company'}{application.location ? ` · ${application.location}` : ''}</p>
                  <p className="text-secondary small mb-0">Applied {new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-end">
                  <span className={`aic-badge ${statusClass(application.status)} text-capitalize`}>{application.status}</span>
                  {application.type === 'internship' ? (
                    <Link className="btn btn-aic-outline btn-sm d-block mt-2" to={`/student/opportunity/internship/${application.opportunity_id}`}>View opportunity</Link>
                  ) : (
                    <Link className="btn btn-aic-outline btn-sm d-block mt-2" to={`/student/opportunity/job/${application.opportunity_id}`}>View opportunity</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
