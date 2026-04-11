import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, UrgencyBadge, StatusBadge, BloodTypeBadge, Loading, EmptyState, SectionHeader } from '../../components/ui/index.jsx'
import NotificationsPanel from '../../components/dashboard/NotificationsPanel'
import BloodRequestForm from '../../components/dashboard/BloodRequestForm'
import AIChat from '../../components/dashboard/AIChat'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, Users, Droplets, FileText, Bell, Brain, Settings, Plus, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const NAV = [
  { path: '', label: 'dashboard.overview', icon: LayoutDashboard },
  { path: '/users', label: 'dashboard.users', icon: Users },
  { path: '/requests', label: 'dashboard.requests', icon: FileText },
  { path: '/donations', label: 'dashboard.donations', icon: Droplets },
  { path: '/ai', label: 'dashboard.ai_match', icon: Brain },
  { path: '/notifications', label: 'dashboard.notifications', icon: Bell },
]

function Overview() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({})
  const [reqStats, setReqStats] = useState({})
  const [donStats, setDonStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/requests/stats'),
      api.get('/donations/stats'),
    ]).then(([u, r, d]) => {
      setStats(u.data); setReqStats(r.data); setDonStats(d.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '28px' }}>{t('dashboard.overview')}</h1>

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatCard icon={Users} label={t('dashboard.users')} value={stats.totalUsers || 0} color="#2563eb" />
        <StatCard icon={Droplets} label={t('dashboard.donations')} value={donStats.completed || 0} color="#16a34a" />
        <StatCard icon={FileText} label={t('dashboard.requests')} value={reqStats.total || 0} color="var(--red)" />
        <StatCard icon={AlertCircle} label={t('dashboard.critical')} value={reqStats.critical || 0} color="#dc2626" />
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Request Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Pending', value: reqStats.pending || 0, color: '#ca8a04' },
              { label: 'Matched', value: reqStats.matched || 0, color: '#2563eb' },
              { label: 'Fulfilled', value: reqStats.fulfilled || 0, color: '#16a34a' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', fontSize: '13px', color: 'var(--text2)' }}>{item.label}</div>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: item.color, borderRadius: '4px',
                    width: `${reqStats.total ? (item.value / reqStats.total) * 100 : 0}%`,
                    transition: 'width 0.5s'
                  }} />
                </div>
                <div style={{ width: '30px', fontSize: '14px', fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>User Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Donors', value: stats.donors || 0, color: '#16a34a' },
              { label: 'Patients', value: stats.patients || 0, color: 'var(--red)' },
              { label: 'Doctors', value: stats.doctors || 0, color: '#2563eb' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', fontSize: '13px', color: 'var(--text2)' }}>{item.label}</div>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: item.color, borderRadius: '4px',
                    width: `${stats.totalUsers ? (item.value / stats.totalUsers) * 100 : 0}%`,
                    transition: 'width 0.5s'
                  }} />
                </div>
                <div style={{ width: '30px', fontSize: '14px', fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function UsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/users/${id}`)
    setUsers(u => u.filter(x => x._id !== id))
    toast.success('User deleted')
  }

  const filtered = filter ? users.filter(u => u.role === filter) : users

  return (
    <div>
      <SectionHeader title={t('dashboard.users')} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['', 'admin', 'doctor', 'donor', 'patient'].map(r => (
          <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(r)}>
            {r || 'All'}
          </button>
        ))}
      </div>
      {loading ? <Loading /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('common.email')}</th>
                <th>{t('common.role')}</th>
                <th>{t('common.blood_type')}</th>
                <th>{t('common.city')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td style={{ color: 'var(--text2)' }}>{user.email}</td>
                  <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{user.role}</span></td>
                  <td>{user.bloodType ? <BloodTypeBadge type={user.bloodType} size={28} /> : '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{user.city || '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function RequestsPage() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = () => api.get('/requests').then(r => setRequests(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const runAIMatch = async (id) => {
    try {
      toast.loading('AI matching in progress...')
      const res = await api.get(`/ai/match/${id}`)
      toast.dismiss()
      toast.success(`Matched ${res.data.rankedCount} donors!`)
      load()
    } catch {
      toast.dismiss()
      toast.error('AI matching failed')
    }
  }

  return (
    <div>
      <SectionHeader title={t('dashboard.requests')}
        action={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}><Plus size={14} /> {t('dashboard.new_request')}</button>}
      />
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>New Blood Request</h3>
          <BloodRequestForm onSuccess={() => { setShowForm(false); load() }} />
        </div>
      )}
      {loading ? <Loading /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Blood</th><th>Units</th><th>Urgency</th><th>Status</th><th>City</th><th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.patient?.name || '—'}</td>
                  <td><BloodTypeBadge type={r.bloodType} size={28} /></td>
                  <td>{r.units}</td>
                  <td><UrgencyBadge urgency={r.urgency} /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ color: 'var(--text2)' }}>{r.city}</td>
                  <td>
                    {r.status === 'pending' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => runAIMatch(r._id)} style={{ gap: '4px' }}>
                        <Zap size={12} /> AI Match
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AIPage() {
  const { t } = useTranslation()
  const [prioritized, setPrioritized] = useState(null)
  const [loading, setLoading] = useState(false)

  const getPriority = async () => {
    setLoading(true)
    try {
      const res = await api.get('/ai/prioritize')
      setPrioritized(res.data)
    } catch { toast.error('Failed to get AI analysis') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <SectionHeader title={t('dashboard.ai_match')} />
      <div className="grid-2">
        <AIChat />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="btn btn-primary" onClick={getPriority} disabled={loading}>
            <Zap size={16} /> {loading ? t('common.loading') : t('dashboard.priority_requests')}
          </button>
          {prioritized && (
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={16} color="var(--red)" /> AI Summary
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '16px' }}>{prioritized.aiSummary}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {prioritized.requests?.slice(0, 5).map(r => (
                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
                    <BloodTypeBadge type={r.bloodType} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{r.patient?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{r.units} units · {r.city}</div>
                    </div>
                    <UrgencyBadge urgency={r.urgency} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={NAV} basePath="/admin">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="donations" element={<DonationsPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="notifications" element={<NotificationsPanel />} />
      </Routes>
    </DashboardLayout>
  )
}

function DonationsPage() {
  const { t } = useTranslation()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/donations').then(r => setDonations(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <SectionHeader title={t('dashboard.donations')} />
      {loading ? <Loading /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Donor</th><th>Blood Type</th><th>Units</th><th>Status</th><th>Date</th><th>Hospital</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.donor?.name}</td>
                  <td><BloodTypeBadge type={d.bloodType} size={28} /></td>
                  <td>{d.units}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td style={{ color: 'var(--text2)' }}>{d.donationDate ? new Date(d.donationDate).toLocaleDateString() : '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{d.hospital || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
