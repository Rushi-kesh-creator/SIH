import { useEffect, useState } from 'react'
import { getAcademicianDashboard } from '../../api/academicianApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import StatCard from '../../components/StatCard.jsx'

export default function AcademicianDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getAcademicianDashboard()
      .then(({ data }) => { setDashboard(data); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <Loading label="Loading academician dashboard…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load your academician dashboard. Please refresh the page." /></div>

  return (
    <div>
      <h1 className="h4 font-display mb-1">Welcome, {dashboard.academician.name}</h1>
      <p className="text-secondary mb-4">{dashboard.academician.email}</p>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><StatCard icon="bi-person-check" label="Profile completion" value={`${Math.round((dashboard.profile_completion.completed / dashboard.profile_completion.available) * 100)}%`} accent="indigo" /></div>
        <div className="col-md-4"><StatCard icon="bi-mortarboard" label="Role" value="Academician" accent="teal" /></div>
        <div className="col-md-4"><StatCard icon="bi-database" label="Academic records" value={Object.keys(dashboard.statistics).length} accent="amber" /></div>
      </div>
      <div className="aic-card p-4">
        <h2 className="h6 mb-2">Portal data availability</h2>
        <p className="text-secondary small mb-0">{dashboard.message}</p>
      </div>
    </div>
  )
}
