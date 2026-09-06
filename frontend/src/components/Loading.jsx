export default function Loading({ label = 'Loading…', fullPage = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`d-flex flex-column align-items-center justify-content-center gap-2 text-secondary ${
        fullPage ? 'py-5 my-5' : 'py-4'
      }`}
    >
      <div className="spinner-border" style={{ color: 'var(--aic-indigo)', width: '2rem', height: '2rem' }} />
      <span className="small">{label}</span>
    </div>
  )
}
