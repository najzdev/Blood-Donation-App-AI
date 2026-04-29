import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, UrgencyBadge, StatusBadge, BloodTypeBadge, Loading, SectionHeader } from '../../components/ui/index.jsx'
import NotificationsPanel from '../../components/dashboard/NotificationsPanel'
import BloodRequestForm from '../../components/dashboard/BloodRequestForm'
import AIChat from '../../components/dashboard/AIChat'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Droplets, Bell, Brain, Plus, Zap, Users } from 'lucide-react'

const NAV = [
  { path: '', label: 'dashboard.overview', icon: LayoutDashboard },
  { path: '/requests', label: 'dashboard.requests', icon: FileText },
  { path: '/donors', label: 'dashboard.users', icon: Users },
  { path: '/ai', label: 'dashboard.ai_match', icon: Brain },
  { path: '/notifications', label: 'dashboard.notifications', icon: Bell },
]

function Overview() {
  const { t } = useTranslation()
  const [reqStats, setReqStats] = useState({})
  const [recentRequests, setRecentRequests] = useState([])

  useEffect(() => {
    api.get('/requests/stats').then(r => setReqStats(r.data))
    api.get('/requests?status=pending').then(r => setRecentRequests(r.data.slice(0, 5)))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '28px' }}>Doctor Dashboard</h1>
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatCard icon={FileText} label="Total Requests" value={reqStats.total || 0} color="var(--red)" />
        <StatCard icon={Zap} label="Critical" value={reqStats.critical || 0} color="#dc2626" />
        <StatCard icon={Droplets} label="Matched" value={reqStats.matched || 0} color="#2563eb" />
        <StatCard icon={Brain} label="Fulfilled" value={reqStats.fulfilled || 0} color="#16a34a" />
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Urgent Pending Requests</h3>
        {recentRequests.length === 0 ? (
          <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '20px' }}>No pending requests</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentRequests.map(r => (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <BloodTypeBadge type={r.bloodType} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.patient?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{r.units} units · {r.hospital || r.city}</div>
                </div>
                <UrgencyBadge urgency={r.urgency} />
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RequestsPage() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedRequest, setExpandedRequest] = useState(null)
  const [matchedDonors, setMatchedDonors] = useState({})

  const load = () => api.get('/requests').then(r => setRequests(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const runMatch = async (id) => {
    try {
      toast.loading('Running AI match...')
      const res = await api.get(`/ai/match/${id}`)
      toast.dismiss()
      if (!res.data.matches || res.data.matches.length === 0) {
        toast.error('No compatible donors found')
      } else {
        setMatchedDonors(prev => ({ ...prev, [id]: res.data.matches }))
        setExpandedRequest(id)
        toast.success(`${res.data.rankedCount} donors matched!`)
      }
      load()
    } catch (err) { 
      toast.dismiss(); 
      toast.error(err.response?.data?.message || 'Match failed') 
    }
  }

  const updateStatus = async (id, status) => {
    await api.put(`/requests/${id}`, { status })
    load()
    toast.success('Status updated')
  }

  return (
    <div>
      <SectionHeader title={t('dashboard.requests')}
        action={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}><Plus size={14} /> New</button>}
      />
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <BloodRequestForm onSuccess={() => { setShowForm(false); load() }} />
        </div>
      )}
      {loading ? <Loading /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map(r => (
            <div key={r._id}>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                  <BloodTypeBadge type={r.bloodType} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700 }}>{r.patient?.name}</span>
                      <UrgencyBadge urgency={r.urgency} />
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
                      {r.units} units · {r.hospital || r.city} · {r.diagnosis || 'No diagnosis'}
                    </div>
                    {r.aiAnalysis && (
                      <div style={{ marginTop: '8px', padding: '10px', background: 'var(--red-light)', borderRadius: '6px', fontSize: '13px', color: 'var(--text2)' }}>
                        <strong style={{ color: 'var(--red)' }}>AI: </strong>{r.aiAnalysis}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {r.status === 'pending' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => runMatch(r._id)}>
                        <Zap size={12} /> AI Match
                      </button>
                    )}
                    {r.status === 'matched' && (
                      <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r._id, 'fulfilled')}>
                        Mark Fulfilled
                      </button>
                    )}
                    <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(r._id, 'cancelled')}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              {/* Matched Donors List */}
              {expandedRequest === r._id && matchedDonors[r._id] && matchedDonors[r._id].length > 0 && (
                <div className="card" style={{ marginTop: '-12px', padding: '16px', background: 'var(--bg3)', borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--red)' }}>
                    Matched Donors ({matchedDonors[r._id].length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {matchedDonors[r._id].map((donor, idx) => (
                      <div key={donor._id} style={{
                        padding: '10px', background: 'var(--bg2)', borderRadius: '6px', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between'
                      }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>#{idx + 1}</span> {donor.name}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text3)' }}>
                          <span><BloodTypeBadge type={donor.bloodType} size={20} /></span>
                          <span>{donor.city || '—'}</span>
                          <span>{donor.phone || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DonorsPage() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/users?role=donor').then(r => setDonors(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <SectionHeader title="Available Donors" />
      {loading ? <Loading /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Blood Type</th><th>City</th><th>Phone</th><th>Last Donation</th><th>Available</th></tr>
            </thead>
            <tbody>
              {donors.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td><BloodTypeBadge type={d.bloodType} size={28} /></td>
                  <td>{d.city || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{d.phone || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'Never'}</td>
                  <td><span className={`badge ${d.isAvailable ? 'badge-green' : 'badge-gray'}`}>{d.isAvailable ? 'Yes' : 'No'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function DoctorDashboard() {
  return (
    <DashboardLayout navItems={NAV} basePath="/doctor">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="donors" element={<DonorsPage />} />
        <Route path="ai" element={<div><SectionHeader title="AI Assistant" /><AIChat /></div>} />
        <Route path="notifications" element={<NotificationsPanel />} />
      </Routes>
    </DashboardLayout>
  )
}
