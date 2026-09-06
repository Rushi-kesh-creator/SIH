export default function OpportunityCard({
  title,
  company,
  location,
  type, // "Internship" | "Job"
  duration,
  compensation,
  matchScore, // optional, backend-generated
  applied = false,
  onApply,
  onViewDetails,
}) {
  return (
    <div className="aic-card p-3 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <span className="text-uppercase small fw-semibold" style={{ color: 'var(--aic-indigo)', letterSpacing: '0.02em' }}>
          {type}
        </span>
        {typeof matchScore === 'number' && (
          <span className="aic-badge aic-badge-ai" title="Backend-generated match score">
            <i className="bi bi-stars" /> {matchScore}% match
          </span>
        )}
      </div>
      <h3 className="h6 mb-1">{title}</h3>
      <p className="text-secondary small mb-2">{company}</p>
      <div className="d-flex flex-wrap gap-3 small text-secondary mb-3">
        {location && (
          <span>
            <i className="bi bi-geo-alt me-1" />
            {location}
          </span>
        )}
        {duration && (
          <span>
            <i className="bi bi-clock me-1" />
            {duration}
          </span>
        )}
        {compensation && (
          <span>
            <i className="bi bi-cash me-1" />
            {compensation}
          </span>
        )}
      </div>
      <div className="mt-auto d-flex gap-2">
        <button className="btn btn-aic-primary btn-sm" onClick={onApply} disabled={applied}>
          {applied ? 'Applied' : 'Apply'}
        </button>
        <button className="btn btn-aic-outline btn-sm" onClick={onViewDetails}>
          View details
        </button>
      </div>
    </div>
  )
}
