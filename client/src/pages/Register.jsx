import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Goa', 'Nagpur', 'Indore', 'Bhopal',
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.city)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/')
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: '20px' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>✈️</div>
          <h3 className="fw-800 mt-2 mb-0">Create account</h3>
          <p className="text-muted mt-1">Join TravelCompare — it's free</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="reg-name" className="form-label fw-700">
              <i className="bi bi-person me-1" style={{ color: '#667eea' }} />Full Name <span className="text-danger">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              name="name"
              className="form-control form-control-lg"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
              autoComplete="name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="reg-email" className="form-label fw-700">
              <i className="bi bi-envelope me-1" style={{ color: '#667eea' }} />Email <span className="text-danger">*</span>
            </label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-city" className="form-label fw-700">
              <i className="bi bi-geo-alt me-1" style={{ color: '#667eea' }} />Home City
            </label>
            <select
              id="reg-city"
              name="city"
              className="form-select form-select-lg"
              value={form.city}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
            >
              <option value="">Select your city (optional)</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="reg-password" className="form-label fw-700">
              <i className="bi bi-lock me-1" style={{ color: '#667eea' }} />Password <span className="text-danger">*</span>
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className="form-control form-control-lg"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
              autoComplete="new-password"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="reg-confirm" className="form-label fw-700">
              <i className="bi bi-lock-fill me-1" style={{ color: '#667eea' }} />Confirm Password <span className="text-danger">*</span>
            </label>
            <input
              id="reg-confirm"
              type="password"
              name="confirm"
              className="form-control form-control-lg"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
              autoComplete="new-password"
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
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Creating account…</>
              : <><i className="bi bi-person-plus me-2" />Sign Up Free</>
            }
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center mb-0 text-muted">
          Already have an account?{' '}
          <Link to="/login" className="fw-700" style={{ color: '#667eea' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
