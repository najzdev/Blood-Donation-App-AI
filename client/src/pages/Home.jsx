import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/layout/Navbar'
import { Heart, Zap, Users, CheckCircle, Droplets, Brain } from 'lucide-react'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const STATS = [
  { key: 'stat_donors', value: '2,400+', color: '#e63030' },
  { key: 'stat_lives', value: '8,700+', color: '#16a34a' },
  { key: 'stat_requests', value: '5,200+', color: '#2563eb' },
  { key: 'stat_hospitals', value: '48', color: '#ca8a04' },
]

export default function Home() {
  const { t } = useTranslation()

  return (
    <div style={{ paddingTop: '64px' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div className="fade-in">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--red-light)', color: 'var(--red)',
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                marginBottom: '24px'
              }}>
                <Brain size={14} />
                AI-Powered Matching
              </div>

              <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
                {t('home.hero_title')}<br />
                <span style={{ color: 'var(--red)' }}>{t('home.hero_highlight')}</span><br />
                {t('home.hero_sub')}
              </h1>

              <p style={{ fontSize: '17px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '460px' }}>
                {t('home.hero_desc')}
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <Heart size={18} />
                  {t('home.cta_donor')}
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  {t('home.cta_patient')}
                </Link>
              </div>
            </div>

            {/* Animated blood drop */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="float" style={{
                width: '280px', height: '280px',
                background: 'radial-gradient(circle at 35% 35%, rgba(255,100,100,0.9), var(--red) 60%, #8b0000)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                transform: 'rotate(-5deg)',
                boxShadow: '0 20px 60px var(--red-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Droplets size={80} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
            marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)'
          }}>
            {STATS.map(s => (
              <div key={s.key} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '4px' }}>{t(`home.${s.key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '100px 0', background: 'var(--bg2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '40px', marginBottom: '60px' }}>{t('home.how_title')}</h2>
          <div className="grid-3">
            {[
              { icon: Users, title: 'step1_title', desc: 'step1_desc', num: '01' },
              { icon: Brain, title: 'step2_title', desc: 'step2_desc', num: '02' },
              { icon: CheckCircle, title: 'step3_title', desc: 'step3_desc', num: '03' },
            ].map(step => (
              <div key={step.num} className="card" style={{ textAlign: 'center', padding: '40px 28px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'var(--red-light)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 20px'
                }}>
                  <step.icon size={28} color="var(--red)" />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--border)', marginBottom: '8px' }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{t(`home.${step.title}`)}</h3>
                <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{t(`home.${step.desc}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Types */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '48px' }}>{t('home.types_title')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            {BLOOD_TYPES.map(type => (
              <div key={type} style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--red)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800,
                boxShadow: '0 4px 16px var(--red-glow)',
                transition: 'transform 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, var(--red) 0%, #b91c1c 100%)',
        color: '#fff'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', marginBottom: '16px' }}>Every Drop Counts</h2>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
            Join thousands of donors already saving lives with Dem AI.
          </p>
          <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--red)', fontWeight: 700 }}>
            <Zap size={18} />
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={20} color="var(--red)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Dem AI</span>
          </div>
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
            © 2024 Dem AI Blood Donation Platform. Built with ❤️
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: 'var(--text3)', fontSize: '13px' }}>Home</Link>
            <Link to="/about" style={{ color: 'var(--text3)', fontSize: '13px' }}>About</Link>
            <Link to="/register" style={{ color: 'var(--text3)', fontSize: '13px' }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
