import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import Loading from '../../components/Loading'

const ADMIN_INDUSTRY_DEMAND_CACHE_KEY =
  'admin_industry_demand'

export default function AdminIndustryDemand() {
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        ADMIN_INDUSTRY_DEMAND_CACHE_KEY
      )

      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(
        ADMIN_INDUSTRY_DEMAND_CACHE_KEY
      )
    } catch {
      return true
    }
  })

  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const loadDemand = async ({ force = false } = {}) => {
    try {
      if (force) {
        setRefreshing(true)
      } else if (!data) {
        setLoading(true)
      }

      setError('')

      const response = await api.get(
        '/admin/industry-demand'
      )

      const result = response.data

      setData(result)

      sessionStorage.setItem(
        ADMIN_INDUSTRY_DEMAND_CACHE_KEY,
        JSON.stringify(result)
      )
    } catch (err) {
      console.error(
        'Admin industry demand error:',
        err
      )

      if (err.response?.status === 401) {
        setError(
          'Please log in again as administrator.'
        )
      } else if (err.response?.status === 403) {
        setError('Admin access required.')
      } else {
        setError(
          err.response?.data?.detail ||
          'Unable to load industry demand.'
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const hasCache = sessionStorage.getItem(
      ADMIN_INDUSTRY_DEMAND_CACHE_KEY
    )

    if (!hasCache) {
      loadDemand()
    }
  }, [])

  const topSkills = useMemo(() => {
    return data?.skill_demand?.slice(0, 10) || []
  }, [data])

  const topLocations = useMemo(() => {
    return data?.location_demand?.slice(0, 10) || []
  }, [data])

  const filteredCompanies = useMemo(() => {
    const companies = data?.company_demand || []

    const query = search.trim().toLowerCase()

    if (!query) {
      return companies.slice(0, 10)
    }

    return companies
      .filter((company) =>
        company.company
          ?.toString()
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 10)
  }, [data, search])

  const maxSkillDemand = Math.max(
    1,
    topSkills[0]?.total || 0
  )

  const maxLocationDemand = Math.max(
    1,
    topLocations[0]?.total || 0
  )

  const maxCompanyDemand = Math.max(
    1,
    filteredCompanies[0]?.total || 0
  )

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loading />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="container-fluid py-4">
        <div className="aic-card p-4">
          <div className="text-center py-4">

            <div className="aic-page-icon mx-auto mb-3 bg-danger-subtle text-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <h5 className="fw-bold mb-2">
              Unable to load industry demand
            </h5>

            <p className="text-muted mb-4">
              {error}
            </p>

            <button
              className="btn btn-aic-primary"
              onClick={() => loadDemand()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>

          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const summary = data.summary || {}

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

        <div className="d-flex align-items-center gap-3">

          <div className="aic-page-icon bg-primary-subtle text-primary">
            <i className="bi bi-graph-up-arrow"></i>
          </div>

          <div>
            <h2 className="font-display fw-bold mb-1">
              Industry Demand
            </h2>

            <p className="text-muted mb-0">
              Analyze current industry requirements across jobs and internships.
            </p>
          </div>

        </div>

        <button
          className="btn btn-aic-outline"
          onClick={() =>
            loadDemand({ force: true })
          }
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

      {/* Refresh Error */}
      {error && data && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        {/* Active Jobs */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active Jobs
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.active_jobs ?? 0}
                </h3>

                <small className="text-muted">
                  Currently available jobs
                </small>
              </div>

              <div className="aic-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-briefcase"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Active Internships */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active Internships
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.active_internships ?? 0}
                </h3>

                <small className="text-muted">
                  Currently available internships
                </small>
              </div>

              <div className="aic-stat-icon bg-success-subtle text-success">
                <i className="bi bi-mortarboard"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Skills Demanded */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Skills Demanded
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.unique_skills_demanded ?? 0}
                </h3>

                <small className="text-muted">
                  Unique skills requested
                </small>
              </div>

              <div className="aic-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-lightbulb"></i>
              </div>

            </div>

          </div>
        </div>

        {/* Active Opportunities */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="aic-card p-3 h-100">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <p className="text-muted small mb-2">
                  Active Opportunities
                </p>

                <h3 className="font-display fw-bold mb-1">
                  {summary.total_active_opportunities ?? 0}
                </h3>

                <small className="text-muted">
                  Jobs + internships
                </small>
              </div>

              <div className="aic-stat-icon bg-info-subtle text-info">
                <i className="bi bi-grid"></i>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Skills + Locations */}
      <div className="row g-4">

        {/* Skills */}
        <div className="col-12 col-xl-7">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <h5 className="fw-bold mb-1">
                Most Demanded Skills
              </h5>

              <p className="text-muted small mb-0">
                Skills requested by active jobs and internships.
              </p>

            </div>

            <div className="p-4">

              {topSkills.length === 0 ? (

                <div className="text-center text-muted py-4">
                  <i className="bi bi-lightbulb fs-2 d-block mb-2"></i>
                  No active opportunity skill data available.
                </div>

              ) : (

                topSkills.map((skill, index) => {

                  const percentage = Math.min(
                    100,
                    (skill.total /
                      maxSkillDemand) *
                      100
                  )

                  return (
                    <div
                      className="mb-4"
                      key={skill.name}
                    >

                      <div className="d-flex justify-content-between align-items-center mb-2">

                        <div className="d-flex align-items-center gap-2">

                          <span className="text-muted small">
                            {index + 1}
                          </span>

                          <span className="fw-semibold">
                            {skill.name}
                          </span>

                        </div>

                        <span className="text-muted small">
                          {skill.total}{' '}
                          {skill.total === 1
                            ? 'opportunity'
                            : 'opportunities'}
                        </span>

                      </div>

                      <div
                        className="progress"
                        style={{
                          height: '8px',
                        }}
                      >
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <div className="small text-muted mt-2">
                        Jobs: {skill.jobs ?? 0}
                        {' · '}
                        Internships:{' '}
                        {skill.internships ?? 0}
                      </div>

                    </div>
                  )
                })

              )}

            </div>

          </div>

        </div>

        {/* Locations */}
        <div className="col-12 col-xl-5">

          <div className="aic-card h-100">

            <div className="p-4 border-bottom">

              <h5 className="fw-bold mb-1">
                Demand by Location
              </h5>

              <p className="text-muted small mb-0">
                Active opportunities by location.
              </p>

            </div>

            <div className="p-4">

              {topLocations.length === 0 ? (

                <div className="text-center text-muted py-4">
                  <i className="bi bi-geo-alt fs-2 d-block mb-2"></i>
                  No location data available.
                </div>

              ) : (

                <div>

                  {topLocations.map(
                    (location, index) => {

                      const percentage =
                        Math.min(
                          100,
                          (location.total /
                            maxLocationDemand) *
                            100
                        )

                      return (
                        <div
                          className="mb-4"
                          key={
                            location.location
                          }
                        >

                          <div className="d-flex justify-content-between align-items-center mb-2">

                            <div className="d-flex align-items-center gap-2">

                              <span className="text-muted small">
                                {index + 1}
                              </span>

                              <span className="fw-semibold">
                                <i className="bi bi-geo-alt me-1 text-muted"></i>
                                {location.location}
                              </span>

                            </div>

                            <span className="badge text-bg-primary">
                              {location.total}
                            </span>

                          </div>

                          <div
                            className="progress mb-2"
                            style={{
                              height: '7px',
                            }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <div className="small text-muted">
                            Jobs: {location.jobs ?? 0}
                            {' · '}
                            Internships:{' '}
                            {location.internships ?? 0}
                          </div>

                        </div>
                      )
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* Companies */}
      <div className="aic-card mt-4">

        <div className="p-4 border-bottom">

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

            <div>

              <h5 className="fw-bold mb-1">
                Industry / Company Demand
              </h5>

              <p className="text-muted small mb-0">
                Companies with active jobs and internship opportunities.
              </p>

            </div>

            <div className="text-muted small">
              Showing {filteredCompanies.length} companies
            </div>

          </div>

        </div>

        {/* Search */}
        <div className="p-4 border-bottom">

          <div className="row">

            <div className="col-12 col-lg-5">

              <label className="form-label fw-semibold">
                Search Company
              </label>

              <div className="input-group">

                <span className="input-group-text bg-body">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search company..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setSearch('')
                    }
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>

        {filteredCompanies.length === 0 ? (

          <div className="text-center text-muted py-5">

            <i className="bi bi-building fs-2 d-block mb-2"></i>

            <h6 className="fw-semibold">
              No company demand data
            </h6>

            <p className="small mb-0">
              Try a different company name.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead>
                <tr>

                  <th className="ps-4">
                    Company
                  </th>

                  <th>
                    Jobs
                  </th>

                  <th>
                    Internships
                  </th>

                  <th>
                    Total Opportunities
                  </th>

                  <th className="pe-4">
                    Demand
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredCompanies.map(
                  (company) => {

                    const percentage =
                      Math.min(
                        100,
                        (company.total /
                          maxCompanyDemand) *
                          100
                      )

                    return (
                      <tr
                        key={company.company}
                      >

                        <td className="ps-4">

                          <div className="d-flex align-items-center gap-2">

                            <div
                              className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                              }}
                            >
                              <i className="bi bi-building"></i>
                            </div>

                            <span className="fw-semibold">
                              {company.company}
                            </span>

                          </div>

                        </td>

                        <td>
                          {company.jobs ?? 0}
                        </td>

                        <td>
                          {company.internships ?? 0}
                        </td>

                        <td>

                          <span className="badge text-bg-primary">
                            {company.total ?? 0}
                          </span>

                        </td>

                        <td className="pe-4">

                          <div
                            className="progress"
                            style={{
                              width: '120px',
                              height: '7px',
                            }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  )
}