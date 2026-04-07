import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Agra', 'Nashik', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Ranchi',
  'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh',
  'Guwahati', 'Solapur', 'Mysore', 'Thiruvananthapuram', 'Kochi', 'Bhubaneswar',
  'Dehradun', 'Shimla', 'Manali', 'Goa', 'Udaipur', 'Ajmer', 'Nainital', 'Haridwar',
  'Rishikesh', 'Mathura', 'Amritsar', 'Jammu', 'Leh', 'Jodhpur', 'Pushkar', 'Puri',
  'Darjeeling', 'Shillong', 'Imphal', 'Aizawl', 'Kohima', 'Itanagar', 'Gangtok'
]

function CityInput({ label, value, onChange, placeholder, id }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSugg, setShowSugg] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSugg(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    onChange(val)
    if (val.length >= 2) {
      const filtered = INDIAN_CITIES.filter(c =>
        c.toLowerCase().startsWith(val.toLowerCase()) ||
        c.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8)
      setSuggestions(filtered)
      setShowSugg(filtered.length > 0)
    } else {
      setShowSugg(false)
    }
  }

  const handleSelect = (city) => {
    onChange(city)
    setShowSugg(false)
  }

  return (
    <div className="position-relative" ref={wrapRef}>
      <label htmlFor={id} className="form-label fw-700 mb-1">
        <i className={`bi bi-${label === 'From' ? 'geo-alt' : 'geo'} me-1`} style={{ color: '#667eea' }} />
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="form-control form-control-lg"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => value.length >= 2 && setShowSugg(suggestions.length > 0)}
        autoComplete="off"
        style={{ borderRadius: '10px', fontWeight: 600 }}
      />
      {showSugg && (
        <ul className="suggestions-list list-unstyled mb-0">
          {suggestions.map(city => (
            <li key={city} className="suggestion-item" onMouseDown={() => handleSelect(city)}>
              <i className="bi bi-geo-alt-fill text-primary me-2" style={{ fontSize: '0.8rem' }} />
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SearchForm({ initialValues = {} }) {
  const [from, setFrom] = useState(initialValues.from || '')
  const [to, setTo] = useState(initialValues.to || '')
  const [date, setDate] = useState(initialValues.date || new Date().toISOString().split('T')[0])
  const [swapping, setSwapping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSwap = () => {
    if (!from && !to) return
    setSwapping(true)
    setTimeout(() => setSwapping(false), 450)
    setFrom(to)
    setTo(from)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!from.trim() || !to.trim()) {
      setError('Please enter both From and To cities.')
      return
    }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setError('From and To cities cannot be the same.')
      return
    }
    if (!date) {
      setError('Please select a travel date.')
      return
    }
    setLoading(true)
    navigate(`/results?from=${encodeURIComponent(from.trim())}&to=${encodeURIComponent(to.trim())}&date=${date}`)
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-lg border-0 p-4" style={{ borderRadius: '20px', maxWidth: 820, margin: '0 auto' }}>
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-4">
          <CityInput
            id="search-from"
            label="From"
            value={from}
            onChange={setFrom}
            placeholder="Departure city..."
          />
        </div>

        <div className="col-12 col-md-1 text-center d-flex align-items-end justify-content-center pb-1">
          <button
            type="button"
            className={`swap-btn btn btn-light rounded-circle p-2 border ${swapping ? 'spinning' : ''}`}
            onClick={handleSwap}
            title="Swap cities"
            style={{ width: 44, height: 44, fontSize: '1.1rem', flexShrink: 0 }}
          >
            <i className="bi bi-arrow-left-right" />
          </button>
        </div>

        <div className="col-12 col-md-4">
          <CityInput
            id="search-to"
            label="To"
            value={to}
            onChange={setTo}
            placeholder="Destination city..."
          />
        </div>

        <div className="col-12 col-md-3">
          <label htmlFor="travel-date" className="form-label fw-700 mb-1">
            <i className="bi bi-calendar3 me-1" style={{ color: '#667eea' }} />
            Date
          </label>
          <input
            id="travel-date"
            type="date"
            className="form-control form-control-lg"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            style={{ borderRadius: '10px', fontWeight: 600 }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible mt-3 mb-0 py-2" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />{error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      <div className="text-center mt-4">
        <button
          type="submit"
          className="btn btn-gradient btn-animated btn-lg px-5 fw-800"
          disabled={loading}
          style={{ borderRadius: '30px', minWidth: 200, fontSize: '1.05rem' }}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" />Searching...</>
          ) : (
            <><i className="bi bi-search me-2" />Compare Options</>
          )}
        </button>
      </div>
    </form>
  )
}
