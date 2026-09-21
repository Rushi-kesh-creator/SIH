import { useEffect, useState } from 'react'
import { getRecommendedOpportunities } from '../../api/studentApi'

const RECOMMENDED_CACHE_KEY =
  'student_recommended_opportunities'

export default function StudentRecommended() {
  const [opportunities, setOpportunities] = useState([])
  const [analysisInfo, setAnalysisInfo] = useState(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Load cached data first
  useEffect(() => {
    const cached = sessionStorage.getItem(
      RECOMMENDED_CACHE_KEY
    )

    if (cached) {
      try {
        const parsed = JSON.parse(cached)

        setOpportunities(
          parsed.opportunities || []
        )

        setAnalysisInfo(parsed)

        setLoading(false)
        return
      } catch (error) {
        console.error(
          'Invalid recommendation cache:',
          error
        )

        sessionStorage.removeItem(
          RECOMMENDED_CACHE_KEY
        )
      }
    }

    loadRecommendations()
  }, [])

  // Fetch recommendations
  const loadRecommendations = async (
    isRefresh = false
  ) => {
    try {
      setError('')

      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response =
        await getRecommendedOpportunities()

      console.log(
        'Recommended Opportunities API:',
        response.data
      )

      const result = response.data

      const newOpportunities =
        result?.opportunities || []

      setOpportunities(newOpportunities)
      setAnalysisInfo(result)

      // Cache complete API response
      sessionStorage.setItem(
        RECOMMENDED_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error(
        'Failed to load recommendations:',
        err
      )

      setError(
        err.response?.data?.detail ||
          'Unable to load recommended opportunities.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadRecommendations(true)
  }

  const getScoreClass = (score) => {
    if (score >= 70) {
      return 'text-success'
    }

    if (score >= 50) {
      return 'text-warning'
    }

    return 'text-danger'
  }

  const getProgressClass = (score) => {
    if (score >= 70) {
      return 'bg-success'
    }

    if (score >= 50) {
      return 'bg-warning'
    }

    return 'bg-danger'
  }

  const getTypeIcon = (type) => {
    if (type === 'internship') {
      return 'bi-mortarboard-fill'
    }

    return 'bi-briefcase-fill'
  }

  // Loading
  if (loading) {
    return (
      <div className="container-fluid py-4">

        <div className="text-center py-5">

          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3 mb-0">
            Finding opportunities for you...
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER ================= */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">

        <div>

          <div className="d-flex align-items-center gap-2 mb-1">

            <div className="aic-page-icon">
              <i className="bi bi-stars"></i>
            </div>

            <h2 className="font-display fw-bold mb-0">
              Recommended Opportunities
            </h2>

          </div>

          <p className="text-muted mb-0">
            AI-powered opportunities matched with
            your profile, resume and skills.
          </p>

        </div>

        <button
          type="button"
          className="btn btn-aic-outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <i
            className={`bi ${
              refreshing
                ? 'bi-arrow-repeat'
                : 'bi-arrow-clockwise'
            } me-2`}
          ></i>

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">

          <i className="bi bi-exclamation-circle-fill me-2"></i>

          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={handleRefresh}
          >
            Try Again
          </button>

        </div>
      )}

      {/* ================= SUMMARY ================= */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon">
                <i className="bi bi-search"></i>
              </div>

              <div>

                <div className="text-muted small">
                  Opportunities Analyzed
                </div>

                <div className="fs-4 fw-bold">
                  {analysisInfo?.opportunities_analyzed ??
                    opportunities.length}
                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="col-12 col-md-4">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon">
                <i className="bi bi-file-earmark-person"></i>
              </div>

              <div>

                <div className="text-muted small">
                  Resume Analysis
                </div>

                <div className="fs-6 fw-bold">

                  {analysisInfo?.resume_text_available
                    ? 'Available'
                    : 'Not Available'}

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="col-12 col-md-4">

          <div className="aic-card h-100">

            <div className="d-flex align-items-center gap-3">

              <div className="aic-stat-icon">
                <i className="bi bi-person-check"></i>
              </div>

              <div>

                <div className="text-muted small">
                  Profile Data
                </div>

                <div className="fs-6 fw-bold">

                  {analysisInfo?.profile_text_available
                    ? 'Available'
                    : 'Incomplete'}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= EMPTY ================= */}
      {opportunities.length === 0 ? (

        <div className="aic-card text-center py-5">

          <div className="display-5 text-muted mb-3">
            <i className="bi bi-search"></i>
          </div>

          <h5 className="fw-bold">
            No recommendations available
          </h5>

          <p className="text-muted mb-3">
            No matching opportunities were found.
          </p>

          <button
            type="button"
            className="btn btn-aic-primary"
            onClick={handleRefresh}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Analyze Again
          </button>

        </div>

      ) : (

        /* ================= OPPORTUNITIES ================= */
        <div className="row g-4">

          {opportunities.map(
            (opportunity, index) => {

              const score = Number(
                opportunity.overall_score || 0
              )

              return (
                <div
                  className="col-12"
                  key={`${opportunity.type}-${opportunity.id}-${index}`}
                >

                  <div className="aic-card">

                    {/* Top */}
                    <div className="d-flex flex-wrap justify-content-between gap-3">

                      <div className="d-flex gap-3">

                        <div className="aic-stat-icon flex-shrink-0">

                          <i
                            className={`bi ${getTypeIcon(
                              opportunity.type
                            )}`}
                          ></i>

                        </div>

                        <div>

                          <div className="d-flex align-items-center gap-2 flex-wrap">

                            <h5 className="fw-bold mb-0">
                              {opportunity.title}
                            </h5>

                            <span className="badge bg-light text-dark text-capitalize">
                              {opportunity.type}
                            </span>

                          </div>

                          {opportunity.company?.name && (
                            <div className="text-muted mt-1">

                              <i className="bi bi-building me-1"></i>

                              {opportunity.company.name}

                            </div>
                          )}

                        </div>

                      </div>

                      {/* Score */}
                      <div className="text-end">

                        <div className="text-muted small">
                          Match Score
                        </div>

                        <div
                          className={`fs-2 fw-bold ${getScoreClass(
                            score
                          )}`}
                        >
                          {score.toFixed(1)}%
                        </div>

                      </div>

                    </div>

                    {/* Location / Salary */}
                    <div className="d-flex flex-wrap gap-3 text-muted small mt-3">

                      {opportunity.location && (
                        <span>
                          <i className="bi bi-geo-alt me-1"></i>
                          {opportunity.location}
                        </span>
                      )}

                      {opportunity.salary && (
                        <span>
                          <i className="bi bi-currency-rupee me-1"></i>
                          {opportunity.salary}
                        </span>
                      )}

                      {opportunity.duration && (
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          {opportunity.duration}
                        </span>
                      )}

                      {opportunity.stipend && (
                        <span>
                          <i className="bi bi-wallet2 me-1"></i>
                          {opportunity.stipend}
                        </span>
                      )}

                    </div>

                    {/* Description */}
                    {opportunity.description && (
                      <p className="text-muted mt-3 mb-3">
                        {opportunity.description}
                      </p>
                    )}

                    {/* Match progress */}
                    <div className="mb-4">

                      <div className="d-flex justify-content-between mb-1">

                        <small className="text-muted">
                          Overall Match
                        </small>

                        <small className="fw-semibold">
                          {score.toFixed(1)}%
                        </small>

                      </div>

                      <div
                        className="progress"
                        style={{ height: '8px' }}
                      >

                        <div
                          className={`progress-bar ${getProgressClass(
                            score
                          )}`}
                          role="progressbar"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, score)
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* Matching Skills */}
                    {opportunity.matching_skills
                      ?.length > 0 && (

                      <div className="mb-3">

                        <div className="fw-semibold mb-2">

                          <i className="bi bi-check-circle-fill text-success me-2"></i>

                          Matching Skills

                        </div>

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

                      </div>

                    )}

                    {/* Missing Skills */}
                    {opportunity.missing_skills
                      ?.length > 0 && (

                      <div className="mb-3">

                        <div className="fw-semibold mb-2">

                          <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>

                          Skills to Develop

                        </div>

                        <div className="d-flex flex-wrap gap-2">

                          {opportunity.missing_skills.map(
                            (skill) => (

                              <span
                                key={skill}
                                className="badge bg-warning-subtle text-dark"
                              >
                                {skill}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                    )}

                    {/* AI Interpretation */}
                    {opportunity.interpretation && (

                      <div className="alert alert-light border mt-3 mb-3">

                        <div className="fw-semibold mb-1">

                          <i className="bi bi-robot me-2"></i>

                          AI Analysis

                        </div>

                        <div className="small text-muted">

                          <strong>
                            {
                              opportunity.interpretation
                                .label
                            }
                          </strong>

                          {' — '}

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

                      <div className="mt-3">

                        <div className="fw-semibold mb-2">

                          <i className="bi bi-lightbulb me-2"></i>

                          Suggestions

                        </div>

                        <div className="row g-2">

                          {opportunity.suggestions
                            .slice(0, 3)
                            .map(
                              (suggestion, suggestionIndex) => (

                                <div
                                  className="col-12 col-md-4"
                                  key={suggestionIndex}
                                >

                                  <div className="border rounded p-3 h-100">

                                    <div className="small fw-semibold mb-1">

                                      {
                                        suggestion.category
                                      }

                                    </div>

                                    <div className="small text-muted">

                                      {
                                        suggestion.suggestion
                                      }

                                    </div>

                                  </div>

                                </div>

                              )
                            )}

                        </div>

                      </div>

                    )}

                    {/* Company website */}
                    {opportunity.company?.website && (

                      <div className="mt-3">

                        <a
                          href={
                            opportunity.company.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-aic-outline btn-sm"
                        >
                          <i className="bi bi-box-arrow-up-right me-1"></i>
                          Company Website
                        </a>

                      </div>

                    )}

                  </div>

                </div>
              )
            }
          )}

        </div>

      )}

    </div>
  )
}