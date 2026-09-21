import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecommendedOpportunities } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const SKILL_GAP_CACHE_KEY = 'student_skill_gap_analysis'

function Score({ label, value, icon }) {
  const numericValue = Number(value || 0)

  return (
    <div className="col-12 col-md-4">
      <div className="border rounded-3 p-3 h-100">
        <div className="d-flex align-items-center gap-2 mb-2">
          {icon && (
            <i className={`bi ${icon} text-secondary`} />
          )}

          <p className="text-secondary small mb-0">
            {label}
          </p>
        </div>

        <p className="h4 mb-0 font-display fw-bold">
          {Math.round(numericValue * 10) / 10}%
        </p>
      </div>
    </div>
  )
}

function formatInterpretation(interpretation) {
  if (!interpretation) {
    return 'No interpretation available.'
  }

  if (typeof interpretation === 'string') {
    return interpretation
  }

  if (typeof interpretation === 'object') {
    return (
      interpretation.description ||
      interpretation.label ||
      'Match analysis available.'
    )
  }

  return String(interpretation)
}

function getInterpretationLabel(interpretation) {
  if (!interpretation) {
    return 'Analysis'
  }

  if (typeof interpretation === 'string') {
    return interpretation
  }

  if (typeof interpretation === 'object') {
    return interpretation.label || 'Analysis'
  }

  return String(interpretation)
}

function normalizeOpportunities(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.recommendations)) {
    return data.recommendations
  }

  if (Array.isArray(data?.opportunities)) {
    return data.opportunities
  }

  if (Array.isArray(data?.results)) {
    return data.results
  }

  return []
}

