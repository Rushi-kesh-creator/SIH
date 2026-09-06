import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications, getJobs } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OpportunityCard from '../../components/OpportunityCard.jsx'

export default function StudentJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    Promise.all([getJobs(), getApplications()])
      .then(([jobResponse, applicationResponse]) => {
        setJobs(jobResponse.data || [])
        setAppliedIds(new Set(applicationResponse.data.filter((item) => item.type === 'job').map((item) => item.opportunity_id)))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <Loading label="Loading jobs…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load jobs. Please refresh the page." /></div>

  return (
    <div>
      <h1 className="h4 font-display mb-1">Jobs</h1>
      <p className="text-secondary mb-4">Browse active jobs from industry partners.</p>
      {jobs.length === 0 ? <div className="aic-card"><EmptyState description="No active jobs are available right now." /></div> : (
        <div className="row g-3">
          {jobs.map((job) => (
            <div className="col-md-6 col-xl-4" key={job.id}>
              <OpportunityCard
                title={job.title}
                company={job.company?.name || 'Company'}
                location={job.location}
                type="Job"
                compensation={job.salary}
                applied={appliedIds.has(job.id)}
                onApply={() => navigate(`/student/opportunity/job/${job.id}`)}
                onViewDetails={() => navigate(`/student/opportunity/job/${job.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
