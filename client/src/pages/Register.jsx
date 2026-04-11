import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Droplets } from 'lucide-react'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    role: 'donor', bloodType: '', phone: '', city: '', gender: '', dateOfBirth: ''
  })

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const { confirm, ...data } = form
      const user = await register(data)
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Droplets size={32} color="var(--red)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px' }}>
              Dem <span style={{ color: 'var(--red)' }}>AI</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>{t('auth.register_title')}</h1>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>{t('auth.register_sub')}</p>
        </div>

        <div className="card card-lg">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">{t('auth.role')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {['donor', 'patient', 'doctor', 'admin'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`btn btn-sm ${form.role === r ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', padding: '8px 4px', fontSize: '12px' }}>
                    {t(`auth.roles.${r}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.name')}</label>
                <input className="form-input" name="name" required value={form.name} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <input className="form-input" type="email" name="email" required value={form.email} onChange={handle} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <input className="form-input" type="password" name="password" required minLength={6} value={form.password} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.confirm_password')}</label>
                <input className="form-input" type="password" name="confirm" required value={form.confirm} onChange={handle} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.blood_type')}</label>
                <select className="form-select" name="bloodType" value={form.bloodType} onChange={handle}>
                  <option value="">Select...</option>
                  {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.phone')}</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handle} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.city')}</label>
                <input className="form-input" name="city" value={form.city} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.gender')}</label>
                <select className="form-select" name="gender" value={form.gender} onChange={handle}>
                  <option value="">Select...</option>
                  <option value="male">{t('auth.male')}</option>
                  <option value="female">{t('auth.female')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.dob')}</label>
              <input className="form-input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handle} />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? t('common.loading') : t('auth.register_btn')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text2)' }}>
            {t('auth.has_account')}{' '}
            <Link to="/login" style={{ color: 'var(--red)', fontWeight: 600 }}>{t('nav.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
