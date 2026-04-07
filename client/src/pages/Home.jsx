import SearchForm from '../components/SearchForm'
import { useTheme } from '../contexts/ThemeContext'

export default function Home() {
  const { theme } = useTheme()

  return (
    <>
      <section className="hero-gradient text-white py-5">
        <div className="container text-center position-relative" style={{ zIndex: 1 }}>
          <div className="mb-2" style={{ fontSize: '3rem' }}>✈️</div>
          <h1 className="fw-900 display-5 mb-2" style={{ letterSpacing: '-0.5px' }}>
            Smart Indian Travel Comparison
          </h1>
          <p className="lead mb-4 opacity-75">
            Compare Train · Flight · Bus · Taxi — with AI-powered scoring
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        <SearchForm />
      </div>

      <div className="container py-5">
        <h2 className="text-center fw-800 mb-4" style={{ color: theme === 'dark' ? '#e0e0e0' : '#1a1a2e' }}>
          Why TravelCompare?
        </h2>
        <div className="row g-4 text-center">
          {[
            { icon: '🧠', title: 'AI Scoring', desc: 'Our engine weighs price, time, comfort, and eco-impact to find the best option for you.' },
            { icon: '🗺️', title: 'All Routes', desc: 'Compare Train, Flight, Bus, and Taxi on any Indian city pair in one shot.' },
            { icon: '💚', title: 'Eco Aware', desc: 'See CO₂ emissions for every option and choose greener travel.' },
            { icon: '📱', title: 'Fully Responsive', desc: 'Works beautifully on mobile, tablet, and desktop.' },
          ].map(f => (
            <div className="col-sm-6 col-lg-3" key={f.title}>
              <div className="card border-0 shadow-sm h-100 p-3">
                <div style={{ fontSize: '2.2rem' }} className="mb-2">{f.icon}</div>
                <h5 className="fw-800 mb-1">{f.title}</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
