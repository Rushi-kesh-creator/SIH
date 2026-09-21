import { useEffect, useMemo, useState } from 'react'
import {
  getAcademicPrograms,
  createAcademicProgram,
  updateAcademicProgram,
  deleteAcademicProgram,
} from '../../api/academicianApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const CACHE_KEY = 'academician_programs'

const emptyForm = {
  title: '',
  description: '',
  skills: '',
  duration: '',
  provider: '',
  website: '',
  status: 'active',
}

export default function AcademicianFacultyOpportunities() {
  const [programs, setPrograms] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(CACHE_KEY)
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState(emptyForm)

  const loadPrograms = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!programs.length) {
        setLoading(true)
      }

      setError('')

      const { data } = await getAcademicPrograms()

      const result = Array.isArray(data)
        ? data
        : data.programs || []

      setPrograms(result)

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (requestError) {
      console.error('Academic programs error:', requestError)

      setError(
        requestError.response?.data?.detail ||
        'Could not load academic programs.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY)

    if (!cached) {
      loadPrograms()
    }
  }, [])

  const filteredPrograms = useMemo(() => {
    const query = search.trim().toLowerCase()

    return programs.filter((program) => {
      const matchesSearch =
        !query ||
        program.title?.toLowerCase().includes(query) ||
        program.provider?.toLowerCase().includes(query) ||
        program.skills?.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'all' ||
        program.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [programs, search, statusFilter])

  const activeCount = programs.filter(
    (program) => program.status === 'active'
  ).length

  const inactiveCount = programs.filter(
    (program) => program.status !== 'active'
  ).length

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
  }

  const openEditForm = (program) => {
    setEditingId(program.id)

    setForm({
      title: program.title || '',
      description: program.description || '',
      skills: program.skills || '',
      duration: program.duration || '',
      provider: program.provider || '',
      website: program.website || '',
      status: program.status || 'active',
    })

    setShowForm(true)
    setError('')
  }

  const closeForm = () => {
    if (saving) return

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Program title is required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        skills: form.skills.trim(),
        duration: form.duration.trim(),
        provider: form.provider.trim(),
        website: form.website.trim(),
        status: form.status,
      }

      if (editingId) {
        await updateAcademicProgram(editingId, payload)
      } else {
        await createAcademicProgram(payload)
      }

      closeForm()

      await loadPrograms({ force: true })
    } catch (requestError) {
      console.error('Save academic program error:', requestError)

      setError(
        requestError.response?.data?.detail ||
        'Could not save the academic program.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this academic program?'
    )

    if (!confirmed) return

    try {
      setError('')

      await deleteAcademicProgram(id)

      await loadPrograms({ force: true })
    } catch (requestError) {
      console.error('Delete academic program error:', requestError)

      setError(
        requestError.response?.data?.detail ||
        'Could not delete the academic program.'
      )
    }
  }

  if (loading) {
    return (
      <Loading
        label="Loading academic programs…"
        fullPage
      />
    )
  }

  return (
    <div>

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div>
          <span className="aic-badge aic-badge-success mb-2">
            <i className="bi bi-book me-1"></i>
            Academic Programs
          </span>

          <h1 className="h4 font-display fw-bold mb-1">
            Manage Academic Programs
          </h1>

          <p className="text-secondary mb-0">
            Create and manage courses, training programs,
            and learning opportunities for students.
          </p>
        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-aic-outline"
            onClick={() => loadPrograms({ force: true })}
            disabled={refreshing}
          >
            <i
              className={`bi ${
                refreshing
                  ? 'bi-arrow-repeat'
                  : 'bi-arrow-clockwise'
              } me-2`}
            ></i>

            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            className="btn btn-aic-primary"
            onClick={openCreateForm}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Program
          </button>

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger small">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-lg-4">
          <div className="aic-card p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-book"></i>
              </div>

              <div>
                <div className="text-secondary small">
                  Total Programs
                </div>

                <div className="h4 fw-bold mb-0">
                  {programs.length}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-6 col-lg-4">
          <div className="aic-card p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>

              <div>
                <div className="text-secondary small">
                  Active Programs
                </div>

                <div className="h4 fw-bold mb-0">
                  {activeCount}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-6 col-lg-4">
          <div className="aic-card p-3 h-100">
            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-pause-circle"></i>
              </div>

              <div>
                <div className="text-secondary small">
                  Other Status
                </div>

                <div className="h4 fw-bold mb-0">
                  {inactiveCount}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Search + Filter */}
      <div className="aic-card p-3 mb-4">

        <div className="row g-3">

          <div className="col-md-8">
            <div className="input-group">

              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search by program, provider, or skill..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>
          </div>

          <div className="col-md-4">

            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

          </div>

        </div>

      </div>

      {/* Programs */}
      {filteredPrograms.length === 0 ? (

        <div className="aic-card p-4">
          <EmptyState
            description={
              programs.length === 0
                ? 'No academic programs have been created yet.'
                : 'No programs match your search or filter.'
            }
          />

          {programs.length === 0 && (
            <div className="text-center mt-3">
              <button
                className="btn btn-aic-primary"
                onClick={openCreateForm}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Create Your First Program
              </button>
            </div>
          )}
        </div>

      ) : (

        <div className="row g-3">

          {filteredPrograms.map((program) => (

            <div
              className="col-md-6 col-xl-4"
              key={program.id}
            >

              <div className="aic-card p-4 h-100 d-flex flex-column">

                <div className="d-flex justify-content-between align-items-start gap-3">

                  <div className="d-flex align-items-center gap-2">

                    <div className="aic-stat-icon bg-primary-subtle text-primary">
                      <i className="bi bi-book"></i>
                    </div>

                    <span
                      className={`aic-badge ${
                        program.status === 'active'
                          ? 'aic-badge-success'
                          : 'aic-badge-pending'
                      } text-capitalize`}
                    >
                      {program.status || 'active'}
                    </span>

                  </div>

                  <div className="dropdown">

                    <button
                      className="btn btn-sm btn-light border"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-three-dots"></i>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">

                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            openEditForm(program)
                          }
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Edit
                        </button>
                      </li>

                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() =>
                            handleDelete(program.id)
                          }
                        >
                          <i className="bi bi-trash me-2"></i>
                          Delete
                        </button>
                      </li>

                    </ul>

                  </div>

                </div>

                <h2 className="h6 fw-bold mt-3 mb-2">
                  {program.title}
                </h2>

                {program.description && (
                  <p className="text-secondary small mb-3">
                    {program.description}
                  </p>
                )}

                <div className="mt-auto">

                  {program.skills && (
                    <div className="mb-3">

                      <div className="small fw-semibold mb-2">
                        <i className="bi bi-stars me-1"></i>
                        Skills
                      </div>

                      <div className="d-flex flex-wrap gap-1">
                        {program.skills
                          .split(',')
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .map((skill) => (
                            <span
                              className="badge text-bg-light border"
                              key={skill}
                            >
                              {skill}
                            </span>
                          ))}
                      </div>

                    </div>
                  )}

                  <div className="border-top pt-3">

                    {program.provider && (
                      <div className="small text-secondary mb-2">
                        <i className="bi bi-building me-2"></i>
                        {program.provider}
                      </div>
                    )}

                    {program.duration && (
                      <div className="small text-secondary mb-2">
                        <i className="bi bi-clock me-2"></i>
                        {program.duration}
                      </div>
                    )}

                    {program.website && (
                      <a
                        href={program.website}
                        target="_blank"
                        rel="noreferrer"
                        className="small text-decoration-none"
                      >
                        <i className="bi bi-box-arrow-up-right me-2"></i>
                        Visit program website
                      </a>
                    )}

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">

              <div className="modal-header">

                <div>
                  <h5 className="modal-title fw-bold">
                    {editingId
                      ? 'Edit Academic Program'
                      : 'Create Academic Program'}
                  </h5>

                  <p className="text-secondary small mb-0 mt-1">
                    Add learning details that can help students
                    build relevant skills.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForm}
                  disabled={saving}
                ></button>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="modal-body">

                  <div className="row g-3">

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Program Title *
                      </label>

                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="e.g. Advanced Machine Learning"
                        value={form.title}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Description
                      </label>

                      <textarea
                        name="description"
                        className="form-control"
                        rows="4"
                        placeholder="Describe the program and what students will learn..."
                        value={form.description}
                        onChange={handleChange}
                      />

                    </div>

                    <div className="col-12">

                      <label className="form-label fw-semibold">
                        Skills
                      </label>

                      <input
                        type="text"
                        name="skills"
                        className="form-control"
                        placeholder="Python, Machine Learning, TensorFlow"
                        value={form.skills}
                        onChange={handleChange}
                      />

                      <div className="form-text">
                        Separate multiple skills with commas.
                      </div>

                    </div>

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Duration
                      </label>

                      <input
                        type="text"
                        name="duration"
                        className="form-control"
                        placeholder="e.g. 12 weeks"
                        value={form.duration}
                        onChange={handleChange}
                      />

                    </div>

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Provider
                      </label>

                      <input
                        type="text"
                        name="provider"
                        className="form-control"
                        placeholder="e.g. Department of CSE"
                        value={form.provider}
                        onChange={handleChange}
                      />

                    </div>

                    <div className="col-md-8">

                      <label className="form-label fw-semibold">
                        Website
                      </label>

                      <input
                        type="url"
                        name="website"
                        className="form-control"
                        placeholder="https://example.com"
                        value={form.website}
                        onChange={handleChange}
                      />

                    </div>

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Status
                      </label>

                      <select
                        name="status"
                        className="form-select"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="active">
                          Active
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>
                      </select>

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-aic-outline"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-aic-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        {editingId
                          ? 'Save Changes'
                          : 'Create Program'}
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}