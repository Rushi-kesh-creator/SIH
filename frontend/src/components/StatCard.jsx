export default function StatCard({ icon, label, value, trend, accent = 'indigo' }) {
  const accentColors = {
    indigo: 'var(--aic-indigo)',
    teal: 'var(--aic-teal)',
    amber: 'var(--aic-amber)',
    green: 'var(--aic-green)',
  }

  return (
    <div className="aic-card p-3 h-100">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <p className="text-secondary small mb-1">{label}</p>
          <p className="h3 mb-0 font-display">{value}</p>
          {trend && <p className="small mt-1 mb-0 text-secondary">{trend}</p>}
        </div>
        {icon && (
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-3"
            style={{
              width: 40,
              height: 40,
              background: `${accentColors[accent]}14`,
              color: accentColors[accent],
            }}
          >
            <i className={`bi ${icon}`} aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  )
}
