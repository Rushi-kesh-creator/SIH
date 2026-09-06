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

function getPriority() {
  return 'High'
}

export default function StudentSkillGap() {
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
      <h1 className="h4 font-display mb-1">Skill Gap</h1>
      <p className="text-secondary mb-4">See which opportunity skills match your resume and which ones need improvement.</p>

      <div className="aic-card p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="skill-gap-resume" className="form-label small fw-semibold">Resume text</label>
            <textarea
              id="skill-gap-resume"
              className="form-control"
              rows="8"
              value={resumeText}
              required
              placeholder="Paste your resume text here"
              onChange={(event) => setResumeText(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="skill-gap-opportunity" className="form-label small fw-semibold">Opportunity or job description</label>
            <textarea
              id="skill-gap-opportunity"
              className="form-control"
              rows="8"
              value={opportunityText}
              required
              placeholder="Paste the opportunity or job description here"
              onChange={(event) => setOpportunityText(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-aic-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Finding skill gaps…' : 'Analyze skill gap'}
          </button>
        </form>
      </div>

      {status === 'loading' && <Loading label="Analyzing your skill gap…" />}

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

          <div className="aic-card p-4 mb-4">
            <h2 className="h6 mb-3">Skill match summary</h2>
            <div className="row g-3 small">
              <div className="col-6 col-md-3">
                <span className="text-secondary d-block">Matching skills</span>
                <span className="h5 mb-0">{analysis.matching_skills.length}</span>
              </div>
              <div className="col-6 col-md-3">
                <span className="text-secondary d-block">Missing skills</span>
                <span className="h5 mb-0">{analysis.missing_skills.length}</span>
              </div>
              <div className="col-12 col-md-6">
                <span className="text-secondary d-block">Priority rule</span>
                <span>Missing required skills are marked High priority.</span>
              </div>
            </div>
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
                <h2 className="h6 mb-3">Missing skills to improve</h2>
                {analysis.missing_skills.length === 0 ? (
                  <EmptyState description="No missing skills were identified for this opportunity." />
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {analysis.missing_skills.map((skill) => (
                      <div key={skill} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-capitalize">{skill}</span>
                        <span className="aic-badge aic-badge-danger">{getPriority()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {analysis.missing_skills.length > 0 && (
            <div className="aic-card p-4 mt-3">
              <h2 className="h6 mb-3">Learning recommendations</h2>
              <div className="d-flex flex-column gap-3">
                {analysis.missing_skills.map((skill) => (
                  <div key={skill}>
                    <p className="small fw-semibold mb-1 text-capitalize">{skill} <span className="text-secondary">({getPriority()})</span></p>
                    <p className="text-secondary small mb-0">Learn the fundamentals, then practice through projects and build a practical project.</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
