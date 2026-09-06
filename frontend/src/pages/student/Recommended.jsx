import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications, getRecommendedOpportunities } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import OpportunityCard from '../../components/OpportunityCard.jsx'

export default function StudentRecommended() {
  const navigate = useNavigate()
  const [opportunities, setOpportunities] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    Promise.all([getRecommendedOpportunities(), getApplications()])
      .then(([recommendationResponse, applicationResponse]) => {
        setOpportunities(recommendationResponse.data?.opportunities || [])
        setAppliedIds(new Set(applicationResponse.data.map((item) => `${item.type}:${item.opportunity_id}`)))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <Loading label="Ranking opportunities…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load recommendations. Please refresh the page." /></div>

  return (
    <div>
      <h1 className="h4 font-display mb-1">Recommended Opportunities</h1>
      <p className="text-secondary mb-4">Active opportunities ranked using your available profile and resume information.</p>
      {opportunities.length === 0 ? <div className="aic-card"><EmptyState description="No recommendations are available yet." /></div> : (
        <div className="row g-3">
          {opportunities.map((opportunity) => (
            <div className="col-md-6 col-xl-4" key={`${opportunity.type}-${opportunity.id}`}>
              <OpportunityCard
                title={opportunity.title}
                company={opportunity.company?.name || 'Company'}
                location={opportunity.location}
                type={opportunity.type}
                duration={opportunity.duration}
                compensation={opportunity.type === 'internship' ? opportunity.stipend : opportunity.salary}
                matchScore={opportunity.overall_score}
                applied={appliedIds.has(`${opportunity.type}:${opportunity.id}`)}
                onApply={() => navigate(`/student/opportunity/${opportunity.type}/${opportunity.id}`, { state: { opportunity } })}
                onViewDetails={() => navigate(`/student/opportunity/${opportunity.type}/${opportunity.id}`, { state: { opportunity } })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
