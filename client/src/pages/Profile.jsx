import { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Goa', 'Nagpur', 'Indore', 'Bhopal',
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    city: user?.city || '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', { name: form.name, email: form.email, city: form.city })
      updateUser(res.data.user)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '20px' }}>
        <div className="text-center mb-4">
          <div className="profile-avatar mx-auto mb-3">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h4 className="fw-800 mb-0">{user?.name || 'User'}</h4>
          <p className="text-muted mb-0">{user?.email || ''}</p>
          {user?.city && (
            <p className="text-muted mb-0">
              <i className="bi bi-geo-alt me-1" />{user.city}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="profile-name" className="form-label fw-700">
              <i className="bi bi-person me-1" style={{ color: '#667eea' }} />Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              name="name"
              className="form-control form-control-lg"
              value={form.name}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="profile-email" className="form-label fw-700">
              <i className="bi bi-envelope me-1" style={{ color: '#667eea' }} />Email
            </label>
            <input
              id="profile-email"
              type="email"
              name="email"
              className="form-control form-control-lg"
              value={form.email}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="profile-city" className="form-label fw-700">
              <i className="bi bi-geo-alt me-1" style={{ color: '#667eea' }} />Home City
            </label>
            <select
              id="profile-city"
              name="city"
              className="form-select form-select-lg"
              value={form.city}
              onChange={handleChange}
              style={{ borderRadius: '10px' }}
            >
              <option value="">Select your city</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-gradient btn-animated fw-800 w-100 btn-lg"
            disabled={saving}
            style={{ borderRadius: '30px' }}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving…</>
              : <><i className="bi bi-check2-circle me-2" />Save Changes</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
