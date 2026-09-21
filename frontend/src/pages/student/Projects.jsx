import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getStudentProjects,
  addStudentProject,
} from '../../api/studentApi'
import Loading from '../../components/Loading.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const PROJECTS_CACHE_KEY = 'student_projects'

const EMPTY_FORM = {
  title: '',
  description: '',
  technologies: '',
  project_url: '',
}

export default function StudentProjects() {
  const [projects, setProjects] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        PROJECTS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        PROJECTS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [form, setForm] = useState(EMPTY_FORM)

  const loadProjects = async (forceRefresh = false) => {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(
          PROJECTS_CACHE_KEY
        )

        if (cached) {
          setProjects(JSON.parse(cached))
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

      const { data } = await getStudentProjects()

      const projectData = data?.projects || []

      setProjects(projectData)

      sessionStorage.setItem(
        PROJECTS_CACHE_KEY,
        JSON.stringify(projectData)
      )
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          'Could not load projects.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      toast.error('Project title is required.')
      return
    }

    setSaving(true)

    try {
      const { data } = await addStudentProject({
        title: form.title.trim(),
        description:
          form.description.trim() || null,
        technologies:
          form.technologies.trim() || null,
        project_url:
          form.project_url.trim() || null,
      })

      const newProject =
        data?.project || data

      let updatedProjects

      if (
        newProject &&
        typeof newProject === 'object' &&
        newProject.id
      ) {
        updatedProjects = [
          newProject,
          ...projects,
        ]
      } else {
        const response =
          await getStudentProjects()

        updatedProjects =
          response.data?.projects || []
      }

      setProjects(updatedProjects)

      sessionStorage.setItem(
        PROJECTS_CACHE_KEY,
        JSON.stringify(updatedProjects)
      )

      toast.success(
        'Project added successfully.'
      )

      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          'Could not add project.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Loading
        label="Loading projects…"
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
            Practical Experience
          </div>

          <h1 className="h4 font-display mb-1">
            Projects
          </h1>

          <p className="text-secondary mb-0">
            Showcase your academic, personal, and
            professional projects.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-aic-outline d-flex align-items-center gap-2"
            onClick={() => loadProjects(true)}
            disabled={refreshing}
          >
            <i
              className={`bi ${
                refreshing
                  ? 'bi-arrow-repeat'
                  : 'bi-arrow-clockwise'
              }`}
            />

            {refreshing
              ? 'Refreshing…'
              : 'Refresh'}
          </button>

          <button
            type="button"
            className="btn btn-aic-primary"
            onClick={() =>
              setShowForm((current) => !current)
            }
          >
            <i className="bi bi-plus-lg me-2" />
            Add project
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <div className="aic-card p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 44,
                  height: 44,
                  background:
                    'rgba(13, 110, 253, 0.1)',
                }}
              >
                <i className="bi bi-kanban text-primary fs-5" />
              </div>

              <div>
                <div className="small text-secondary">
                  Projects
                </div>

                <div className="fs-4 fw-bold">
                  {projects.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add project form */}
      {showForm && (
        <div className="aic-card p-4 mb-4">
          <div className="d-flex align-items-start gap-3 mb-4">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 42,
                height: 42,
                background:
                  'rgba(13, 110, 253, 0.1)',
              }}
            >
              <i className="bi bi-plus-circle text-primary fs-5" />
            </div>

            <div>
              <h2 className="h6 fw-semibold mb-1">
                Add project
              </h2>

              <p className="text-secondary small mb-0">
                Add a project that demonstrates your
                practical skills and experience.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label
                  htmlFor="project-title"
                  className="form-label small fw-semibold"
                >
                  Project title *
                </label>

                <input
                  id="project-title"
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. AI Student Performance Predictor"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label
                  htmlFor="project-description"
                  className="form-label small fw-semibold"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  name="description"
                  className="form-control"
                  rows={4}
                  placeholder="Describe your project, your contribution, and what you achieved."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="project-technologies"
                  className="form-label small fw-semibold"
                >
                  Technologies
                </label>

                <input
                  id="project-technologies"
                  type="text"
                  name="technologies"
                  className="form-control"
                  placeholder="Python, React, FastAPI, PostgreSQL"
                  value={form.technologies}
                  onChange={handleChange}
                />

                <div className="form-text">
                  Separate technologies with commas.
                </div>
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="project-url"
                  className="form-label small fw-semibold"
                >
                  Project URL
                </label>

                <input
                  id="project-url"
                  type="url"
                  name="project_url"
                  className="form-control"
                  placeholder="https://github.com/..."
                  value={form.project_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-aic-primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving…'
                  : 'Save project'}
              </button>

              <button
                type="button"
                className="btn btn-aic-outline"
                onClick={() => {
                  setShowForm(false)
                  setForm(EMPTY_FORM)
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="aic-card p-4">
          <EmptyState
            icon="bi-kanban"
            title="No projects yet"
            description="Add your projects to showcase your practical experience to recruiters."
          />
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h6 mb-1">
                Your projects
              </h2>

              <p className="small text-secondary mb-0">
                Projects you've added to your profile.
              </p>
            </div>

            <span className="aic-badge">
              {projects.length}{' '}
              {projects.length === 1
                ? 'project'
                : 'projects'}
            </span>
          </div>

          <div className="row g-3">
            {projects.map((project) => (
              <div
                className="col-md-6"
                key={project.id}
              >
                <div className="aic-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 46,
                        height: 46,
                        background:
                          'var(--aic-soft-green)',
                      }}
                    >
                      <i className="bi bi-kanban fs-5" />
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
                        <div className="mb-3">
                          {project.technologies
                            .split(',')
                            .map((technology) =>
                              technology.trim()
                            )
                            .filter(Boolean)
                            .map((technology) => (
                              <span
                                key={technology}
                                className="badge text-bg-light me-1 mb-1"
                              >
                                {technology}
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
                          View project
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}