import { useState } from 'react'
import { analyzeResume } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

function Score({ label, value }) {
  return (
    <div className="col-12 col-md-4">
      <div className="aic-card p-3 h-100">
        <p className="text-secondary small mb-1">{label}</p>
        <p className="h3 mb-0 font-display">{value}%</p>
      </div>
    </div>
  )
}

export default function StudentSkillAssessment() {
  const [resumeText, setResumeText] = useState('')
  const [opportunityText, setOpportunityText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const { data } = await analyzeResume(resumeText, opportunityText)
      setAnalysis(data)
      setStatus('ready')
    } catch (requestError) {
      setAnalysis(null)
      setStatus('error')
      setError(requestError.response?.data?.detail || 'We could not analyze this information. Please try again.')
    }
  }

  return (
    <div>
      <h1 className="h4 font-display mb-1">AI Skill Analysis</h1>
      <p className="text-secondary mb-4">Compare your resume with an opportunity to identify strengths and skill gaps.</p>

      <div className="aic-card p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="resume-text" className="form-label small fw-semibold">Resume text</label>
            <textarea
              id="resume-text"
              className="form-control"
              rows="9"
              value={resumeText}
              required
              placeholder="Paste your resume text here"
              onChange={(event) => setResumeText(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="opportunity-text" className="form-label small fw-semibold">Opportunity or job description</label>
            <textarea
              id="opportunity-text"
              className="form-control"
              rows="9"
              value={opportunityText}
              required
              placeholder="Paste the opportunity or job description here"
              onChange={(event) => setOpportunityText(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-aic-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Analyzing…' : 'Analyze resume'}
          </button>
        </form>
      </div>

      {status === 'loading' && <Loading label="Analyzing your resume…" />}

      {status === 'error' && (
        <div className="aic-card mb-4">
          <EmptyState variant="error" description={error} />
        </div>
      )}

      {status === 'ready' && analysis && (
        <div>
          <div className="row g-3 mb-4">
            <Score label="Overall match" value={analysis.overall_score} />
            <Score label="Semantic similarity" value={Math.round(analysis.semantic_similarity * 1000) / 10} />
            <Score label="Skill coverage" value={Math.round(analysis.skill_coverage * 1000) / 10} />
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <div className="aic-card p-4 h-100">
                <h2 className="h6 mb-3">Matching skills</h2>
                {analysis.matching_skills.length === 0 ? (
                  <EmptyState description="No matching skills were identified." />
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {analysis.matching_skills.map((skill) => (
                      <span key={skill} className="aic-badge aic-badge-success text-capitalize">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="aic-card p-4 h-100">
                <h2 className="h6 mb-3">Missing skills</h2>
                {analysis.missing_skills.length === 0 ? (
                  <EmptyState description="No missing skills were identified." />
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {analysis.missing_skills.map((skill) => (
                      <span key={skill} className="aic-badge aic-badge-danger text-capitalize">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="aic-card p-4 mt-3">
            <h2 className="h6 mb-3">Match interpretation</h2>
            <p className="mb-1 fw-semibold">{analysis.interpretation.label}</p>
            <p className="text-secondary small mb-0">{analysis.interpretation.description}</p>
          </div>

          <div className="aic-card p-4 mt-3">
            <h2 className="h6 mb-3">AI suggestions</h2>
            {analysis.suggestions.length === 0 ? (
              <EmptyState description="No suggestions were returned for this analysis." />
            ) : (
              <div className="d-flex flex-column gap-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={`${suggestion.category}-${index}`}>
                    <p className="small fw-semibold mb-1">{suggestion.category} <span className="text-secondary">({suggestion.priority})</span></p>
                    <p className="text-secondary small mb-0">{suggestion.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
