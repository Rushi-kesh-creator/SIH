/**
 * A single, reusable empty-state block.
 *
 * variant="empty"       – the request succeeded but there's no data yet.
 * variant="error"       – the request failed.
 * variant="not-connected" – this feature's backend endpoint doesn't
 *                           exist yet. Always use this instead of
 *                           showing fake data, per project rules.
 */
export default function EmptyState({
  variant = 'empty',
  icon = 'bi-inbox',
  title,
  description,
  action,
}) {
  const defaults = {
    empty: {
      icon: 'bi-inbox',
      title: title || 'Nothing here yet',
      description: description || 'Once there is data, it will show up here.',
    },
    error: {
      icon: 'bi-exclamation-triangle',
      title: title || 'Something went wrong',
      description: description || 'We could not load this data. Please try again.',
    },
    'not-connected': {
      icon: 'bi-plug',
      title: title || 'Not connected to the backend yet',
      description:
        description ||
        'This section is built and ready, but its API endpoint has not been implemented on the backend yet.',
    },
  }
  const content = defaults[variant]

  return (
    <div className="text-center py-5 px-3">
      <i className={`bi ${icon}`} style={{ fontSize: '2rem', color: 'var(--aic-ink-soft)' }} aria-hidden="true" />
      <h3 className="h6 mt-3 mb-1">{content.title}</h3>
      <p className="text-secondary small mb-3" style={{ maxWidth: 420, margin: '0 auto' }}>
        {content.description}
      </p>
      {variant === 'not-connected' && (
        <span className="aic-badge aic-badge-pending">
          <i className="bi bi-cone-striped" /> Backend pending
        </span>
      )}
      {action}
    </div>
  )
}
