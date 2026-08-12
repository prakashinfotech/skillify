import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { getDashboardRoute } from '../../utils/formatters'

const CATEGORIES = [
  { name: 'Mathematics', icon: 'bi-calculator', color: '#e3f2fd', iconColor: '#1565c0' },
  { name: 'Science', icon: 'bi-eyedropper', color: '#e8f5e9', iconColor: '#2e7d32' },
  { name: 'History', icon: 'bi-globe-americas', color: '#fff3e0', iconColor: '#e65100' },
  { name: 'Computer Science', icon: 'bi-code-slash', color: '#f3e5f5', iconColor: '#6a1b9a' },
  { name: 'Language Arts', icon: 'bi-book', color: '#fce4ec', iconColor: '#880e4f' },
  { name: 'Economics', icon: 'bi-graph-up', color: '#e0f7fa', iconColor: '#006064' },
  { name: 'Arts', icon: 'bi-palette', color: '#fff8e1', iconColor: '#f57f17' },
  { name: 'Physics', icon: 'bi-lightning', color: '#e8eaf6', iconColor: '#283593' },
]

const STEPS = [
  { icon: 'bi-search', step: '01', title: 'Find Your Course', desc: 'Browse hundreds of expert-curated courses across Mathematics, Science, History, Computer Science, and more.' },
  { icon: 'bi-play-circle-fill', step: '02', title: 'Learn at Your Pace', desc: 'Watch engaging video lessons, read in-depth articles, and complete interactive exercises — anytime, anywhere.' },
  { icon: 'bi-trophy-fill', step: '03', title: 'Track & Achieve', desc: 'Take quizzes, monitor your progress, and earn certificates that demonstrate your mastery.' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Class 12 Student', text: 'Skillify helped me ace my board exams. The explanations are crystal-clear and the quizzes keep me sharp.', initials: 'PS', color: '#1d3557' },
  { name: 'Rajan Mehta', role: 'Software Engineer', text: 'I upgraded my Python skills in two weeks. The structured curriculum and instant feedback are game-changers.', initials: 'RM', color: '#2d6a4f' },
  { name: 'Ananya Gupta', role: 'High School Teacher', text: 'I use Skillify to create supplemental lessons for my students. The course builder is intuitive and powerful.', initials: 'AG', color: '#457b9d' },
]

export default function HomePage() {
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  return (
    <div className="d-flex flex-column min-vh-100" style={{ paddingTop: 'var(--navbar-height)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(135deg, #1d3557 0%, #457b9d 60%, #2d6a4f 100%)', minHeight: '82vh' }}
        className="d-flex align-items-center position-relative overflow-hidden">
        {/* decorative circles */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -100, right: -100 }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -60, left: 80 }} />

        <div className="container text-center py-5 position-relative">
          <span className="badge px-3 py-2 mb-4 d-inline-block" style={{ background: 'rgba(255,255,255,0.15)', color: '#a8dadc', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
            FREE · WORLD-CLASS EDUCATION
          </span>
          <h1 className="display-3 fw-bold text-white mb-4 lh-sm">
            Learn Anything.<br />
            <span style={{ color: '#a8dadc' }}>Advance Everyone.</span>
          </h1>
          <p className="lead text-white mb-5 mx-auto" style={{ maxWidth: 560, opacity: 0.88 }}>
            A free, personalised learning platform used by thousands of students and teachers.
            Master new skills at your own pace, anytime.
          </p>

          <div className="d-flex flex-wrap gap-3 justify-content-center mb-5">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardRoute(user?.role)} className="btn btn-light btn-lg px-5 fw-semibold" style={{ color: '#1d3557' }}>
                  Go to Dashboard
                </Link>
                <Link to="/browse" className="btn btn-outline-light btn-lg px-5">
                  Browse Courses
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-light btn-lg px-5 fw-semibold" style={{ color: '#1d3557' }}>
                  Start Learning Free
                </Link>
                <Link to="/courses" className="btn btn-outline-light btn-lg px-5">
                  Explore Courses
                </Link>
              </>
            )}
          </div>

          {/* Trust bar */}
          <div className="d-flex flex-wrap justify-content-center gap-4" style={{ opacity: 0.7 }}>
            {[['10,000+', 'Students'], ['50+', 'Courses'], ['500+', 'Lessons'], ['100%', 'Free']].map(([n, l]) => (
              <div key={l} className="text-center text-white">
                <div className="fw-bold fs-5">{n}</div>
                <div style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-6 bg-white" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 d-inline-block" style={{ fontSize: '0.78rem', letterSpacing: '0.06em' }}>HOW IT WORKS</span>
            <h2 className="fw-bold" style={{ color: '#1d3557' }}>Three steps to mastery</h2>
          </div>
          <div className="row g-4">
            {STEPS.map((s, i) => (
              <div className="col-md-4" key={s.step}>
                <div className="card border-0 h-100 text-center p-4" style={{ borderRadius: 16, background: i === 1 ? 'linear-gradient(135deg,#1d3557,#457b9d)' : '#f8f9fa' }}>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto"
                    style={{ width: 64, height: 64, background: i === 1 ? 'rgba(255,255,255,0.15)' : '#e8f4f8' }}>
                    <i className={`bi ${s.icon} fs-4`} style={{ color: i === 1 ? '#fff' : '#1d3557' }} />
                  </div>
                  <div className="fw-bold mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: i === 1 ? 'rgba(255,255,255,0.6)' : '#999' }}>STEP {s.step}</div>
                  <h5 className="fw-bold mb-2" style={{ color: i === 1 ? '#fff' : '#1d3557' }}>{s.title}</h5>
                  <p className="mb-0 small" style={{ color: i === 1 ? 'rgba(255,255,255,0.8)' : '#666', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 d-inline-block" style={{ fontSize: '0.78rem', letterSpacing: '0.06em' }}>SUBJECTS</span>
            <h2 className="fw-bold" style={{ color: '#1d3557' }}>Explore every subject</h2>
            <p className="text-muted">From foundational maths to advanced computer science — we have you covered.</p>
          </div>
          <div className="row row-cols-2 row-cols-sm-4 g-3">
            {CATEGORIES.map((cat) => (
              <div className="col" key={cat.name}>
                <Link to={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="card border-0 text-decoration-none h-100 text-center p-3"
                  style={{ borderRadius: 12, background: cat.color, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  <i className={`bi ${cat.icon} fs-3 mb-2`} style={{ color: cat.iconColor }} />
                  <p className="mb-0 fw-semibold small" style={{ color: '#333' }}>{cat.name}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 d-inline-block" style={{ fontSize: '0.78rem', letterSpacing: '0.06em' }}>TESTIMONIALS</span>
            <h2 className="fw-bold" style={{ color: '#1d3557' }}>Loved by learners</h2>
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t) => (
              <div className="col-md-4" key={t.name}>
                <div className="card border-0 shadow-sm h-100 p-4" style={{ borderRadius: 16 }}>
                  <div className="mb-3">
                    {[...Array(5)].map((_, i) => <i key={i} className="bi bi-star-fill text-warning me-1" style={{ fontSize: '0.75rem' }} />)}
                  </div>
                  <p className="text-muted mb-4" style={{ lineHeight: 1.8, fontSize: '0.9rem' }}>"{t.text}"</p>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                      style={{ width: 40, height: 40, background: t.color, fontSize: '0.85rem' }}>{t.initials}</div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '0.9rem', color: '#1d3557' }}>{t.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      {!isAuthenticated && (
        <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #1d3557, #2d6a4f)' }}>
          <div className="container text-center text-white">
            <h2 className="fw-bold mb-3 display-6">Ready to start learning?</h2>
            <p className="mb-5 opacity-75 mx-auto" style={{ maxWidth: 480 }}>
              Join thousands of learners today. It's completely free — no credit card required.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/register" className="btn btn-light btn-lg px-5 fw-semibold" style={{ color: '#1d3557' }}>
                Create Free Account
              </Link>
              <Link to="/courses" className="btn btn-outline-light btn-lg px-5">
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
