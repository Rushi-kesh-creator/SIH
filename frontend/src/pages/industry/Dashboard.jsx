import { useEffect, useState } from 'react'
import { getCompanyDashboard } from '../../api/companyApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'
import StatCard from '../../components/StatCard.jsx'

export default function IndustryDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getCompanyDashboard()
      .then(({ data }) => {
        setDashboard(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') return <Loading label="Loading company dashboard…" fullPage />
  if (status === 'error') return <div className="aic-card"><EmptyState variant="error" description="We couldn't load your company dashboard. Please refresh the page." /></div>

  const stats = dashboard.statistics
  return (
    <div>
      <h1 className="h4 font-display mb-1">Welcome, {dashboard.company.name}</h1>
      <p className="text-secondary mb-4">Your industry collaboration overview.</p>
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="bi-briefcase" label="Total Internships" value={stats.total_internships} accent="indigo" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-check-circle" label="Active Internships" value={stats.active_internships} accent="teal" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-suitcase-lg" label="Total Jobs" value={stats.total_jobs} accent="amber" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-send-check" label="Total Applications" value={stats.total_applications} accent="green" /></div>
      </div>
      <div className="row g-3">
        <div className="col-md-4"><StatCard icon="bi-lightning-charge" label="Active Jobs" value={stats.active_jobs} accent="teal" /></div>
        <div className="col-md-4"><StatCard icon="bi-hourglass-split" label="Pending Applications" value={stats.pending_applications} accent="amber" /></div>
        <div className="col-md-4"><StatCard icon="bi-building" label="Location" value={dashboard.company.location || 'Not set'} accent="indigo" /></div>
      </div>
    </div>
  )
}
