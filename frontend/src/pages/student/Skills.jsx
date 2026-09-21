import { useEffect, useMemo, useState } from 'react'
import {
  getStudentSkills,
  getResumeSkills,
  getAvailableSkills,
  addStudentSkill,
  removeStudentSkill,
} from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const SKILLS_CACHE_KEY = 'student_skills_page'

export default function StudentSkills() {
  const [mySkills, setMySkills] = useState([])
  const [resumeSkills, setResumeSkills] = useState([])
  const [savedSkills, setSavedSkills] = useState([])
  const [availableSkills, setAvailableSkills] = useState([])

  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(SKILLS_CACHE_KEY)
    } catch {
      return true
    }
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  /* =========================================================
     LOAD SKILLS
     ========================================================= */

  useEffect(() => {
    let cancelled = false

    const loadSkills = async () => {
      /*
       * First try session cache.
       */
      try {
        const cached = sessionStorage.getItem(
          SKILLS_CACHE_KEY
        )

        if (cached) {
          const data = JSON.parse(cached)

          setMySkills(data.mySkills || [])
          setResumeSkills(data.resumeSkills || [])
          setSavedSkills(data.savedSkills || [])
          setAvailableSkills(data.availableSkills || [])
          setLoading(false)

          return
        }
      } catch {
        // Ignore invalid cache and fetch fresh data.
      }

      /*
       * No cache → fetch from backend.
       */
      try {
        setLoading(true)
        setError('')

        const [
          studentResponse,
          resumeResponse,
          availableResponse,
        ] = await Promise.all([
          getStudentSkills(),
          getResumeSkills(),
          getAvailableSkills(),
        ])

        if (cancelled) return

        const existingSkills =
          studentResponse.data?.skills || []

        const detectedSkills =
          resumeResponse.data?.skills || []

        const allSkills =
          availableResponse.data?.skills || []

        const pageData = {
          mySkills: detectedSkills,
          resumeSkills: detectedSkills,
          savedSkills: existingSkills,
          availableSkills: allSkills,
        }

        setMySkills(pageData.mySkills)
        setResumeSkills(pageData.resumeSkills)
        setSavedSkills(pageData.savedSkills)
        setAvailableSkills(pageData.availableSkills)

        sessionStorage.setItem(
          SKILLS_CACHE_KEY,
          JSON.stringify(pageData)
        )
      } catch (requestError) {
        if (cancelled) return

        setError(
          requestError.response?.data?.detail ||
            'Unable to load your skills.'
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSkills()

    return () => {
      cancelled = true
    }
  }, [])

  /* =========================================================
     SKILL IDS
     ========================================================= */

  const resumeSkillIds = useMemo(
    () => new Set(resumeSkills.map((skill) => skill.id)),
    [resumeSkills]
  )

  const savedSkillIds = useMemo(
    () => new Set(savedSkills.map((skill) => skill.id)),
    [savedSkills]
  )

  /* =========================================================
     SUGGESTED SKILLS
     ========================================================= */

  const suggestedSkills = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = availableSkills.filter((skill) => {
      if (resumeSkillIds.has(skill.id)) {
        return false
      }

      if (savedSkillIds.has(skill.id)) {
        return false
      }

      if (!query) {
        return true
      }

      return (
        skill.name.toLowerCase().includes(query) ||
        String(skill.category || '')
          .toLowerCase()
          .includes(query)
      )
    })

    return query
      ? filtered
      : filtered.slice(0, 20)
  }, [
    availableSkills,
    resumeSkillIds,
    savedSkillIds,
    search,
  ])

  /* =========================================================
     UPDATE CACHE
     ========================================================= */

  const updateCache = (
    nextMySkills,
    nextResumeSkills,
    nextSavedSkills,
    nextAvailableSkills
  ) => {
    try {
      sessionStorage.setItem(
        SKILLS_CACHE_KEY,
        JSON.stringify({
          mySkills: nextMySkills,
          resumeSkills: nextResumeSkills,
          savedSkills: nextSavedSkills,
          availableSkills: nextAvailableSkills,
        })
      )
    } catch {
      // Ignore storage errors.
    }
  }

  /* =========================================================
     ADD SKILL
     ========================================================= */

  const handleAddSkill = async (skillId) => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const { data } = await addStudentSkill(skillId)

      if (data?.skill) {
        setSavedSkills((previous) => {
          const alreadyExists = previous.some(
            (skill) => skill.id === data.skill.id
          )

          if (alreadyExists) {
            return previous
          }

          const updated = [
            ...previous,
            data.skill,
          ]

          updateCache(
            mySkills,
            resumeSkills,
            updated,
            availableSkills
          )

          return updated
        })
      }

      setMessage(
        'Skill added to your profile successfully.'
      )
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Unable to add this skill.'
      )
    } finally {
      setSaving(false)
    }
  }

  /* =========================================================
     REMOVE / HIDE RESUME SKILL
     ========================================================= */

  const handleRemoveSkill = async (skillId) => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const isSavedSkill =
        savedSkillIds.has(skillId)

      if (isSavedSkill) {
        await removeStudentSkill(skillId)

        setSavedSkills((previous) => {
          const updated = previous.filter(
            (skill) => skill.id !== skillId
          )

          updateCache(
            mySkills.filter(
              (skill) => skill.id !== skillId
            ),
            resumeSkills.filter(
              (skill) => skill.id !== skillId
            ),
            updated,
            availableSkills
          )

          return updated
        })
      }

      const updatedMySkills =
        mySkills.filter(
          (skill) => skill.id !== skillId
        )

      const updatedResumeSkills =
        resumeSkills.filter(
          (skill) => skill.id !== skillId
        )

      setMySkills(updatedMySkills)
      setResumeSkills(updatedResumeSkills)

      updateCache(
        updatedMySkills,
        updatedResumeSkills,
        savedSkills,
        availableSkills
      )

      setMessage(
        'Skill removed from your displayed skills.'
      )
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Unable to remove this skill.'
      )
    } finally {
      setSaving(false)
    }
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <Loading
        label="Loading your skills…"
        fullPage
      />
    )
  }

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="student-skills">

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <div className="small text-secondary fw-semibold mb-1">
            SKILLS PROFILE
          </div>

          <h1 className="h3 font-display fw-bold mb-1">
            My Skills
          </h1>

          <p className="text-secondary mb-0">
            Build your professional skill profile using
            your resume and additional skills.
          </p>
        </div>

        <div className="d-flex gap-2">
          <span className="badge rounded-pill bg-body-secondary text-body px-3 py-2">
            {mySkills.length} detected
          </span>

          <span className="badge rounded-pill bg-body-secondary text-body px-3 py-2">
            {savedSkills.length} added
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div
          className="alert alert-danger border-0 shadow-sm mb-3"
          role="alert"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          className="alert alert-success border-0 shadow-sm mb-3"
          role="status"
        >
          {message}
        </div>
      )}

      {/* =====================================================
          RESUME SKILLS
          ===================================================== */}

      <div className="aic-card p-4 mb-4">

        <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success"
                style={{
                  width: 34,
                  height: 34,
                }}
              >
                <i className="bi bi-file-earmark-text" />
              </span>

              <h2 className="h5 fw-bold mb-0">
                Skills detected from resume
              </h2>
            </div>

            <p className="text-secondary small mb-0">
              These skills were detected from your uploaded
              resume.
            </p>
          </div>

          <span className="badge rounded-pill bg-success-subtle text-success align-self-start px-3 py-2">
            {mySkills.length} skills
          </span>
        </div>

        {mySkills.length === 0 ? (
          <EmptyState
            description="No skills were detected from your resume. Upload a resume containing your technical skills."
          />
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {mySkills.map((skill) => (
              <div
                key={skill.id}
                className="d-inline-flex align-items-center gap-2 border rounded-pill px-3 py-2 bg-body"
              >
                <span className="fw-semibold small">
                  {skill.name}
                </span>

                {skill.category && (
                  <span className="text-secondary small">
                    {skill.category}
                  </span>
                )}

                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger p-0 ms-1"
                  disabled={saving}
                  onClick={() =>
                    handleRemoveSkill(skill.id)
                  }
                  aria-label={`Hide ${skill.name}`}
                  title={`Hide ${skill.name}`}
                >
                  <i className="bi bi-x-circle" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          ADDITIONAL SKILLS
          ===================================================== */}

      <div className="aic-card p-4">

        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary"
                style={{
                  width: 34,
                  height: 34,
                }}
              >
                <i className="bi bi-plus-lg" />
              </span>

              <h2 className="h5 fw-bold mb-0">
                Skills You May Want to Add
              </h2>
            </div>

            <p className="text-secondary small mb-0">
              Add skills you already know or are currently
              developing.
            </p>
          </div>

          <span className="small text-secondary align-self-md-center">
            {suggestedSkills.length}
            {search ? ' results' : ' suggestions'}
          </span>
        </div>

        {/* Search */}
        <div className="position-relative mb-4">
          <i
            className="bi bi-search position-absolute text-secondary"
            style={{
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />

          <input
            type="search"
            className="form-control ps-5"
            placeholder="Search by skill or category..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary position-absolute end-0 top-50 translate-middle-y me-1"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        {/* Suggested skills */}
        {suggestedSkills.length === 0 ? (
          <EmptyState
            description={
              search
                ? 'No skills match your search.'
                : 'No additional skills are available.'
            }
          />
        ) : (
          <>
            <div className="row g-3">
              {suggestedSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="col-12 col-md-6 col-xl-4"
                >
                  <div className="border rounded-3 p-3 h-100 d-flex align-items-center justify-content-between gap-3">

                    <div className="min-w-0">
                      <div className="fw-semibold text-truncate">
                        {skill.name}
                      </div>

                      {skill.category && (
                        <div className="text-secondary small mt-1 text-truncate">
                          {skill.category}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-aic-primary btn-sm flex-shrink-0"
                      disabled={saving}
                      onClick={() =>
                        handleAddSkill(skill.id)
                      }
                    >
                      <i className="bi bi-plus-lg me-1" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!search &&
              availableSkills.length > 20 && (
                <div className="text-secondary small mt-4 text-center">
                  Showing 20 suggestions. Search to explore
                  the complete skill database.
                </div>
              )}
          </>
        )}
      </div>
    </div>
  )
}