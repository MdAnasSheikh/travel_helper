import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tc-notifs') ?? 'true') } catch { return true }
  })
  const [changingPw, setChangingPw] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const handleNotifToggle = () => {
    const next = !notifs
    setNotifs(next)
    localStorage.setItem('tc-notifs', JSON.stringify(next))
    toast.info(`Notifications ${next ? 'enabled' : 'disabled'}`)
  }

  const handlePwChange = async e => {
    e.preventDefault()
    if (!pwForm.current || !pwForm.next) { toast.error('Fill in all fields'); return }
    if (pwForm.next.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/password', { currentPassword: pwForm.current, newPassword: pwForm.next })
      toast.success('Password changed successfully!')
      setChangingPw(false)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <h2 className="fw-800 mb-1">Settings</h2>
      <p className="text-muted mb-4">Customize your TravelCompare experience</p>

      <div className="d-flex flex-column gap-3">
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-800 mb-1">
                <i className={`bi bi-${theme === 'light' ? 'moon-stars' : 'sun'} me-2`} style={{ color: '#667eea' }} />
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </h6>
              <small className="text-muted">
                Currently: <span className="fw-700">{theme === 'light' ? 'Light' : 'Dark'}</span> theme
              </small>
            </div>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="theme-toggle"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-800 mb-1">
                <i className="bi bi-bell me-2" style={{ color: '#667eea' }} />Notifications
              </h6>
              <small className="text-muted">Toast alerts and booking confirmations</small>
            </div>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="notif-toggle"
                checked={notifs}
                onChange={handleNotifToggle}
                style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {user && (
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="fw-800 mb-0">
                <i className="bi bi-shield-lock me-2" style={{ color: '#667eea' }} />Change Password
              </h6>
              <button
                className="btn btn-sm btn-outline-primary fw-600"
                style={{ borderRadius: '12px' }}
                onClick={() => setChangingPw(c => !c)}
              >
                {changingPw ? 'Cancel' : 'Change'}
              </button>
            </div>
            {changingPw && (
              <form onSubmit={handlePwChange} noValidate className="mt-2">
                {[
                  { id: 'pw-current', name: 'current', label: 'Current Password', auto: 'current-password' },
                  { id: 'pw-next', name: 'next', label: 'New Password', auto: 'new-password' },
                  { id: 'pw-confirm', name: 'confirm', label: 'Confirm New Password', auto: 'new-password' },
                ].map(f => (
                  <div className="mb-3" key={f.id}>
                    <label htmlFor={f.id} className="form-label fw-600 mb-1">{f.label}</label>
                    <input
                      id={f.id}
                      type="password"
                      name={f.name}
                      className="form-control"
                      value={pwForm[f.name]}
                      onChange={e => setPwForm(p => ({ ...p, [f.name]: e.target.value }))}
                      autoComplete={f.auto}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  className="btn btn-gradient btn-animated fw-700 btn-sm"
                  disabled={savingPw}
                  style={{ borderRadius: '20px' }}
                >
                  {savingPw ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
          <h6 className="fw-800 mb-2">
            <i className="bi bi-info-circle me-2" style={{ color: '#667eea' }} />App Info
          </h6>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span>Version</span><span className="fw-600">1.0.0</span>
            </div>
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span>Stack</span><span className="fw-600">React + Vite + Bootstrap 5</span>
            </div>
            <div className="d-flex justify-content-between py-1">
              <span>Backend</span><span className="fw-600">Node.js + Express + MySQL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
