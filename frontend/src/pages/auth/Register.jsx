import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'academician', label: 'Academician' },
  { value: 'industry', label: 'Industry' },
  { value: 'company', label: 'Company' },
]

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!form.full_name.trim()) next.full_name = 'Full name is required.'
    if (!form.email) next.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      // NOTE: field names here (full_name, email, password, role) should
      // be confirmed against the backend's request schema at
      // http://127.0.0.1:8000/docs before final integration.
      const { confirmPassword, ...payload } = form
      await register(payload)
      toast.success('Account created. Please log in.')
      navigate('/login')
    } catch (err) {
      if (err.isNetworkError) {
        toast.error('Cannot reach the server. Is the backend running on http://127.0.0.1:8000?')
      } else if (err.response?.status === 409) {
        toast.error('An account with this email already exists.')
      } else {
        toast.error(err.response?.data?.detail || 'Registration failed. Please try again.')
      }
    }
  }

  return (
    <div>
      <h1 className="h4 font-display mb-1">Create your account</h1>
      <p className="text-secondary small mb-4">Join as a student, academician, or industry partner.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="role" className="form-label small fw-semibold">
            I am registering as
          </label>
          <select
            id="role"
            className="form-select"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="full_name" className="form-label small fw-semibold">
            Full name
          </label>
          <input
            id="full_name"
            type="text"
            className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label small fw-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={form.email}
            autoComplete="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="row">
          <div className="col-6 mb-3">
            <label htmlFor="password" className="form-label small fw-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={form.password}
              autoComplete="new-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          <div className="col-6 mb-3">
            <label htmlFor="confirmPassword" className="form-label small fw-semibold">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              value={form.confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-aic-primary w-100 mb-3" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center small text-secondary mb-0">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