export default function StudentSkillGap() {
  const navigate = useNavigate()

  const [opportunities, setOpportunities] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        SKILL_GAP_CACHE_KEY
      )

      return cached
        ? JSON.parse(cached)
        : []
    } catch {
      return []
    }
  })

  const [status, setStatus] = useState(() => {
    try {
      return sessionStorage.getItem(
        SKILL_GAP_CACHE_KEY
      )
        ? 'ready'
        : 'loading'
    } catch {
      return 'loading'
    }
  })

  const [error, setError] = useState('')

  /* =========================================================
     LOAD AI ANALYSIS
     ========================================================= */

  const loadSkillGap = async ({
    forceRefresh = false,
  } = {}) => {
    setError('')

    if (!forceRefresh && opportunities.length > 0) {
      setStatus('ready')
      return
    }

    setStatus('loading')

    try {
      const { data } =
        await getRecommendedOpportunities()

      const normalized =
        normalizeOpportunities(data)

      setOpportunities(normalized)

      sessionStorage.setItem(
        SKILL_GAP_CACHE_KEY,
        JSON.stringify(normalized)
      )

      setStatus('ready')
    } catch (requestError) {
      setOpportunities([])
      setStatus('error')

      setError(
        requestError.response?.data?.detail ||
          'We could not analyze your resume against the current opportunities.'
      )
    }
  }

  useEffect(() => {
    const cached =
      sessionStorage.getItem(
        SKILL_GAP_CACHE_KEY
      )

    if (cached) {
      return
    }

    loadSkillGap()
  }, [])

  /* =========================================================
     REFRESH
     ========================================================= */

  const handleRefresh = () => {
    loadSkillGap({
      forceRefresh: true,
    })
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (status === 'loading') {
    return (
      <Loading
        label="Analyzing your resume against current opportunities…"
        fullPage
      />
    )
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (status === 'error') {
    return (
      <div className="aic-card p-4">
        <EmptyState
          variant="error"
          description={error}
        />

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-aic-primary"
            onClick={() =>
              loadSkillGap({
                forceRefresh: true,
              })
            }
          >
            <i className="bi bi-arrow-repeat me-2" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">

        <div>
          <div className="small text-secondary fw-semibold mb-1">
            AI CAREER ANALYSIS
          </div>

          <h1 className="h3 font-display fw-bold mb-1">
            Skill Gap
          </h1>

          <p className="text-secondary mb-0">
            Understand your current strengths and the
            skills you may need to develop.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-aic-primary"
          onClick={handleRefresh}
          disabled={status === 'loading'}
        >
          <i className="bi bi-arrow-repeat me-2" />

          {status === 'loading'
            ? 'Analyzing…'
            : 'Refresh Analysis'}
        </button>

      </div>

      {/* AI Explanation */}
      <div className="aic-card p-4 mb-4">

        <div className="d-flex align-items-start gap-3">

          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary flex-shrink-0"
            style={{
              width: 42,
              height: 42,
            }}
          >
            <i className="bi bi-stars" />
          </div>

          <div>
            <h2 className="h6 fw-bold mb-1">
              AI Skill Gap Analysis
            </h2>

            <p className="text-secondary small mb-0">
              Your uploaded resume is compared with active
              jobs and internships using semantic similarity
              and skill coverage analysis.
            </p>
          </div>

        </div>

      </div>

      {/* No opportunities */}
      {opportunities.length === 0 ? (
        <div className="aic-card p-4">
          <EmptyState
            description="No active opportunities are available for AI skill-gap analysis."
          />
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">

          {opportunities.map(
            (item, index) => {
              const analysis =
                item.analysis || item

              const opportunity =
                item.opportunity || {}

              const title =
                opportunity.title ||
                item.title ||
                'Opportunity'

              const company =
                opportunity.company?.name ||
                item.company?.name ||
                item.company_name ||
                'Company'

              const location =
                opportunity.location ||
                item.location ||
                'Location not specified'

              const type =
                opportunity.type ||
                item.type ||
                item.opportunity_type ||
                'Opportunity'

              const matchingSkills =
                Array.isArray(
                  analysis.matching_skills
                )
                  ? analysis.matching_skills
                  : []

              const missingSkills =
                Array.isArray(
                  analysis.missing_skills
                )
                  ? analysis.missing_skills
                  : []

              const interpretation =
                analysis.interpretation

              const overallScore =
                Number(
                  analysis.overall_score || 0
                )

              const semanticSimilarity =
                Number(
                  analysis.semantic_similarity ||
                    0
                )

              const skillCoverage =
                Number(
                  analysis.skill_coverage || 0
                )

              return (
                <div
                  className="aic-card p-4"
                  key={`${type}-${opportunity.id || item.id || index}`}
                >

                  {/* Opportunity header */}
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">

                    <div>

                      <span className="badge rounded-pill bg-primary-subtle text-primary text-capitalize px-3 py-2 mb-2">
                        {type}
                      </span>

                      <h2 className="h5 font-display fw-bold mb-1">
                        {title}
                      </h2>

                      <p className="text-secondary small mb-1">
                        <i className="bi bi-building me-2" />
                        {company}
                      </p>

                      <p className="text-secondary small mb-0">
                        <i className="bi bi-geo-alt me-2" />
                        {location}
                      </p>

                    </div>

                    <div className="text-md-end">

                      <p className="text-secondary small mb-1">
                        Overall Match
                      </p>

                      <p className="h2 font-display fw-bold mb-0">
                        {Math.round(
                          overallScore * 10
                        ) / 10}
                        %
                      </p>

                    </div>

                  </div>

                  {/* Scores */}
                  <div className="row g-3 mb-4">

                    <Score
                      label="Overall Match"
                      value={overallScore}
                      icon="bi-bullseye"
                    />

                    <Score
                      label="Semantic Similarity"
                      value={
                        semanticSimilarity * 100
                      }
                      icon="bi-diagram-3"
                    />

                    <Score
                      label="Skill Coverage"
                      value={
                        skillCoverage * 100
                      }
                      icon="bi-lightning-charge"
                    />

                  </div>

                  {/* Interpretation */}
                  <div className="border rounded-3 p-4 mb-4">

                    <div className="d-flex align-items-start gap-3">

                      <div className="text-primary">
                        <i className="bi bi-stars fs-5" />
                      </div>

                      <div>
                        <p className="text-secondary small mb-1">
                          AI Interpretation
                        </p>

                        <p className="fw-semibold mb-1">
                          {getInterpretationLabel(
                            interpretation
                          )}
                        </p>

                        <p className="text-secondary small mb-0">
                          {formatInterpretation(
                            interpretation
                          )}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Matching / Missing */}
                  <div className="row g-4">

                    {/* Matching */}
                    <div className="col-lg-6">

                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="bi bi-check-circle text-success" />

                        <h3 className="h6 fw-bold mb-0">
                          Matching Skills
                        </h3>

                        <span className="badge rounded-pill bg-success-subtle text-success ms-auto">
                          {matchingSkills.length}
                        </span>
                      </div>

                      {matchingSkills.length === 0 ? (
                        <EmptyState
                          description="No matching skills were identified."
                        />
                      ) : (
                        <div className="d-flex flex-wrap gap-2">

                          {matchingSkills.map(
                            (
                              skill,
                              skillIndex
                            ) => (
                              <span
                                key={`${skill}-${skillIndex}`}
                                className="badge rounded-pill bg-success-subtle text-success px-3 py-2 text-capitalize"
                              >
                                <i className="bi bi-check2 me-1" />
                                {skill}
                              </span>
                            )
                          )}

                        </div>
                      )}

                    </div>

                    {/* Missing */}
                    <div className="col-lg-6">

                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="bi bi-exclamation-circle text-danger" />

                        <h3 className="h6 fw-bold mb-0">
                          Skills to Improve
                        </h3>

                        <span className="badge rounded-pill bg-danger-subtle text-danger ms-auto">
                          {missingSkills.length}
                        </span>
                      </div>

                      {missingSkills.length === 0 ? (
                        <div className="border rounded-3 p-3">
                          <p className="text-success small mb-0">
                            <i className="bi bi-check-circle me-2" />
                            No missing skills identified
                            for this opportunity.
                          </p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2">

                          {missingSkills.map(
                            (
                              skill,
                              skillIndex
                            ) => (
                              <div
                                key={`${skill}-${skillIndex}`}
                                className="d-flex justify-content-between align-items-center border rounded-3 px-3 py-2"
                              >
                                <span className="small text-capitalize">
                                  {skill}
                                </span>

                                <span className="badge rounded-pill bg-danger-subtle text-danger">
                                  Priority
                                </span>
                              </div>
                            )
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                  {/* Learning Recommendations */}
                  {missingSkills.length >
                    0 && (
                    <div className="border rounded-3 p-4 mt-4">

                      <div className="d-flex align-items-start gap-3 mb-3">

                        <div className="text-primary">
                          <i className="bi bi-mortarboard fs-5" />
                        </div>

                        <div>
                          <h3 className="h6 fw-bold mb-1">
                            Learning Recommendations
                          </h3>

                          <p className="text-secondary small mb-0">
                            Focus on these skills to
                            improve your match with this
                            opportunity.
                          </p>
                        </div>

                      </div>

                      <div className="d-flex flex-column gap-3">

                        {missingSkills.map(
                          (
                            skill,
                            skillIndex
                          ) => (
                            <div
                              key={`${skill}-recommendation-${skillIndex}`}
                              className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-top pt-3"
                            >

                              <div>
                                <p className="small fw-semibold mb-1 text-capitalize">
                                  {skill}

                                  <span className="text-danger ms-2">
                                    High Priority
                                  </span>
                                </p>

                                <p className="text-secondary small mb-0">
                                  Learn the fundamentals,
                                  practice through projects,
                                  and build practical
                                  experience.
                                </p>
                              </div>

                              <button
                                type="button"
                                className="btn btn-sm btn-aic-primary flex-shrink-0"
                                onClick={() =>
                                  navigate(
                                    '/student/skill-assessment'
                                  )
                                }
                              >
                                <i className="bi bi-clipboard-check me-2" />
                                Take Assessment
                              </button>

                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                </div>
              )
            }
          )}

        </div>
      )}

    </div>
  )
}