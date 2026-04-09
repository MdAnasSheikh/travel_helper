import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import ResultCard from '../components/ResultCard'
import Chatbot from '../components/Chatbot'
import api from '../utils/api'

const capitalizeType = (type) =>
  type ? type.charAt(0).toUpperCase() + type.slice(1) : type

function computeAIScores(options) {
  const maxPrice = Math.max(...options.map(o => o.price))
  const maxDuration = Math.max(...options.map(o => o.duration))
  const maxCo2 = Math.max(...options.map(o => o.co2))

  const scored = options.map(o => {
    const priceScore = ((maxPrice - o.price) / (maxPrice || 1)) * 40
    const timeScore = ((maxDuration - o.duration) / (maxDuration || 1)) * 30
    const comfortScore = ((o.comfort - 1) / 4) * 15
    const ecoScore = ((maxCo2 - o.co2) / (maxCo2 || 1)) * 10
    const aiScore = Math.max(1, Math.round(priceScore + timeScore + comfortScore + ecoScore + 5))
    return { ...o, aiScore }
  })

  const bestScore = Math.max(...scored.map(o => o.aiScore))
  return scored.map(o => ({ ...o, isBest: o.aiScore === bestScore }))
}

function getMockResults(from, to) {
  const seed = (from + to).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const v = (s, range, min = 0) => min + ((s * 1637 + 113) % range)

  const trainPrice = 400 + v(seed, 400, 0)
  const trainDur = 420 + v(seed * 3, 360, 0)
  const flightPrice = 3500 + v(seed * 7, 3000, 0)
  const busPrice = 600 + v(seed * 11, 800, 0)
  const taxiPrice = 4500 + v(seed * 13, 4000, 0)

  const results = [
    {
      type: 'train',
      company: 'Indian Railways',
      number: `${12000 + v(seed, 900)} Exp`,
      class: '3A Sleeper',
      price: trainPrice,
      duration: trainDur,
      comfort: 3.5,
      co2: 16 + v(seed, 10),
      departure: '06:30',
      arrival: `${Math.floor(6.5 + trainDur / 60)}:${String(Math.round((trainDur % 60))).padStart(2, '0')}`,
    },
    {
      type: 'flight',
      company: ['IndiGo', 'Air India', 'SpiceJet', 'Vistara'][v(seed, 4)],
      number: `${['6E', 'AI', 'SG', 'UK'][v(seed, 4)]}-${100 + v(seed * 5, 900)}`,
      price: flightPrice,
      duration: 75 + v(seed * 2, 60),
      comfort: 4.2,
      co2: 100 + v(seed, 50),
      departure: '10:00',
      arrival: '11:15',
    },
    {
      type: 'bus',
      company: ['Volvo AC Sleeper', 'SRS Travels', 'RedBus AC'][v(seed, 3)],
      price: busPrice,
      duration: trainDur + 60 + v(seed * 4, 120),
      comfort: 3.0,
      co2: 30 + v(seed, 15),
      departure: '21:00',
      arrival: '07:30',
    },
    {
      type: 'taxi',
      company: ['Ola Outstation', 'Uber Intercity', 'Zoom Car'][v(seed, 3)],
      price: taxiPrice,
      duration: trainDur - 30 + v(seed * 6, 120),
      comfort: 4.0,
      co2: 45 + v(seed, 20),
      departure: 'Flexible',
      arrival: 'Flexible',
    },
  ]

  return computeAIScores(results)
}

function getExplanation(option, allOptions) {
  const cheapest = allOptions.reduce((a, b) => (a.price < b.price ? a : b))
  const fastest = allOptions.reduce((a, b) => (a.duration < b.duration ? a : b))
  const greenest = allOptions.reduce((a, b) => (a.co2 < b.co2 ? a : b))

  const parts = []
  if (option === cheapest) parts.push('most affordable option')
  if (option === fastest) parts.push('fastest route')
  if (option === greenest) parts.push('most eco-friendly')

  if (option.isBest) {
    return `Best overall balance of price (₹${option.price.toLocaleString('en-IN')}), travel time, and comfort.`
  }
  if (parts.length > 0) {
    return `This is the ${parts.join(' and ')} on this route.`
  }
  return `Scores ${option.aiScore}% — a solid choice for flexible travellers.`
}

