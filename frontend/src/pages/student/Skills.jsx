import { useEffect, useMemo, useState } from 'react'
import {
  getStudentSkills,
  getAvailableSkills,
  addStudentSkill,
  removeStudentSkill,
} from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

export default function StudentSkills() {
  const [mySkills, setMySkills] = useState([])
  const [availableSkills, setAvailableSkills] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadSkills = async () => {
    try {
      setLoading(true)
      setError('')

      const [studentResponse, availableResponse] = await Promise.all([
        getStudentSkills(),
        getAvailableSkills(),
      ])

      setMySkills(studentResponse.data?.skills || [])
      setAvailableSkills(availableResponse.data?.skills || [])
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Unable to load your skills.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const mySkillIds = useMemo(
    () => new Set(mySkills.map((skill) => skill.id)),
    [mySkills]
  )

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase()

    return availableSkills.filter((skill) => {
      if (mySkillIds.has(skill.id)) return false

      if (!query) return true

      return (
        skill.name.toLowerCase().includes(query) ||
        String(skill.category || '').toLowerCase().includes(query)
      )
    })
  }, [availableSkills, mySkillIds, search])

  const handleAddSkill = async (skillId) => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const { data } = await addStudentSkill(skillId)

      if (data?.skill) {
        setMySkills((previous) =>
          [...previous, data.skill].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        )
      }

      setMessage('Skill added successfully.')
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Unable to add this skill.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveSkill = async (skillId) => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      await removeStudentSkill(skillId)

      setMySkills((previous) =>
        previous.filter((skill) => skill.id !== skillId)
      )

      setMessage('Skill removed successfully.')
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Unable to remove this skill.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading label="Loading your skills…" />
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h4 font-display mb-1">
          Skills
        </h1>

        <p className="text-secondary mb-0">
          Manage the skills you have learned and use them to improve your
          career recommendations.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success mb-3">
          {message}
        </div>
      )}

      {/* My Skills */}
      <div className="aic-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="h6 mb-1">
              My Skills
            </h2>

            <p className="text-secondary small mb-0">
              Skills currently associated with your student profile.
            </p>
          </div>

          <span className="badge text-bg-light">
            {mySkills.length} skills
          </span>
        </div>

        {mySkills.length === 0 ? (
          <EmptyState
            description="You have not added any skills yet. Add skills below."
          />
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {mySkills.map((skill) => (
              <div
                key={skill.id}
                className="d-flex align-items-center gap-2 border rounded-pill px-3 py-2"
              >
                <span className="fw-semibold text-capitalize">
                  {skill.name}
                </span>

                {skill.category && (
                  <span className="text-secondary small">
                    {skill.category}
                  </span>
                )}

                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger p-0"
                  disabled={saving}
                  onClick={() => handleRemoveSkill(skill.id)}
                  aria-label={`Remove ${skill.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Skills */}
      <div className="aic-card p-4">
        <div className="mb-3">
          <h2 className="h6 mb-1">
            Add Skills
          </h2>

          <p className="text-secondary small mb-0">
            Select skills you currently know. These will be used as part of
            your student skill profile.
          </p>
        </div>

        <div className="mb-4">
          <input
            type="search"
            className="form-control"
            placeholder="Search skills..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {filteredSkills.length === 0 ? (
          <EmptyState
            description={
              search
                ? 'No additional skills match your search.'
                : 'No additional skills are available.'
            }
          />
        ) : (
          <div className="row g-3">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="col-12 col-md-6 col-lg-4"
              >
                <div className="border rounded p-3 h-100 d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold text-capitalize">
                      {skill.name}
                    </div>

                    {skill.category && (
                      <div className="text-secondary small mt-1">
                        {skill.category}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-aic-primary btn-sm"
                    disabled={saving}
                    onClick={() => handleAddSkill(skill.id)}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}