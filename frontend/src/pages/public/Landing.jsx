import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: 'bi-diagram-3',
    title: 'AI-powered skill mapping',
    body: 'Every student\u2019s technical and soft skills are captured in one structured profile that industry and academia can both read.',
  },
  {
    icon: 'bi-briefcase',
    title: 'Internship and job matching',
    body: 'Opportunities are ranked against a student\u2019s actual skill profile, not just keywords in a resume.',
  },
  {
    icon: 'bi-bar-chart-steps',
    title: 'Skill-gap analysis',
    body: 'See exactly which industry-required skills are missing or only partially met, and what to learn next.',
  },
  {
    icon: 'bi-people',
    title: 'Industry collaboration',
    body: 'Companies post live projects, mentorship, and training programs directly to relevant students and faculty.',
  },
  {
    icon: 'bi-window-stack',
    title: 'Digital student portfolio',
    body: 'Skills, projects, certifications, and internships in one shareable, verified portfolio.',
  },
  {
    icon: 'bi-graph-up-arrow',
    title: 'Placement intelligence',
    body: 'A readiness score built from resume strength, skill match, and interview preparedness.',
  },
]

const WORKFLOW = [
  'Student skills',
  'AI skill analysis',
  'Skill-gap detection',
  'Learning recommendations',
  'Internship / job matching',
  'Placement readiness',
]

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="py-5 py-lg-6" style={{ background: 'linear-gradient(180deg, var(--aic-indigo-tint), #fff)' }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="aic-badge aic-badge-ai mb-3">
                <i className="bi bi-stars" /> AI-powered platform
              </span>
              <h1 className="display-5 font-display mb-3" style={{ maxWidth: 620 }}>
                Connecting academia with industry through AI
              </h1>
              <p className="text-secondary mb-4" style={{ maxWidth: 540, fontSize: '1.05rem' }}>
                Skill mapping, skill-gap analysis, internships, placements, and faculty
                collaboration &mdash; brought together on one platform for students,
                academicians, industries, and institutions.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-aic-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/opportunities" className="btn btn-aic-outline btn-lg">
                  Explore Opportunities
                </Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="aic-card p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                <p className="small text-secondary text-uppercase mb-3" style={{ letterSpacing: '0.03em' }}>
                  Placement readiness
                </p>
                {[
                  { label: 'Skill match', value: 84 },
                  { label: 'Resume strength', value: 71 },
                  { label: 'Interview readiness', value: 62 },
                ].map((row) => (
                  <div key={row.label} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{row.label}</span>
                      <span className="fw-semibold">{row.value}%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${row.value}%`, background: 'var(--aic-indigo)' }}
                      />
                    </div>
                  </div>
                ))}
                <p className="small text-secondary mb-0">
                  Illustrative preview &mdash; your dashboard shows real, backend-generated scores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-5">
        <div className="container py-4">
          <div className="row g-4">
            {FEATURES.map((f) => (
              <div className="col-md-6 col-lg-4" key={f.title}>
                <div className="aic-card p-4 h-100">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: 44, height: 44, background: 'var(--aic-indigo-tint)', color: 'var(--aic-indigo)' }}
                  >
                    <i className={`bi ${f.icon}`} style={{ fontSize: '1.2rem' }} aria-hidden="true" />
                  </span>
                  <h3 className="h6 mb-2">{f.title}</h3>
                  <p className="text-secondary small mb-0">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-5" style={{ background: 'var(--aic-indigo-tint)' }}>
        <div className="container py-4">
          <h2 className="h3 font-display text-center mb-5">How a student moves through the platform</h2>
          <div className="d-flex flex-column flex-lg-row align-items-stretch justify-content-center gap-3">
            {WORKFLOW.map((step, i) => (
              <div key={step} className="d-flex align-items-center">
                <div className="aic-card px-3 py-2 text-center" style={{ minWidth: 170 }}>
                  <span className="small fw-semibold">{step}</span>
                </div>
                {i < WORKFLOW.length - 1 && (
                  <i
                    className="bi bi-arrow-right d-none d-lg-inline mx-2"
                    style={{ color: 'var(--aic-indigo)' }}
                    aria-hidden="true"
                  />
                )}
                {i < WORKFLOW.length - 1 && (
                  <i
                    className="bi bi-arrow-down d-lg-none my-1"
                    style={{ color: 'var(--aic-indigo)' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 border-top" style={{ borderColor: 'var(--aic-line)' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <span className="fw-bold font-display">Academia&ndash;Industry Portal</span>
              <p className="text-secondary small mt-2 mb-0">
                An AI-powered platform connecting students, academicians, industries, and institutions.
              </p>
            </div>
            <div className="col-md-4">
              <h3 className="h6 mb-2">Platform</h3>
              <ul className="list-unstyled small text-secondary">
                <li className="mb-1"><Link to="/about">About</Link></li>
                <li className="mb-1"><Link to="/opportunities">Explore Opportunities</Link></li>
                <li className="mb-1"><Link to="/register">Get Started</Link></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h3 className="h6 mb-2">Account</h3>
              <ul className="list-unstyled small text-secondary">
                <li className="mb-1"><Link to="/login">Log in</Link></li>
                <li className="mb-1"><Link to="/register">Register</Link></li>
              </ul>
            </div>
          </div>
          <p className="text-secondary small mt-4 mb-0">
            &copy; {new Date().getFullYear()} Academia&ndash;Industry Collaboration Portal.
          </p>
        </div>
      </footer>
    </div>
  )
}
