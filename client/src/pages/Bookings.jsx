import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../utils/api'

const TRANSPORT_ICONS = { train: '🚂', flight: '✈️', bus: '🚌', taxi: '🚕' }

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const fetchBookings = () => {
    setLoading(true)
    api.get('/bookings')
      .then(res => setBookings(res.data?.bookings || res.data || []))
      .catch(err => {
        if (err.status === 401) {
          navigate('/login', { replace: true })
        } else {
          toast.error(err.message)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/bookings/${id}`)
      setBookings(b => b.filter(bk => bk.id !== id))
      toast.success('Booking removed')
    } catch (err) {
      if (err.status === 401) {
        navigate('/login', { replace: true })
      } else {
        toast.error(err.message)
      }
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
          <p className="text-muted fw-600">Loading bookings…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <h2 className="fw-800 mb-1">My Bookings</h2>
      <p className="text-muted mb-4">Your travel history and upcoming trips</p>

      {bookings.length === 0 ? (
        <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem' }} className="mb-3">🎫</div>
          <h5 className="fw-800 mb-2">No bookings yet</h5>
          <p className="text-muted mb-0">Search for travel options and book your first trip!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map(bk => (
            <div key={bk.id} className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
              <div className="d-flex align-items-start gap-3">
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                  {TRANSPORT_ICONS[bk.transport?.toLowerCase()] || '🚌'}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className="fw-800">{bk.from_city}</span>
                    <i className="bi bi-arrow-right" />
                    <span className="fw-800">{bk.to_city}</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-700" style={{ borderRadius: '8px' }}>
                      {bk.transport}
                    </span>
                  </div>
                  <div className="text-muted fw-600 d-flex flex-wrap gap-3">
                    {bk.company && <span><i className="bi bi-building me-1" />{bk.company}</span>}
                    {bk.date && <span><i className="bi bi-calendar3 me-1" />{bk.date}</span>}
                    {bk.price && (
                      <span className="text-success fw-700">
                        ₹{Number(bk.price).toLocaleString('en-IN')}
                      </span>
                    )}
                    {bk.duration && <span><i className="bi bi-clock me-1" />{bk.duration}</span>}
                  </div>
                  {bk.booking_url && (
                    <div className="mt-2">
                      <button
                        className="btn btn-outline-primary btn-animated btn-sm fw-600"
                        style={{ borderRadius: '12px' }}
                        onClick={() => window.open(bk.booking_url, '_blank', 'noopener,noreferrer')}
                      >
                        <i className="bi bi-box-arrow-up-right me-1" />Open Provider Site
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-outline-danger btn-animated btn-sm fw-600"
                  onClick={() => handleDelete(bk.id)}
                  disabled={deleting === bk.id}
                  style={{ borderRadius: '12px', flexShrink: 0 }}
                >
                  {deleting === bk.id
                    ? <span className="spinner-border spinner-border-sm" role="status" />
                    : <i className="bi bi-trash" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
