import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../utils/api'
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Heart, Zap, Info } from 'lucide-react'
import { Loading, EmptyState } from '../ui/index.jsx'
import { SectionHeader } from '../ui/index.jsx'

const TYPE_ICONS = {
  match: Heart,
  urgent: AlertCircle,
  donation: Zap,
  request: Bell,
  system: Info,
}

const TYPE_COLORS = {
  match: '#16a34a',
  urgent: '#dc2626',
  donation: '#2563eb',
  request: '#ca8a04',
  system: '#6b7280',
}

export default function NotificationsPanel() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data)).finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x))
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  const remove = async (id) => {
    await api.delete(`/notifications/${id}`)
    setNotifications(n => n.filter(x => x._id !== id))
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div>
      <SectionHeader
        title={`${t('dashboard.notifications')} ${unread > 0 ? `(${unread})` : ''}`}
        action={
          unread > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} />
              {t('dashboard.mark_all_read')}
            </button>
          )
        }
      />

      {loading ? <Loading /> : notifications.length === 0 ? (
        <EmptyState icon={Bell} message={t('dashboard.no_notifications')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(n => {
            const Icon = TYPE_ICONS[n.type] || Info
            const color = TYPE_COLORS[n.type] || '#6b7280'
            return (
              <div key={n._id} className="card" style={{
                padding: '16px', opacity: n.read ? 0.7 : 1,
                borderLeft: `3px solid ${n.read ? 'var(--border)' : color}`,
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: `${color}18`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '14px' }}>{n.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px', lineHeight: 1.5 }}>{n.message}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {!n.read && (
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => markRead(n._id)} title="Mark read">
                        <Check size={14} />
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => remove(n._id)} title="Delete"
                      style={{ color: 'var(--red)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
