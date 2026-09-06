import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications, getInternships } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OpportunityCard from '../../components/OpportunityCard.jsx'

export default function StudentInternships() {
  const navigate = useNavigate()
  const [internships, setInternships] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    Promise.all([getInternships(), getApplications()])
      .then(([internshipResponse, applicationResponse]) => {
        setInternships(internshipResponse.data || [])
        setAppliedIds(new Set(applicationResponse.data.filter((item) => item.type === 'internship').map((item) => item.opportunity_id)))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <Loading label="Loading internships…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load internships. Please refresh the page." /></div>

  return (
    <div>
      <h1 className="h4 font-display mb-1">Internships</h1>
      <p className="text-secondary mb-4">Explore active internship opportunities and apply to the ones that fit your goals.</p>
      {internships.length === 0 ? <div className="aic-card"><EmptyState description="No active internships are available right now." /></div> : (
        <div className="row g-3">
          {internships.map((internship) => (
            <div className="col-md-6 col-xl-4" key={internship.id}>
              <OpportunityCard
                title={internship.title}
                company={internship.company?.name || 'Company'}
                location={internship.location}
                type="Internship"
                duration={internship.duration}
                compensation={internship.stipend}
                applied={appliedIds.has(internship.id)}
                onApply={() => navigate(`/student/opportunity/internship/${internship.id}`)}
                onViewDetails={() => navigate(`/student/opportunity/internship/${internship.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
