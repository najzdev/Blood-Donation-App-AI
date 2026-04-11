import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, UrgencyBadge, StatusBadge, BloodTypeBadge, Loading, SectionHeader, EmptyState } from '../../components/ui/index.jsx'
import NotificationsPanel from '../../components/dashboard/NotificationsPanel'
import BloodRequestForm from '../../components/dashboard/BloodRequestForm'
import AIChat from '../../components/dashboard/AIChat'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Bell, Brain, Plus, Heart, Users } from 'lucide-react'

const NAV = [
  { path: '', label: 'dashboard.overview', icon: LayoutDashboard },
  { path: '/requests', label: 'dashboard.requests', icon: FileText },
  { path: '/ai', label: 'dashboard.ai_match', icon: Brain },
  { path: '/notifications', label: 'dashboard.notifications', icon: Bell },
]

function Overview() {
  const { user } = useAuth()
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/requests').then(r => setMyRequests(r.data)).finally(() => setLoading(false))
  }, [])

  const pending = myRequests.filter(r => r.status === 'pending').length
  const matched = myRequests.filter(r => r.status === 'matched').length
  const fulfilled = myRequests.filter(r => r.status === 'fulfilled').length

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '28px' }}>Patient Dashboard</h1>

      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <StatCard icon={FileText} label="My Requests" value={myRequests.length} color="var(--red)" />
        <StatCard icon={Heart} label="Matched" value={matched} color="#2563eb" />
        <StatCard icon={Users} label="Fulfilled" value={fulfilled} color="#16a34a" />
      </div>

      {loading ? <Loading /> : (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>My Blood Requests</h3>
          {myRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text3)' }}>
              No requests yet. Create one to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myRequests.map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg3)', borderRadius: '8px' }}>
                  <BloodTypeBadge type={r.bloodType} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{r.units} units · {r.hospital || r.city}</div>
                    {r.aiAnalysis && <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>AI: {r.aiAnalysis.slice(0, 80)}...</div>}
                  </div>
                  <UrgencyBadge urgency={r.urgency} />
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MyRequests() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => api.get('/requests').then(r => setRequests(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const cancelRequest = async (id) => {
    if (!confirm('Cancel this request?')) return
    await api.put(`/requests/${id}`, { status: 'cancelled' })
    toast.success('Request cancelled')
    load()
  }

  return (
    <div>
      <SectionHeader title={t('dashboard.requests')}
        action={<button className="btn btn-primary btn-sm" onClick={() => { setShowForm(s => !s); setEditing(null) }}>
          <Plus size={14} /> {t('dashboard.new_request')}
        </button>}
      />

      {(showForm || editing) && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>
            {editing ? 'Edit Request' : 'New Blood Request'}
          </h3>
          <BloodRequestForm
            initial={editing || {}}
            onSuccess={() => { setShowForm(false); setEditing(null); load() }}
          />
        </div>
      )}

      {loading ? <Loading /> : requests.length === 0 ? (
        <EmptyState icon={FileText} message="No blood requests yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {requests.map(r => (
            <div key={r._id} className="card" style={{
              padding: '20px',
              borderLeft: r.urgency === 'critical' ? '4px solid var(--red)' : r.urgency === 'high' ? '4px solid #ea580c' : '4px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <BloodTypeBadge type={r.bloodType} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <UrgencyBadge urgency={r.urgency} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <strong>{r.units}</strong> unit(s) · {r.hospital || r.city}
                  </div>
                  {r.diagnosis && <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Diagnosis: {r.diagnosis}</div>}
                  {r.matchedDonors?.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
                      ✓ {r.matchedDonors.length} donor(s) matched
                    </div>
                  )}
                  {r.aiAnalysis && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--red-light)', borderRadius: '6px', fontSize: '13px', color: 'var(--text2)' }}>
                      <strong style={{ color: 'var(--red)' }}>AI Analysis: </strong>{r.aiAnalysis}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  {r.status === 'pending' && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(r); setShowForm(false) }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => cancelRequest(r._id)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PatientDashboard() {
  return (
    <DashboardLayout navItems={NAV} basePath="/patient">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="ai" element={<div><SectionHeader title="AI Assistant" /><AIChat /></div>} />
        <Route path="notifications" element={<NotificationsPanel />} />
      </Routes>
    </DashboardLayout>
  )
}
