import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecommendedOpportunities } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

function Score({ label, value }) {
  const numericValue = Number(value || 0)

  return (
    <div className="col-12 col-md-4">
      <div className="aic-card p-3 h-100">
        <p className="text-secondary small mb-1">{label}</p>

        <p className="h3 mb-0 font-display">
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

  const [opportunities, setOpportunities] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const loadSkillGap = async () => {
    setStatus('loading')
    setError('')

    try {
      const { data } = await getRecommendedOpportunities()

      const normalized = normalizeOpportunities(data)

      setOpportunities(normalized)
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
    loadSkillGap()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h4 font-display mb-1">
            Skill Gap
          </h1>

          <p className="text-secondary mb-0">
            Identify the skills you already have and the skills you need to
            improve for current career opportunities.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-aic-primary"
          onClick={loadSkillGap}
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? 'Analyzing…'
            : 'Refresh Analysis'}
        </button>
      </div>

      {/* AI Explanation */}
      <div className="aic-card p-4 mb-4">
        <div className="d-flex align-items-start gap-3">
          <div>
            <h2 className="h6 mb-1">
              AI Skill Gap Analysis
            </h2>

            <p className="text-secondary small mb-0">
              Your uploaded resume is automatically compared with active jobs
              and internships using semantic similarity and skill coverage
              analysis. No manual text entry is required.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {status === 'loading' && (
        <Loading
          label="Analyzing your resume against current opportunities…"
        />
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="aic-card mb-4">
          <EmptyState
            variant="error"
            description={error}
          />
        </div>
      )}

      {/* No opportunities */}
      {status === 'ready' && opportunities.length === 0 && (
        <div className="aic-card p-4">
          <EmptyState
            description="No active opportunities are available for AI skill-gap analysis."
          />
        </div>
      )}

      {/* Results */}
      {status === 'ready' && opportunities.length > 0 && (
        <div className="d-flex flex-column gap-4">

          {opportunities.map((item, index) => {
            const analysis = item.analysis || item
            const opportunity = item.opportunity || {}

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

            const matchingSkills = Array.isArray(
              analysis.matching_skills
            )
              ? analysis.matching_skills
              : []

            const missingSkills = Array.isArray(
              analysis.missing_skills
            )
              ? analysis.missing_skills
              : []

            const interpretation =
              analysis.interpretation

            const overallScore =
              Number(analysis.overall_score || 0)

            const semanticSimilarity =
              Number(analysis.semantic_similarity || 0)

            const skillCoverage =
              Number(analysis.skill_coverage || 0)

            return (
              <div
                className="aic-card p-4"
                key={`${type}-${opportunity.id || item.id || index}`}
              >

                {/* Opportunity Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">

                  <div>
                    <span className="aic-badge aic-badge-success text-capitalize mb-2">
                      {type}
                    </span>

                    <h2 className="h5 font-display mb-1">
                      {title}
                    </h2>

                    <p className="text-secondary small mb-1">
                      {company}
                    </p>

                    <p className="text-secondary small mb-0">
                      {location}
                    </p>
                  </div>

                  <div className="text-md-end">
                    <p className="text-secondary small mb-1">
                      Overall Match
                    </p>

                    <p className="h2 font-display mb-0">
                      {Math.round(overallScore * 10) / 10}%
                    </p>
                  </div>

                </div>

                {/* Scores */}
                <div className="row g-3 mb-4">

                  <Score
                    label="Overall Match"
                    value={overallScore}
                  />

                  <Score
                    label="Semantic Similarity"
                    value={semanticSimilarity * 100}
                  />

                  <Score
                    label="Skill Coverage"
                    value={skillCoverage * 100}
                  />

                </div>

                {/* Interpretation */}
                <div className="aic-card p-3 mb-4">

                  <p className="text-secondary small mb-1">
                    AI Interpretation
                  </p>

                  <p className="fw-semibold mb-1">
                    {getInterpretationLabel(interpretation)}
                  </p>

                  <p className="text-secondary small mb-0">
                    {formatInterpretation(interpretation)}
                  </p>

                </div>

                {/* Matching + Missing Skills */}
                <div className="row g-4">

                  {/* Matching */}
                  <div className="col-lg-6">

                    <h3 className="h6 mb-3">
                      Matching Skills
                    </h3>

                    {matchingSkills.length === 0 ? (
                      <EmptyState
                        description="No matching skills were identified."
                      />
                    ) : (
                      <div className="d-flex flex-wrap gap-2">

                        {matchingSkills.map(
                          (skill, skillIndex) => (
                            <span
                              key={`${skill}-${skillIndex}`}
                              className="aic-badge aic-badge-success text-capitalize"
                            >
                              ✓ {skill}
                            </span>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  {/* Missing */}
                  <div className="col-lg-6">

                    <h3 className="h6 mb-3">
                      Missing Skills to Improve
                    </h3>

                    {missingSkills.length === 0 ? (
                      <div className="aic-card p-3">
                        <p className="text-success small mb-0">
                          ✓ No missing skills identified for this
                          opportunity.
                        </p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">

                        {missingSkills.map(
                          (skill, skillIndex) => (
                            <div
                              key={`${skill}-${skillIndex}`}
                              className="d-flex justify-content-between align-items-center border-bottom pb-2"
                            >
                              <span className="text-capitalize">
                                {skill}
                              </span>

                              <span className="aic-badge aic-badge-danger">
                                High Priority
                              </span>
                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </div>

                {/* Learning Recommendations */}
                {missingSkills.length > 0 && (
                  <div className="aic-card p-4 mt-4">

                    <h3 className="h6 mb-3">
                      Learning Recommendations
                    </h3>

                    <div className="d-flex flex-column gap-3">

                      {missingSkills.map(
                        (skill, skillIndex) => (
                          <div
                            key={`${skill}-recommendation-${skillIndex}`}
                            className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                          >

                            <div>
                              <p className="small fw-semibold mb-1 text-capitalize">
                                {skill}
                                <span className="text-danger ms-2">
                                  High Priority
                                </span>
                              </p>

                              <p className="text-secondary small mb-0">
                                Learn the fundamentals, practice through
                                projects, and build practical experience
                                using this skill.
                              </p>
                            </div>

                            <button
                              type="button"
                              className="btn btn-sm btn-aic-primary"
                              onClick={() =>
                                navigate(
                                  '/student/skill-assessment'
                                )
                              }
                            >
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
          })}

        </div>
      )}
    </div>
  )
}