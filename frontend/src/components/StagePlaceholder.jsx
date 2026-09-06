/**
 * Temporary placeholder for pages scheduled in a later build stage.
 * Once a page is implemented, delete its usage of this component.
 */
export default function StagePlaceholder({ title, stage }) {
  return (
    <div className="aic-card p-4">
      <span className="aic-badge aic-badge-pending mb-3">
        <i className="bi bi-cone-striped" /> Coming in {stage}
      </span>
      <h1 className="h4 font-display mb-2">{title}</h1>
      <p className="text-secondary small mb-0">
        This route is wired up and role-protected. Its full UI will be built in the next stage.
      </p>
    </div>
  )
}
