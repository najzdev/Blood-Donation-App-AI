import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Droplets, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(t('common.success'))
      const paths = { admin: '/admin', doctor: '/doctor', donor: '/donor', patient: '/patient' }
      navigate(paths[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Droplets size={32} color="var(--red)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px' }}>
              Dem <span style={{ color: 'var(--red)' }}>AI</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>{t('auth.login_title')}</h1>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>{t('auth.login_sub')}</p>
        </div>

        <div className="card card-lg">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input className="form-input" style={{ paddingLeft: '38px' }}
                  type="email" name="email" required value={form.email} onChange={handle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input className="form-input" style={{ paddingLeft: '38px', paddingRight: '42px' }}
                  type={showPwd ? 'text' : 'password'} name="password" required value={form.password} onChange={handle} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login_btn')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text2)' }}>
            {t('auth.no_account')}{' '}
            <Link to="/register" style={{ color: 'var(--red)', fontWeight: 600 }}>{t('nav.register')}</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="card" style={{ marginTop: '16px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Accounts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { role: 'Admin', email: 'admin@demai.com', pwd: 'admin123' },
              { role: 'Doctor', email: 'doctor@demai.com', pwd: 'doctor123' },
              { role: 'Donor', email: 'donor@demai.com', pwd: 'donor123' },
              { role: 'Patient', email: 'patient@demai.com', pwd: 'patient123' },
            ].map(d => (
              <button key={d.role} type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '12px' }}
                onClick={() => setForm({ email: d.email, password: d.pwd })}>
                <span className="badge badge-red" style={{ fontSize: '10px', padding: '2px 7px' }}>{d.role}</span>
                {d.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
