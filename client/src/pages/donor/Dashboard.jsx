import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, UrgencyBadge, StatusBadge, BloodTypeBadge, Loading, SectionHeader, EmptyState } from '../../components/ui/index.jsx'
import NotificationsPanel from '../../components/dashboard/NotificationsPanel'
import AIChat from '../../components/dashboard/AIChat'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, Droplets, FileText, Bell, Brain, Heart, MapPin, Calendar } from 'lucide-react'

const NAV = [
  { path: '', label: 'dashboard.overview', icon: LayoutDashboard },
  { path: '/available', label: 'dashboard.requests', icon: FileText },
  { path: '/donations', label: 'dashboard.donations', icon: Droplets },
  { path: '/ai', label: 'dashboard.ai_match', icon: Brain },
  { path: '/notifications', label: 'dashboard.notifications', icon: Bell },
]

function Overview() {
  const { user } = useAuth()
  const [myDonations, setMyDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/donations').then(r => setMyDonations(r.data)).finally(() => setLoading(false))
  }, [])

  const completed = myDonations.filter(d => d.status === 'completed').length
  const scheduled = myDonations.filter(d => d.status === 'scheduled').length

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '28px' }}>Donor Dashboard</h1>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, var(--red) 0%, #b91c1c 100%)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800
          }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{user?.name}</div>
            <div style={{ opacity: 0.85, fontSize: '14px', marginTop: '4px' }}>
              Blood Type: <strong>{user?.bloodType || 'Not set'}</strong> · {user?.city || 'Location not set'}
            </div>
          </div>
          {user?.bloodType && (
            <div style={{ marginLeft: 'auto', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
              {user.bloodType}
            </div>
          )}
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <StatCard icon={Heart} label="Total Donations" value={myDonations.length} color="var(--red)" />
        <StatCard icon={Droplets} label="Completed" value={completed} color="#16a34a" />
        <StatCard icon={Calendar} label="Scheduled" value={scheduled} color="#2563eb" />
      </div>

      {loading ? <Loading /> : myDonations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Heart size={48} color="var(--red)" style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p style={{ color: 'var(--text2)' }}>You haven't donated yet. Check available requests to get started!</p>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Donations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myDonations.slice(0, 5).map(d => (
              <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <BloodTypeBadge type={d.bloodType} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{d.units} units</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{d.hospital || d.city}</div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AvailableRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/requests?status=pending').then(r => setRequests(r.data)).finally(() => setLoading(false))
  }, [])

  const respond = async (requestId, bloodType) => {
    try {
      await api.post('/donations', {
        request: requestId,
        bloodType,
        units: 1,
        status: 'scheduled',
      })
      toast.success('Donation scheduled! Thank you!')
      setRequests(r => r.filter(x => x._id !== requestId))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  return (
    <div>
      <SectionHeader title="Blood Requests Needing Donors" />
      {loading ? <Loading /> : requests.length === 0 ? (
        <EmptyState icon={Heart} message="No pending requests at this time" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {requests.map(r => (
            <div key={r._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <BloodTypeBadge type={r.bloodType} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <UrgencyBadge urgency={r.urgency} />
                    <span style={{ fontSize: '13px', color: 'var(--text2)' }}>
                      <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {r.hospital || r.city}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <strong>{r.units}</strong> unit(s) of <strong>{r.bloodType}</strong> needed
                  </div>
                  {r.requiredBy && (
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                      Required by: {new Date(r.requiredBy).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => respond(r._id, r.bloodType)}>
                  <Heart size={14} /> Donate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MyDonations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/donations').then(r => setDonations(r.data)).finally(() => setLoading(false))
  }, [])
  return (
    <div>
      <SectionHeader title="My Donations" />
      {loading ? <Loading /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Blood Type</th><th>Units</th><th>Status</th><th>Date</th><th>Hospital</th></tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id}>
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

export default function DonorDashboard() {
  return (
    <DashboardLayout navItems={NAV} basePath="/donor">
      <Routes>
        <Route index element={<Overview />} />
        <Route path="available" element={<AvailableRequests />} />
        <Route path="donations" element={<MyDonations />} />
        <Route path="ai" element={<div><SectionHeader title="AI Assistant" /><AIChat /></div>} />
        <Route path="notifications" element={<NotificationsPanel />} />
      </Routes>
    </DashboardLayout>
  )
}
