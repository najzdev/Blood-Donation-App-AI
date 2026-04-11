import { useTranslation } from 'react-i18next'
import Navbar from '../components/layout/Navbar'
import { Github, Linkedin, Stethoscope, Code2, Brain, Heart } from 'lucide-react'

const TEAM = [
  {
    name: 'Hamza Labbaalli',
    role: 'Full-Stack Developer & Project Lead',
    icon: Code2,
    color: '#e63030',
    bio: 'Passionate developer who designed and built the Dem AI platform, integrating AI, backend, and frontend technologies.',
    social: { github: 'najzdev', linkedin: 'najzdev' },
  },
  {
    name: 'Fatima Tildi',
    role: 'UI/UX Designer & Frontend Developer',
    icon: Brain,
    color: '#8b5cf6',
    bio: 'Creative designer responsible for the platform\'s intuitive interface and seamless user experience across all roles.',
    social: { github: '#', linkedin: '#' },
  },
  {
    name: 'Lamya Jarrari',
    role: 'AI Integration & Data Analyst',
    icon: Brain,
    color: '#ec4899',
    bio: 'AI specialist who implemented the Gemini-powered donor-patient matching algorithm and urgency prioritization system.',
    social: { github: '#', linkedin: '#' },
  },
  {
    name: 'Dr. Ouadii Abakarim',
    role: 'Medical Advisor & Domain Expert',
    icon: Stethoscope,
    color: '#0ea5e9',
    bio: 'Hematologist with 15 years of experience, providing medical guidance on blood compatibility, donation protocols, and clinical workflows.',
    social: { linkedin: '#' },
  },
]

export default function About() {
  const { t } = useTranslation()

  return (
    <div style={{ paddingTop: '64px' }}>
      <Navbar />

      {/* Header */}
      <section style={{
        padding: '80px 0 60px',
        background: 'linear-gradient(180deg, var(--red-light) 0%, var(--bg) 100%)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '52px', fontWeight: 800, marginBottom: '16px' }}>{t('about.title')}</h1>
          <p style={{ fontSize: '18px', color: 'var(--text2)', maxWidth: '560px', margin: '0 auto' }}>
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="card card-lg" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <Heart size={48} color="var(--red)" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>{t('about.mission_title')}</h2>
            <p style={{ fontSize: '17px', color: 'var(--text2)', lineHeight: 1.8 }}>{t('about.mission_desc')}</p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '40px',
              paddingTop: '32px', borderTop: '1px solid var(--border)'
            }}>
              {[
                { label: 'AI-Powered Matching', desc: 'Gemini AI analyzes urgency and compatibility' },
                { label: 'Real-Time Notifications', desc: 'Instant alerts for donors and patients' },
                { label: 'Multi-Role Platform', desc: 'Tailored dashboards for every user type' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--red)' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '40px', marginBottom: '52px' }}>{t('about.team_title')}</h2>
          <div className="grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {TEAM.map(member => (
              <div key={member.name} className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px', flexShrink: 0,
                    background: `${member.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <member.icon size={28} color={member.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{member.name}</h3>
                    <div style={{ fontSize: '13px', color: member.color, fontWeight: 600, marginBottom: '12px' }}>
                      {member.role}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6 }}>{member.bio}</p>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      {member.social.github && (
                        <a href={member.social.github} target="_blank" rel="noreferrer"
                          className="btn btn-ghost btn-sm btn-icon" title="GitHub">
                          <Github size={16} />
                        </a>
                      )}
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} target="_blank" rel="noreferrer"
                          className="btn btn-ghost btn-sm btn-icon" title="LinkedIn">
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
