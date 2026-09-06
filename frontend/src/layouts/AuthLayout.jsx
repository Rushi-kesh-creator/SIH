import { Link, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'var(--aic-indigo-tint)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-5">
            <Link to="/" className="d-flex align-items-center gap-2 justify-content-center mb-4 text-decoration-none">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{ width: 36, height: 36, background: 'var(--aic-indigo)', color: '#fff' }}
              >
                <i className="bi bi-diagram-3-fill" />
              </span>
              <span className="fw-bold font-display" style={{ color: 'var(--aic-ink)' }}>
                Academia–Industry Portal
              </span>
            </Link>
            <div className="aic-card p-4 p-md-5">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
