import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from 'react-toastify'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <nav className="navbar navbar-expand-lg shadow-sm sticky-top" style={{ background: theme === 'dark' ? '#0d0d1f' : 'white' }}>
      <div className="container">
        <Link className="navbar-brand fw-900 d-flex align-items-center gap-2" to="/" style={{ color: theme === 'dark' ? '#fff' : '#1a1a2e', fontSize: '1.35rem' }}>
          <span style={{ fontSize: '1.5rem' }}>✈️</span>
          <span className="fw-800" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TravelCompare
          </span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item">
              <Link className="nav-link fw-600" to="/" style={{ color: theme === 'dark' ? '#e0e0e0' : '#1a1a2e' }}>
                <i className="bi bi-house me-1" />Home
              </Link>
            </li>

            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-600" to="/bookings" style={{ color: theme === 'dark' ? '#e0e0e0' : '#1a1a2e' }}>
                    <i className="bi bi-ticket-perforated me-1" />Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-600" to="/profile" style={{ color: theme === 'dark' ? '#e0e0e0' : '#1a1a2e' }}>
                    <i className="bi bi-person me-1" />Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-600" to="/settings" style={{ color: theme === 'dark' ? '#e0e0e0' : '#1a1a2e' }}>
                    <i className="bi bi-gear me-1" />Settings
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <button
                className="btn btn-link nav-link fw-600 border-0 p-2"
                onClick={toggleTheme}
                style={{ color: theme === 'dark' ? '#e0e0e0' : '#1a1a2e' }}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <i className={`bi bi-${theme === 'light' ? 'moon-stars' : 'sun'} fs-5`} />
              </button>
            </li>

            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-gradient btn-animated btn-sm d-flex align-items-center gap-2 dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ borderRadius: '20px', padding: '6px 16px' }}
                >
                  <span className="rounded-circle d-flex align-items-center justify-content-center fw-800"
                    style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="d-none d-lg-inline">{user.name?.split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2" />Profile</Link></li>
                  <li><Link className="dropdown-item" to="/bookings"><i className="bi bi-ticket-perforated me-2" />Bookings</Link></li>
                  <li><Link className="dropdown-item" to="/settings"><i className="bi bi-gear me-2" />Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2" />Logout</button></li>
                </ul>
              </li>
            ) : (
              <li className="nav-item d-flex gap-2">
                <Link className="btn btn-outline-primary btn-animated btn-sm fw-700" to="/login" style={{ borderRadius: '20px' }}>Login</Link>
                <Link className="btn btn-gradient btn-animated btn-sm fw-700" to="/register" style={{ borderRadius: '20px' }}>Sign Up</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
