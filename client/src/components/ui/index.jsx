// StatCard
export function StatCard({ icon: Icon, label, value, color = 'var(--red)', bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg || `${color}18` }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

// UrgencyBadge
export function UrgencyBadge({ urgency }) {
  const map = {
    critical: { cls: 'badge-red', label: 'Critical' },
    high: { cls: '', label: 'High', style: { background: '#fff7ed', color: '#ea580c' } },
    medium: { cls: 'badge-yellow', label: 'Medium' },
    low: { cls: 'badge-green', label: 'Low' },
  }
  const m = map[urgency] || map.medium
  return <span className={`badge ${m.cls}`} style={m.style}>{m.label}</span>
}

// StatusBadge
export function StatusBadge({ status }) {
  const map = {
    pending: 'badge-yellow',
    matched: 'badge-blue',
    fulfilled: 'badge-green',
    cancelled: 'badge-gray',
    completed: 'badge-green',
    scheduled: 'badge-blue',
  }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>
}

// BloodTypeBadge
export function BloodTypeBadge({ type, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--red)', color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontSize: size * 0.33, fontWeight: 800,
      flexShrink: 0,
    }}>{type}</div>
  )
}

// Empty state
export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} />}
      <p>{message}</p>
    </div>
  )
}

// Loading
export function Loading() {
  return <div className="spinner" />
}

// Section header
export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{title}</h2>
      {action}
    </div>
  )
}