export default function Results() {
  const [params] = useSearchParams()
  const from = params.get('from') || 'Delhi'
  const to = params.get('to') || 'Mumbai'
  const date = params.get('date') || new Date().toISOString().slice(0, 10)

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [mockMode, setMockMode] = useState(false)
  const [whyModal, setWhyModal] = useState(null)

  useEffect(() => {
    setLoading(true)
    setMockMode(false)

    api.get(`/search/options?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`)
      .then(res => {
        const data = res.data?.options || res.data?.results || res.data || []
        if (Array.isArray(data) && data.length > 0) {
          setResults(computeAIScores(data))
        } else {
          throw new Error('empty')
        }
      })
      .catch((err) => {
        const mock = getMockResults(from, to)
        setResults(mock)
        setMockMode(true)
        // Only show "backend not running" if it was a network error (no response)
        if (!err.status) {
          toast.info('🔌 Backend not running — showing estimated mock results. Start the server for live data.', { autoClose: 6000 })
        } else {
          toast.info('⚠️ Could not load live results — showing estimated mock data.', { autoClose: 5000 })
        }
      })
      .finally(() => setLoading(false))
  }, [from, to, date])

  const bestOption = results.find(r => r.isBest)

  const formatDuration = (mins) => {
    if (!mins) return 'N/A'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
        <div>
          <h2 className="fw-800 mb-1">
            {from} <i className="bi bi-arrow-right fs-5" /> {to}
          </h2>
          <div className="text-muted">
            <i className="bi bi-calendar3 me-1" />{date}
            {mockMode ? (
              <span className="badge bg-warning text-dark ms-2 fw-600" style={{ fontSize: '0.72rem' }}>
                Mock Data
              </span>
            ) : !loading && (
              <span className="badge bg-success ms-2 fw-600" style={{ fontSize: '0.72rem' }}>
                <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }} />Live
              </span>
            )}
          </div>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-animated btn-sm fw-600" style={{ borderRadius: '20px' }}>
          <i className="bi bi-arrow-left me-1" />New Search
        </Link>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
            <p className="text-muted fw-600">Fetching best options…</p>
          </div>
        </div>
      ) : (
        <>
          {bestOption && (
            <div className="ai-best-panel p-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-success fw-700 px-3 py-1 badge-pulse" style={{ borderRadius: '20px' }}>
                  <i className="bi bi-trophy-fill me-1" />AI Best Pick
                </span>
                <span className="fw-800 fs-5">{bestOption.company}</span>
                <span className="text-muted fw-600">({capitalizeType(bestOption.type)})</span>
              </div>
              <p className="mb-2 fw-600">{getExplanation(bestOption, results)}</p>
              <div className="d-flex flex-wrap gap-3">
                <span className="fw-800 text-success fs-5">
                  ₹{bestOption.price?.toLocaleString('en-IN')}
                </span>
                <span className="text-muted fw-600 d-flex align-items-center gap-1">
                  <i className="bi bi-clock" />{formatDuration(bestOption.duration)}
                </span>
                <span className="text-muted fw-600 d-flex align-items-center gap-1">
                  <i className="bi bi-leaf text-success" />{bestOption.co2} kg CO₂
                </span>
                <span className="fw-700 text-primary">AI Score: {bestOption.aiScore}%</span>
              </div>
            </div>
          )}

          <div className="row g-3">
            {results.map((opt, idx) => (
              <div className="col-12 col-md-6 col-xl-6" key={idx}>
                <ResultCard
                  option={opt}
                  from={from}
                  to={to}
                  date={date}
                  onWhyThis={o => setWhyModal(o)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {whyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setWhyModal(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-800">
                  <i className="bi bi-lightbulb-fill text-warning me-2" />
                  Why {whyModal.company}?
                </h5>
                <button className="btn-close" onClick={() => setWhyModal(null)} />
              </div>
              <div className="modal-body pt-2">
                <p className="fw-600 mb-3">{getExplanation(whyModal, results)}</p>
                <div className="row g-2 text-center">
                  {[
                    { label: 'Price', value: `₹${whyModal.price?.toLocaleString('en-IN')}`, icon: 'cash-coin', color: '#198754' },
                    { label: 'Duration', value: formatDuration(whyModal.duration), icon: 'clock', color: '#0d6efd' },
                    { label: 'Comfort', value: `${whyModal.comfort}/5`, icon: 'star', color: '#ffc107' },
                    { label: 'CO₂', value: `${whyModal.co2} kg`, icon: 'leaf', color: '#20c997' },
                    { label: 'AI Score', value: `${whyModal.aiScore}%`, icon: 'cpu', color: '#764ba2' },
                  ].map(s => (
                    <div className="col-4" key={s.label}>
                      <div className="p-2 rounded-3" style={{ background: `${s.color}12` }}>
                        <i className={`bi bi-${s.icon} d-block mb-1`} style={{ color: s.color, fontSize: '1.2rem' }} />
                        <div className="fw-800" style={{ color: s.color }}>{s.value}</div>
                        <small className="text-muted">{s.label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-gradient btn-animated fw-700 w-100" style={{ borderRadius: '20px' }} onClick={() => setWhyModal(null)}>
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot results={results} from={from} to={to} />
    </div>
  )
}
