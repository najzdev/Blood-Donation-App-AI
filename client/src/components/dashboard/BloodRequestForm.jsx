import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function BloodRequestForm({ onSuccess, initial = {} }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    bloodType: '', units: 1, urgency: 'medium',
    hospital: '', city: '', diagnosis: '', notes: '', requiredBy: '',
    ...initial
  })

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initial._id) {
        await api.put(`/requests/${initial._id}`, form)
      } else {
        await api.post('/requests', form)
      }
      toast.success(t('common.success'))
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="grid-2" style={{ gap: '14px' }}>
        <div className="form-group">
          <label className="form-label">{t('request.blood_type')}</label>
          <select className="form-select" name="bloodType" required value={form.bloodType} onChange={handle}>
            <option value="">Select...</option>
            {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('request.units')}</label>
          <input className="form-input" type="number" name="units" min="1" max="20" required value={form.units} onChange={handle} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('request.urgency')}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {['critical', 'high', 'medium', 'low'].map(u => (
            <button key={u} type="button"
              onClick={() => setForm(f => ({ ...f, urgency: u }))}
              className={`btn btn-sm ${form.urgency === u ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'center', fontSize: '12px', padding: '8px 4px',
                borderColor: form.urgency === u ? 'var(--red)' :
                  u === 'critical' ? '#dc2626' : u === 'high' ? '#ea580c' : u === 'medium' ? '#ca8a04' : '#16a34a'
              }}>
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: '14px' }}>
        <div className="form-group">
          <label className="form-label">{t('request.hospital')}</label>
          <input className="form-input" name="hospital" value={form.hospital} onChange={handle} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('request.city')}</label>
          <input className="form-input" name="city" required value={form.city} onChange={handle} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('request.diagnosis')}</label>
        <input className="form-input" name="diagnosis" value={form.diagnosis} onChange={handle} />
      </div>

      <div className="form-group">
        <label className="form-label">{t('request.required_by')}</label>
        <input className="form-input" type="date" name="requiredBy" value={form.requiredBy} onChange={handle} />
      </div>

      <div className="form-group">
        <label className="form-label">{t('request.notes')}</label>
        <textarea className="form-textarea" name="notes" value={form.notes} onChange={handle} />
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '4px' }}>
        {loading ? t('common.loading') : t('request.submit')}
      </button>
    </form>
  )
}
