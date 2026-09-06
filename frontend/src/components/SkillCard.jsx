export default function SkillCard({ name, proficiency, verified = false }) {
  return (
    <div className="aic-card p-3 h-100">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="fw-semibold">{name}</span>
        {verified && (
          <span className="aic-badge aic-badge-success" title="Verified skill">
            <i className="bi bi-patch-check-fill" /> Verified
          </span>
        )}
      </div>
      {typeof proficiency === 'number' && (
        <div
          className="progress"
          style={{ height: 6 }}
          role="progressbar"
          aria-valuenow={proficiency}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar" style={{ width: `${proficiency}%`, background: 'var(--aic-indigo)' }} />
        </div>
      )}
    </div>
  )
}
