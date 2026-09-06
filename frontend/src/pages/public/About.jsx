export default function About() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="font-display mb-3">About the platform</h1>
          <p className="text-secondary mb-4">
            The Academia&ndash;Industry Collaboration Portal brings students, academicians,
            industries, and institutions onto one platform so skills, opportunities, and
            collaboration can move between them without friction.
          </p>

          <h2 className="h5 mt-4 mb-2">For students</h2>
          <p className="text-secondary">
            Build a verified skill profile, understand exactly where your skills fall short of
            what industry is asking for, and get matched to internships, jobs, and learning
            paths that close that gap.
          </p>

          <h2 className="h5 mt-4 mb-2">For academicians</h2>
          <p className="text-secondary">
            Discover faculty development programs, consultancy, research collaboration, and
            mentorship opportunities, and track your applications in one place.
          </p>

          <h2 className="h5 mt-4 mb-2">For industry</h2>
          <p className="text-secondary">
            Post internships, jobs, live projects, and training programs, and review candidates
            ranked by real skill match rather than keyword search.
          </p>

          <h2 className="h5 mt-4 mb-2">For institutions</h2>
          <p className="text-secondary">
            Track placement analytics, skill demand, and application activity across your entire
            student body from a single admin dashboard.
          </p>

          <div className="aic-card p-4 mt-4">
            <p className="small text-secondary mb-0">
              <i className="bi bi-info-circle me-2" />
              Match scores, readiness scores, and other AI-generated figures shown across the
              platform are produced by the backend and clearly labeled as such. The platform
              does not display invented statistics as real data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
