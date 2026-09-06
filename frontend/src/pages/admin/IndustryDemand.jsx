import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export default function AdminIndustryDemand() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDemand()
  }, [])

  const loadDemand = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/admin/industry-demand')
      setData(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in again as administrator.')
      } else if (err.response?.status === 403) {
        setError('Admin access required.')
      } else {
        setError('Unable to load industry demand.')
      }
    } finally {
      setLoading(false)
    }
  }

  const topSkills = useMemo(() => {
    return data?.skill_demand?.slice(0, 10) || []
  }, [data])

  const topLocations = useMemo(() => {
    return data?.location_demand?.slice(0, 10) || []
  }, [data])

  const topCompanies = useMemo(() => {
    return data?.company_demand?.slice(0, 10) || []
  }, [data])

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="text-muted mt-3">
            Loading industry demand...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { summary } = data

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Industry Demand</h2>
          <p className="text-muted mb-0">
            Analyze current industry requirements across jobs and internships.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadDemand}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="row g-4 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Active Jobs
              </div>
              <h3 className="fw-bold">
                {summary.active_jobs}
              </h3>
              <small className="text-muted">
                Currently available jobs
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Active Internships
              </div>
              <h3 className="fw-bold">
                {summary.active_internships}
              </h3>
              <small className="text-muted">
                Currently available internships
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Skills Demanded
              </div>
              <h3 className="fw-bold">
                {summary.unique_skills_demanded}
              </h3>
              <small className="text-muted">
                Unique skills requested
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Active Opportunities
              </div>
              <h3 className="fw-bold">
                {summary.total_active_opportunities}
              </h3>
              <small className="text-muted">
                Jobs + internships
              </small>
            </div>
          </div>
        </div>

      </div>

      <div className="row g-4">

        {/* Skills */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h5 className="fw-bold mb-1">
                Most Demanded Skills
              </h5>

              <p className="text-muted small mb-4">
                Skills requested by active jobs and internships.
              </p>

              {topSkills.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No active opportunity skill data available.
                </div>
              ) : (
                topSkills.map((skill) => (
                  <div className="mb-3" key={skill.name}>

                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">
                        {skill.name}
                      </span>

                      <span className="text-muted">
                        {skill.total}{' '}
                        {skill.total === 1
                          ? 'opportunity'
                          : 'opportunities'}
                      </span>
                    </div>

                    <div
                      className="progress"
                      style={{ height: '8px' }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `${
                            (skill.total /
                              Math.max(1, topSkills[0].total)) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <div className="small text-muted mt-1">
                      Jobs: {skill.jobs} · Internships: {skill.internships}
                    </div>

                  </div>
                ))
              )}

            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h5 className="fw-bold mb-1">
                Demand by Location
              </h5>

              <p className="text-muted small mb-4">
                Active opportunities by location.
              </p>

              {topLocations.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No location data available.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Jobs</th>
                        <th>Internships</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {topLocations.map((location) => (
                        <tr key={location.location}>
                          <td className="fw-semibold">
                            {location.location}
                          </td>
                          <td>{location.jobs}</td>
                          <td>{location.internships}</td>
                          <td>
                            <span className="badge text-bg-primary">
                              {location.total}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Companies */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">

          <h5 className="fw-bold mb-1">
            Industry / Company Demand
          </h5>

          <p className="text-muted small mb-4">
            Companies with active jobs and internship opportunities.
          </p>

          {topCompanies.length === 0 ? (
            <div className="text-center text-muted py-4">
              No company demand data available.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">

                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Jobs</th>
                    <th>Internships</th>
                    <th>Total Opportunities</th>
                  </tr>
                </thead>

                <tbody>
                  {topCompanies.map((company) => (
                    <tr key={company.company}>
                      <td className="fw-semibold">
                        {company.company}
                      </td>

                      <td>{company.jobs}</td>

                      <td>{company.internships}</td>

                      <td>
                        <span className="badge text-bg-primary">
                          {company.total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}