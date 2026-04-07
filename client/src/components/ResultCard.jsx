import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import api from '../utils/api'

const TRANSPORT_CONFIG = {
  train: { icon: '🚂', label: 'Train', iconClass: 'icon-train', color: '#0d6efd' },
  flight: { icon: '✈️', label: 'Flight', iconClass: 'icon-flight', color: '#667eea' },
  bus: { icon: '🚌', label: 'Bus', iconClass: 'icon-bus', color: '#198754' },
  taxi: { icon: '🚕', label: 'Taxi', iconClass: 'icon-taxi', color: '#ffc107' }
}

function ScoreCircle({ score }) {
  const cls = score >= 70 ? 'score-high' : score >= 45 ? 'score-medium' : 'score-low'
  return (
    <div className={`score-circle ${cls}`}>
      {Math.round(score)}%
    </div>
  )
}

export default function ResultCard({ option, from, to, date, onWhyThis }) {
  const { user } = useAuth()
  const [booking, setBooking] = useState(false)
  const t = TRANSPORT_CONFIG[option.type] || TRANSPORT_CONFIG.bus

  const handleBook = async () => {
    if (!user) {
      toast.info('Please login to book')
      return
    }
    setBooking(true)
    try {
      await api.post('/bookings', {
        from_city: from,
        to_city: to,
        transport: option.type,
        price: option.price,
        date: date,
        company: option.company || option.name || t.label,
        duration: formatDuration(option.duration)
      })
      toast.success(`Booking confirmed! ${t.icon} ${option.company || option.name || t.label}`)
    } catch (err) {
      toast.error(err.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  const handleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <div className={`card border-0 shadow-sm mb-3 ${option.isBest ? 'best-card' : ''}`} style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        {option.isBest && (
          <div className="mb-3">
            <span className="badge bg-success badge-pulse fw-700 px-3 py-1" style={{ borderRadius: '20px', fontSize: '0.75rem' }}>
              <i className="bi bi-trophy-fill me-1" />AI Best Pick
            </span>
          </div>
        )}

        <div className="d-flex align-items-start gap-3">
          <div className={`transport-icon-wrap ${t.iconClass}`}>
            <span style={{ fontSize: '1.6rem' }}>{t.icon}</span>
          </div>

          <div className="flex-grow-1 min-w-0">
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h5 className="mb-0 fw-800" style={{ fontSize: '1.05rem' }}>
                {option.company || option.name || `${t.label} Service`}
              </h5>
              {option.number && (
                <span className="badge bg-primary bg-opacity-10 text-primary fw-600" style={{ fontSize: '0.75rem', borderRadius: '8px' }}>
                  {option.number}
                </span>
              )}
              <span className="badge" style={{
                background: `${t.color}18`,
                color: t.color,
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {t.label}
              </span>
            </div>

            {option.class && (
              <small className="text-muted fw-600 d-block mb-2">
                <i className="bi bi-star-half me-1" />{option.class}
              </small>
            )}

            <div className="row g-2 mt-1">
              <div className="col-6 col-sm-3">
                <div className="fw-800 fs-5" style={{ color: t.color }}>{formatPrice(option.price)}</div>
                <small className="text-muted fw-600">Price</small>
              </div>
              <div className="col-6 col-sm-3">
                <div className="fw-700">{formatDuration(option.duration)}</div>
                <small className="text-muted fw-600">Duration</small>
              </div>
              <div className="col-6 col-sm-3">
                <div className="fw-700 d-flex align-items-center gap-1">
                  <span style={{ color: '#ffc107' }}>{'★'.repeat(Math.round(option.comfort || 3))}</span>
                  <span className="text-muted fw-600" style={{ fontSize: '0.85rem' }}>{option.comfort}/5</span>
                </div>
                <small className="text-muted fw-600">Comfort</small>
              </div>
              <div className="col-6 col-sm-3">
                <div className="fw-700 text-success">{option.co2 || 'N/A'} kg</div>
                <small className="text-muted fw-600">CO₂</small>
              </div>
            </div>

            {option.departure && option.arrival && (
              <div className="d-flex align-items-center gap-3 mt-3">
                <div className="text-center">
                  <div className="fw-800">{option.departure}</div>
                  <small className="text-muted">Depart</small>
                </div>
                <div className="flex-grow-1 d-flex align-items-center gap-1">
                  <div style={{ height: 2, flex: 1, background: '#dee2e6' }} />
                  <small className="text-muted fw-600 px-1">{formatDuration(option.duration)}</small>
                  <div style={{ height: 2, flex: 1, background: '#dee2e6' }} />
                </div>
                <div className="text-center">
                  <div className="fw-800">{option.arrival}</div>
                  <small className="text-muted">Arrive</small>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex flex-column align-items-center gap-2 ms-2">
            <ScoreCircle score={option.aiScore || 0} />
            <small className="text-muted fw-700 text-center" style={{ fontSize: '0.65rem', lineHeight: 1.2 }}>AI<br />Score</small>
          </div>
        </div>

        <div className="d-flex gap-2 mt-4 flex-wrap">
          <button
            className="btn btn-gradient btn-animated btn-sm fw-700 flex-grow-1"
            onClick={handleBook}
            disabled={booking}
            style={{ borderRadius: '20px', minWidth: 110 }}
          >
            {booking ? (
              <><span className="spinner-border spinner-border-sm me-1" />Booking...</>
            ) : (
              <><i className="bi bi-bookmark-check me-1" />Book Now</>
            )}
          </button>
          <button
            className="btn btn-outline-secondary btn-animated btn-sm fw-600"
            onClick={handleMaps}
            style={{ borderRadius: '20px' }}
          >
            <i className="bi bi-map me-1" />Maps
          </button>
          <button
            className="btn btn-outline-info btn-animated btn-sm fw-600"
            onClick={() => onWhyThis && onWhyThis(option)}
            style={{ borderRadius: '20px' }}
          >
            <i className="bi bi-lightbulb me-1" />Why this?
          </button>
        </div>
      </div>
    </div>
  )
}
