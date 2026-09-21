import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'

const ROLE_HOME = {
  student: '/student/dashboard',
  academician: '/academician/dashboard',
  company: '/company/dashboard',
  admin: '/admin/dashboard',
}

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!form.email) next.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const userInfo = await login(form)
      toast.success('Welcome back!')
      const from = location.state?.from?.pathname
      navigate(from || ROLE_HOME[userInfo.role] || '/', { replace: true })
    } catch (err) {
      if (err.isNetworkError) {
        toast.error('Cannot reach the server. Is the backend running on http://127.0.0.1:8000?')
      } else if (err.response?.status === 401) {
        toast.error('Incorrect email or password.')
      } else {
        toast.error(err.response?.data?.detail || 'Login failed. Please try again.')
      }
    }
  }

  return (
    <div>
      <h1 className="h4 font-display mb-1">Log in</h1>
      <p className="text-secondary small mb-4">Welcome back to the Academia&ndash;Industry Portal.</p>

      <form onSubmit={handleSubmit} noValidate>
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

        <div className="mb-3">
          <label htmlFor="password" className="form-label small fw-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            value={form.password}
            autoComplete="current-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>

        <button type="submit" className="btn btn-aic-primary w-100 mb-3" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-center small text-secondary mb-0">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}
