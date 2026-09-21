import { useEffect, useState } from 'react'
import {
  getStudentProfile,
  getStudentSkills,
  getStudentCertifications,
  getStudentProjects,
} from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const PORTFOLIO_CACHE_KEY = 'student_portfolio'

const EMPTY_PORTFOLIO = {
  profile: {},
  skills: [],
  certifications: [],
  projects: [],
}

export default function StudentPortfolio() {
  const [portfolio, setPortfolio] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        PORTFOLIO_CACHE_KEY
      )

      return cached
        ? JSON.parse(cached)
        : EMPTY_PORTFOLIO
    } catch {
      return EMPTY_PORTFOLIO
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        PORTFOLIO_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)

  const loadPortfolio = async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(
          PORTFOLIO_CACHE_KEY
        )

        if (cached) {
          setPortfolio(JSON.parse(cached))
          setLoading(false)
          return
        }
      } catch {
        // Continue with API request.
      }
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [
        profileRes,
        skillsRes,
        certificationsRes,
        projectsRes,
      ] = await Promise.all([
        getStudentProfile(),
        getStudentSkills(),
        getStudentCertifications(),
        getStudentProjects(),
      ])

      const portfolioData = {
        profile: profileRes.data || {},
        skills: skillsRes.data?.skills || [],
        certifications:
          certificationsRes.data?.certifications || [],
        projects: projectsRes.data?.projects || [],
      }

      setPortfolio(portfolioData)

      sessionStorage.setItem(
        PORTFOLIO_CACHE_KEY,
        JSON.stringify(portfolioData)
      )
    } catch (error) {
      console.error(
        'Failed to load portfolio:',
        error
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

  const profile = portfolio.profile || {}
  const skills = portfolio.skills || []
  const certifications =
    portfolio.certifications || []
  const projects = portfolio.projects || []

  if (loading) {
    return (
      <Loading
        label="Loading your portfolio…"
        fullPage
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="text-uppercase small fw-semibold text-primary mb-1">
            Professional Profile
          </div>

          <h1 className="h4 font-display mb-1">
            Digital Portfolio
          </h1>

          <p className="text-secondary mb-0">
            Your skills, projects and certifications
            in one place.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-aic-outline"
            onClick={() => loadPortfolio(true)}
            disabled={refreshing}
          >
            <i
              className={`bi ${
                refreshing
                  ? 'bi-arrow-repeat'
                  : 'bi-arrow-clockwise'
              } me-2`}
            />
            {refreshing
              ? 'Refreshing…'
              : 'Refresh'}
          </button>

          <button
            type="button"
            className="btn btn-aic-primary"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2" />
            Print Portfolio
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="aic-card p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="d-flex align-items-start gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  background:
                    'var(--aic-soft-green)',
                }}
              >
                <i className="bi bi-person fs-4" />
              </div>

              <div>
                <h2 className="h5 fw-bold mb-1">
                  {profile.name || 'Student Name'}
                </h2>

                <p className="text-secondary mb-2">
                  {profile.degree || 'Student'}
                  {profile.branch
                    ? ` • ${profile.branch}`
                    : ''}
                </p>

                {profile.college && (
                  <p className="small mb-1">
                    <i className="bi bi-building me-2 text-secondary" />
                    {profile.college}
                  </p>
                )}

                {profile.email && (
                  <p className="small text-secondary mb-0">
                    <i className="bi bi-envelope me-2" />
                    {profile.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4 mt-4 mt-md-0">
            <div className="row g-2 text-center">
              <div className="col-4">
                <div className="border rounded-3 p-2">
                  <div className="small text-secondary">
                    Skills
                  </div>

                  <div className="fw-bold fs-5">
                    {skills.length}
                  </div>
                </div>
              </div>

              <div className="col-4">
                <div className="border rounded-3 p-2">
                  <div className="small text-secondary">
                    Projects
                  </div>

                  <div className="fw-bold fs-5">
                    {projects.length}
                  </div>
                </div>
              </div>

              <div className="col-4">
                <div className="border rounded-3 p-2">
                  <div className="small text-secondary">
                    CGPA
                  </div>

                  <div className="fw-bold fs-5">
                    {profile.cgpa || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="border-top mt-4 pt-3">
            <h3 className="h6 fw-semibold mb-2">
              About Me
            </h3>

            <p className="text-secondary small mb-0">
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="aic-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h6 fw-semibold mb-1">
              <i className="bi bi-tools me-2" />
              Skills
            </h2>

            <p className="small text-secondary mb-0">
              Your current skills and technical capabilities.
            </p>
          </div>

          <span className="aic-badge">
            {skills.length}
          </span>
        </div>

        {skills.length === 0 ? (
          <EmptyState
            title="No skills added"
            description="Add your skills to build your portfolio."
          />
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={skill.id || index}
                className="badge bg-light text-dark border px-3 py-2"
              >
                {skill.name ||
                  skill.skill_name ||
                  skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="aic-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h6 fw-semibold mb-1">
              <i className="bi bi-code-square me-2" />
              Projects
            </h2>

            <p className="small text-secondary mb-0">
              Practical work and projects you've
              completed.
            </p>
          </div>

          <span className="aic-badge">
            {projects.length}
          </span>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects added"
            description="Add your projects to showcase your practical work."
          />
        ) : (
          <div className="row g-3">
            {projects.map((project) => (
              <div
                className="col-md-6"
                key={project.id}
              >
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 42,
                        height: 42,
                        background:
                          'var(--aic-soft-green)',
                      }}
                    >
                      <i className="bi bi-kanban" />
                    </div>

                    <div className="flex-grow-1">
                      <h3 className="h6 fw-semibold mb-2">
                        {project.title}
                      </h3>

                      {project.description && (
                        <p className="text-secondary small mb-3">
                          {project.description}
                        </p>
                      )}

                      {project.technologies && (
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {project.technologies
                            .split(',')
                            .map((tech) =>
                              tech.trim()
                            )
                            .filter(Boolean)
                            .map((tech) => (
                              <span
                                key={tech}
                                className="badge bg-primary-subtle text-primary"
                              >
                                {tech}
                              </span>
                            ))}
                        </div>
                      )}

                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-aic-outline btn-sm"
                        >
                          <i className="bi bi-box-arrow-up-right me-1" />
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="aic-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h6 fw-semibold mb-1">
              <i className="bi bi-award me-2" />
              Certifications
            </h2>

            <p className="small text-secondary mb-0">
              Credentials that support your professional
              profile.
            </p>
          </div>

          <span className="aic-badge">
            {certifications.length}
          </span>
        </div>

        {certifications.length === 0 ? (
          <EmptyState
            title="No certifications added"
            description="Add certifications to strengthen your portfolio."
          />
        ) : (
          <div className="row g-3">
            {certifications.map((certification) => (
              <div
                className="col-md-6"
                key={certification.id}
              >
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 42,
                        height: 42,
                        background:
                          'rgba(255, 193, 7, 0.12)',
                      }}
                    >
                      <i className="bi bi-award text-warning" />
                    </div>

                    <div className="flex-grow-1">
                      <h3 className="h6 fw-semibold mb-2">
                        {certification.name}
                      </h3>

                      {certification.issuer && (
                        <p className="small text-secondary mb-1">
                          <i className="bi bi-building me-2" />
                          {certification.issuer}
                        </p>
                      )}

                      {certification.issue_date && (
                        <p className="small text-secondary mb-3">
                          <i className="bi bi-calendar3 me-2" />
                          Issued:{' '}
                          {certification.issue_date}
                        </p>
                      )}

                      {certification.credential_url && (
                        <a
                          href={
                            certification.credential_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-aic-outline btn-sm"
                        >
                          <i className="bi bi-link-45deg me-1" />
                          View Credential
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}