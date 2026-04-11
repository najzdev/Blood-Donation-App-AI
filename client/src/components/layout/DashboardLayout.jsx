import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Droplets, Sun, Moon, Bell, Menu, X, LogOut, Globe } from 'lucide-react'

export default function DashboardLayout({ children, navItems, basePath }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'ع' },
  ]

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="dashboard-layout">
      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Droplets size={26} color="var(--red)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px' }}>
              Dem <span style={{ color: 'var(--red)' }}>AI</span>
            </span>
          </div>
          {/* User info */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--red)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.2 }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => {
            const active = location.pathname === `${basePath}${item.path}` || location.pathname === `${basePath}${item.path}/`
            return (
              <button key={item.path}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={() => { navigate(`${basePath}${item.path}`); setSidebarOpen(false) }}>
                <item.icon size={18} />
                {t(item.label)}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <button className="sidebar-nav-item" style={{ color: 'var(--red)', margin: 0, width: '100%' }}
            onClick={handleLogout}>
            <LogOut size={18} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-ghost btn-icon" style={{ display: 'none' }}
              id="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
              <Menu size={20} />
            </button>
            <style>{`@media(max-width:1024px){#sidebar-toggle{display:flex!important}}`}</style>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>
              {t('dashboard.welcome')}, {user?.name?.split(' ')[0]}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Lang switcher */}
            {langs.map(l => (
              <button key={l.code}
                className={`btn btn-sm ${i18n.language === l.code ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '5px 10px', minWidth: '36px' }}
                onClick={() => i18n.changeLanguage(l.code)}>
                {l.label}
              </button>
            ))}

            <button className="btn btn-ghost btn-icon" onClick={toggle}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}
              onClick={() => navigate(`${basePath}/notifications`)}>
              <Bell size={18} />
              <span style={{
                position: 'absolute', top: '5px', right: '5px',
                width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)'
              }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content fade-in">
          {children}
        </div>
      </div>
    </div>
  )
}
