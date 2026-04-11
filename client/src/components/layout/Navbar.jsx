import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon, Globe, Menu, X, Droplets } from 'lucide-react'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const location = useLocation()

  const langs = [{ code: 'en', label: 'English' }, { code: 'fr', label: 'Français' }, { code: 'ar', label: 'العربية' }]
  const dashPaths = { admin: '/admin', doctor: '/doctor', donor: '/donor', patient: '/patient' }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      height: '64px', display: 'flex', alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Droplets size={28} color="var(--red)" strokeWidth={2.5} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px' }}>
            Dem <span style={{ color: 'var(--red)' }}>AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" className="btn btn-ghost btn-sm">{t('nav.home')}</Link>
          <Link to="/about" className="btn btn-ghost btn-sm">{t('nav.about')}</Link>
          {user
            ? <Link to={dashPaths[user.role]} className="btn btn-ghost btn-sm">{t('nav.dashboard')}</Link>
            : <>
              <Link to="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
            </>
          }
          {user && <button className="btn btn-ghost btn-sm" onClick={logout}>{t('nav.logout')}</button>}

          {/* Language */}
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setLangOpen(o => !o)}>
              <Globe size={16} />
            </button>
            {langOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)', minWidth: '130px', zIndex: 300
              }}>
                {langs.map(l => (
                  <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px',
                      background: i18n.language === l.code ? 'var(--red-light)' : 'none',
                      color: i18n.language === l.code ? 'var(--red)' : 'var(--text)',
                      border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px'
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button className="btn btn-ghost btn-sm btn-icon" onClick={toggle}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile menu button */}
        <div style={{ display: 'flex', gap: '8px' }} className="show-mobile">
          <button className="btn btn-ghost btn-sm btn-icon" onClick={toggle}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <Link to="/" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
          <Link to="/about" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>{t('nav.about')}</Link>
          {user
            ? <>
              <Link to={dashPaths[user.role]} className="btn btn-ghost" onClick={() => setMenuOpen(false)}>{t('nav.dashboard')}</Link>
              <button className="btn btn-ghost" onClick={() => { logout(); setMenuOpen(false) }}>{t('nav.logout')}</button>
            </>
            : <>
              <Link to="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>{t('nav.register')}</Link>
            </>
          }
          <div style={{ display: 'flex', gap: '8px' }}>
            {langs.map(l => (
              <button key={l.code} className={`btn btn-sm ${i18n.language === l.code ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { i18n.changeLanguage(l.code); setMenuOpen(false) }}>
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
