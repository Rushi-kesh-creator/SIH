import { useEffect, useState } from 'react'
import { getStudentDashboard } from '../../api/studentApi'
import { useAuth } from '../../context/AuthContext.jsx'
import StatCard from '../../components/StatCard.jsx'
import Loading from '../../components/Loading.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorStatus, setErrorStatus] = useState(null)

  useEffect(() => {
    let cancelled = false

    getStudentDashboard()
      .then(({ data }) => {
        if (cancelled) return
        setDashboard(data)
        setStatus(data?.student && data?.counts ? 'ready' : 'empty')
      })
      .catch((error) => {
        if (cancelled) return
        setErrorStatus(error.response?.status || null)
        setStatus(error.response?.status === 404 ? 'empty' : 'error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const student = dashboard?.student
  const counts = dashboard?.counts || {}
  const recentApplications = dashboard?.recent_applications || []
  const profileFields = student ? [student.college, student.degree, student.branch, student.cgpa] : []
  const profileFieldsFilled = profileFields.filter((value) => value !== null && value !== '' && value !== undefined).length
  const profileFieldsTotal = profileFields.length || 1
  const completionPct = Math.round((profileFieldsFilled / profileFieldsTotal) * 100)
  const errorDescription = errorStatus === 403
    ? 'You do not have access to the student dashboard.'
    : errorStatus === 401
      ? 'Your session has expired. Please sign in again.'
      : "We couldn't load your dashboard. Please refresh the page."

  return (
    <div>
      <h1 className="h4 font-display mb-1">Welcome{student?.name ? `, ${student.name}` : ''}</h1>
      <p className="text-secondary mb-4">{user?.email}</p>

      {status === 'loading' && <Loading label="Loading your dashboard…" />}

      {status === 'error' && (
        <div className="aic-card mb-4">
          <EmptyState variant="error" description={errorDescription} />
        </div>
      )}

      {status === 'empty' && (
        <div className="aic-card mb-4">
          <EmptyState
            description={errorStatus === 404 ? 'Complete your student profile to see dashboard data.' : undefined}
          />
        </div>
      )}

      {status === 'ready' && dashboard && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-person-check" label="Profile completion" value={`${completionPct}%`} accent="indigo" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-lightning-charge" label="Skills logged" value={counts.skills ?? 0} accent="teal" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-send-check" label="Applications" value={counts.applications ?? 0} accent="amber" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard icon="bi-award" label="Certifications" value={counts.certifications ?? 0} accent="green" />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <div className="aic-card p-4 h-100">
                <h2 className="h6 mb-3">Student profile</h2>
                <div className="row g-3 small">
                  <div className="col-6">
                    <span className="text-secondary d-block">College</span>
                    <span>{student.college || '—'}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-block">Degree</span>
                    <span>{student.degree || '—'}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-block">Branch</span>
                    <span>{student.branch || '—'}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-block">CGPA</span>
                    <span>{student.cgpa ?? '—'}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-block">Projects</span>
                    <span>{counts.projects ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="aic-card p-4 h-100">
                <h2 className="h6 mb-3">Application summary</h2>
                <div className="row g-3 small mb-4">
                  <div className="col-6">
                    <span className="text-secondary d-block">Pending</span>
                    <span className="h5 mb-0">{counts.pending_applications ?? 0}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-block">Accepted</span>
                    <span className="h5 mb-0">{counts.accepted_applications ?? 0}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-block">Rejected</span>
                    <span className="h5 mb-0">{counts.rejected_applications ?? 0}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-block">Internships / jobs</span>
                    <span className="h5 mb-0">{counts.internship_applications ?? 0} / {counts.job_applications ?? 0}</span>
                  </div>
                </div>
                <h3 className="h6 mb-3">Recent applications</h3>
                {recentApplications.length === 0 ? (
                  <EmptyState description="Your recent applications will appear here." />
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <div>
                          <div className="small fw-semibold">{application.title || 'Untitled opportunity'}</div>
                          <div className="text-secondary small text-capitalize">{application.type}</div>
                        </div>
                        <span className="small text-capitalize">{application.status || 'Unknown'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}