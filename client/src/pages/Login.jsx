import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Login() {
  const { login } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 👋')
      navigate('/')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: '20px' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>✈️</div>
          <h3 className="fw-800 mt-2 mb-0">Welcome back</h3>
          <p className="text-muted mt-1">Sign in to your TravelCompare account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label fw-700">
              <i className="bi bi-envelope me-1" style={{ color: '#667eea' }} />Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control form-control-lg"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="login-password" className="form-label fw-700">
              <i className="bi bi-lock me-1" style={{ color: '#667eea' }} />Password
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-control form-control-lg"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />{error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-gradient btn-animated fw-800 w-100 btn-lg"
            disabled={loading}
            style={{ borderRadius: '30px' }}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing in…</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
            }
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center mb-0 text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="fw-700" style={{ color: '#667eea' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
