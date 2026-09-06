const STAGES = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected']

export default function ApplicationStatus({ status }) {
  const isRejected = status === 'Rejected'
  const currentIndex = STAGES.indexOf(status)

  if (isRejected) {
    return (
      <span className="aic-badge aic-badge-danger">
        <i className="bi bi-x-circle" /> Rejected
      </span>
    )
  }

  return (
    <div className="d-flex align-items-center flex-wrap gap-1" role="list" aria-label="Application progress">
      {STAGES.map((stage, i) => {
        const done = i <= currentIndex
        return (
          <div key={stage} className="d-flex align-items-center" role="listitem">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 22,
                height: 22,
                fontSize: '0.7rem',
                background: done ? 'var(--aic-indigo)' : 'var(--aic-line)',
                color: done ? '#fff' : 'var(--aic-ink-soft)',
              }}
              aria-hidden="true"
            >
              {done ? <i className="bi bi-check" /> : i + 1}
            </span>
            <span className={`small ms-1 me-2 ${done ? 'text-body' : 'text-secondary'}`}>{stage}</span>
            {i < STAGES.length - 1 && (
              <span style={{ width: 16, height: 1, background: 'var(--aic-line)' }} className="me-2" />
            )}
          </div>
        )
      })}
    </div>
  )
}
