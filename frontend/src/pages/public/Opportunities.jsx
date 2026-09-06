import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState.jsx'

export default function Opportunities() {
  return (
    <div className="container py-5">
      <h1 className="font-display mb-2">Explore opportunities</h1>
      <p className="text-secondary mb-4">
        Internships, jobs, and training programs from partner companies will appear here.
      </p>
      <div className="aic-card">
        <EmptyState
          variant="not-connected"
          icon="bi-briefcase"
          title="Opportunity listings aren't live yet"
          description="This page is wired to display real internship and job postings as soon as the backend endpoints are available. Sign up to be notified when new opportunities are posted."
          action={
            <Link to="/register" className="btn btn-aic-primary btn-sm mt-2">
              Create an account
            </Link>
          }
        />
      </div>
    </div>
  )
}
