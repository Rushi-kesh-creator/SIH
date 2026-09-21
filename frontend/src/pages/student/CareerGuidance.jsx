import { useEffect, useState } from 'react'
import { getRecommendedOpportunities } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const RECOMMENDATIONS_CACHE_KEY =
  'student_recommended_opportunities'

export default function StudentCareerGuidance() {
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        RECOMMENDATIONS_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        RECOMMENDATIONS_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadCareerGuidance = async (
    forceRefresh = false
  ) => {
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(
          RECOMMENDATIONS_CACHE_KEY
        )

        if (cached) {
          setData(JSON.parse(cached))
          setLoading(false)
          return
        }
      } catch {
        // Continue with API request.
      }
    }

    try {
      setError('')

      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response =
        await getRecommendedOpportunities()

      const recommendationData =
        response.data || {}

      setData(recommendationData)

      sessionStorage.setItem(
        RECOMMENDATIONS_CACHE_KEY,
        JSON.stringify(recommendationData)
      )
    } catch (err) {
      console.error(
        'Failed to load career guidance:',
        err
      )

      setError(
        err.response?.data?.detail ||
          'Unable to load career recommendations.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadCareerGuidance()
  }, [])

  if (loading) {
    return (
      <Loading
        label="Analyzing your career opportunities…"
        fullPage
      />
    )
  }

  if (error) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <div className="text-uppercase small fw-semibold text-primary mb-1">
              AI Career Guidance
            </div>

            <h1 className="h4 font-display mb-1">
              Career Guidance
            </h1>

            <p className="text-secondary mb-0">
              Personalized opportunity analysis based on
              your profile and resume.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-aic-outline"
            onClick={() => loadCareerGuidance(true)}
            disabled={refreshing}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Try Again
          </button>
        </div>

        <div className="aic-card p-4">
          <div className="text-danger mb-2">
            <i className="bi bi-exclamation-circle fs-4" />
          </div>

          <h2 className="h6 fw-semibold">
            Could not load career guidance
          </h2>

          <p className="text-secondary mb-0">
            {error}
          </p>
        </div>
      </div>
    )
  }

  const opportunities =
    data?.opportunities || []

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="text-uppercase small fw-semibold text-primary mb-1">
            AI Career Guidance
          </div>

          <h1 className="h4 font-display mb-1">
            Career Guidance
          </h1>

          <p className="text-secondary mb-0">
            AI-powered recommendations based on your
            profile, skills and resume.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-aic-outline"
          onClick={() => loadCareerGuidance(true)}
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
            ? 'Analyzing…'
            : 'Refresh Analysis'}
        </button>
      </div>

      {/* AI Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="aic-card p-4 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 46,
                  height: 46,
                  background:
                    'rgba(13, 110, 253, 0.1)',
                }}
              >
                <i className="bi bi-briefcase text-primary fs-5" />
              </div>

              <div>
                <div className="small text-secondary">
                  Opportunities Analyzed
                </div>

                <div className="fs-4 fw-bold">
                  {data?.opportunities_analyzed ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="aic-card p-4 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 46,
                  height: 46,
                  background:
                    'rgba(25, 135, 84, 0.1)',
                }}
              >
                <i className="bi bi-file-earmark-person text-success fs-5" />
              </div>

              <div>
                <div className="small text-secondary">
                  Resume
                </div>

                <div className="fw-bold">
                  {data?.resume_text_available
                    ? 'Available'
                    : 'Not Available'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="aic-card p-4 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 46,
                  height: 46,
                  background:
                    'rgba(13, 202, 240, 0.1)',
                }}
              >
                <i className="bi bi-person-check text-info fs-5" />
              </div>

              <div>
                <div className="small text-secondary">
                  Profile Data
                </div>

                <div className="fw-bold">
                  {data?.profile_text_available
                    ? 'Available'
                    : 'Incomplete'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="aic-card p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h2 className="h6 fw-semibold mb-1">
              <i className="bi bi-stars me-2" />
              Recommended Opportunities
            </h2>

            <p className="small text-secondary mb-0">
              Opportunities ranked using AI resume and
              skill matching.
            </p>
          </div>

          <span className="aic-badge">
            <i className="bi bi-stars me-1" />
            AI Powered
          </span>
        </div>

        {opportunities.length === 0 ? (
          <EmptyState
            title="No recommendations available"
            description="Add more skills or upload your resume to get personalized recommendations."
          />
        ) : (
          <div className="row g-4">
            {opportunities.map((opportunity) => {
              const score = Math.min(
                Math.max(
                  Number(
                    opportunity.overall_score || 0
                  ),
                  0
                ),
                100
              )

              let scoreClass = 'text-danger'
              let progressClass = 'bg-danger'

              if (score >= 70) {
                scoreClass = 'text-success'
                progressClass = 'bg-success'
              } else if (score >= 50) {
                scoreClass = 'text-warning'
                progressClass = 'bg-warning'
              }

              return (
                <div
                  className="col-lg-6"
                  key={`${opportunity.type}-${opportunity.id}`}
                >
                  <div className="border rounded-3 p-4 h-100 d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <span
                          className={`badge ${
                            opportunity.type === 'job'
                              ? 'bg-primary-subtle text-primary'
                              : 'bg-success-subtle text-success'
                          } mb-2`}
                        >
                          {opportunity.type === 'job'
                            ? 'Job'
                            : 'Internship'}
                        </span>

                        <h3 className="h6 fw-bold mb-1">
                          {opportunity.title}
                        </h3>

                        {opportunity.company?.name && (
                          <p className="small text-secondary mb-0">
                            <i className="bi bi-building me-1" />
                            {opportunity.company.name}
                          </p>
                        )}
                      </div>

                      <div className="text-end flex-shrink-0">
                        <div
                          className={`fs-3 fw-bold ${scoreClass}`}
                        >
                          {score.toFixed(1)}
                        </div>

                        <small className="text-secondary">
                          Match Score
                        </small>
                      </div>
                    </div>

                    {/* Score */}
                    <div
                      className="progress mt-3 mb-3"
                      style={{ height: 7 }}
                    >
                      <div
                        className={`progress-bar ${progressClass}`}
                        role="progressbar"
                        style={{
                          width: `${score}%`,
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="d-flex flex-wrap gap-3 small text-secondary mb-3">
                      {opportunity.location && (
                        <span>
                          <i className="bi bi-geo-alt me-1" />
                          {opportunity.location}
                        </span>
                      )}

                      {opportunity.salary && (
                        <span>
                          <i className="bi bi-currency-rupee me-1" />
                          {opportunity.salary}
                        </span>
                      )}

                      {opportunity.stipend && (
                        <span>
                          <i className="bi bi-wallet2 me-1" />
                          {opportunity.stipend}
                        </span>
                      )}

                      {opportunity.duration && (
                        <span>
                          <i className="bi bi-clock me-1" />
                          {opportunity.duration}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {opportunity.description && (
                      <p className="small text-secondary mb-3">
                        {opportunity.description}
                      </p>
                    )}

                    {/* Matching Skills */}
                    <div className="mb-3">
                      <h4 className="small fw-semibold mb-2">
                        <i className="bi bi-check-circle text-success me-2" />
                        Matching Skills
                      </h4>

                      {opportunity.matching_skills
                        ?.length ? (
                        <div className="d-flex flex-wrap gap-2">
                          {opportunity.matching_skills.map(
                            (skill) => (
                              <span
                                key={skill}
                                className="badge bg-success-subtle text-success"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="small text-secondary">
                          No matching skills detected.
                        </span>
                      )}
                    </div>

                    {/* Missing Skills */}
                    {opportunity.missing_skills
                      ?.length > 0 && (
                      <div className="mb-3">
                        <h4 className="small fw-semibold mb-2">
                          <i className="bi bi-exclamation-triangle text-warning me-2" />
                          Skills to Improve
                        </h4>

                        <div className="d-flex flex-wrap gap-2">
                          {opportunity.missing_skills.map(
                            (skill) => (
                              <span
                                key={skill}
                                className="badge bg-warning-subtle text-warning-emphasis"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interpretation */}
                    {opportunity.interpretation && (
                      <div className="border rounded-3 p-3 mb-3">
                        <div className="small fw-semibold mb-1">
                          <i className="bi bi-robot me-2" />
                          {opportunity.interpretation.label}
                        </div>

                        <div className="small text-secondary">
                          {
                            opportunity.interpretation
                              .description
                          }
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {opportunity.suggestions
                      ?.length > 0 && (
                      <div className="mb-3">
                        <h4 className="small fw-semibold mb-2">
                          <i className="bi bi-lightbulb me-2" />
                          AI Suggestions
                        </h4>

                        {opportunity.suggestions
                          .slice(0, 3)
                          .map(
                            (suggestion, index) => (
                              <div
                                className="small border-start border-3 ps-3 mb-2"
                                key={`${suggestion.category}-${index}`}
                              >
                                <div className="fw-semibold">
                                  {suggestion.category}
                                </div>

                                <div className="text-secondary">
                                  {
                                    suggestion.suggestion
                                  }
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    )}

                    {/* Action */}
                    <div className="mt-auto pt-3 border-top">
                      {opportunity.company
                        ?.website ? (
                        <a
                          href={
                            opportunity.company.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-aic-outline btn-sm"
                        >
                          <i className="bi bi-box-arrow-up-right me-2" />
                          View Opportunity
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-aic-outline btn-sm"
                          disabled
                        >
                          Opportunity Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}