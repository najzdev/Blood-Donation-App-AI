import React, { useState, useEffect, useCallback } from 'react';
import { requestsAPI, patientsAPI, donorsAPI } from '../utils/api.js';
import { FiPlus, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PageStyles.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const statusColor = { pending: 'warning', approved: 'info', matched: 'info', completed: 'success', rejected: 'danger', cancelled: 'danger' };

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', urgency: '', page: 1 });
  const [form, setForm] = useState({ patientId: '', bloodGroup: 'A+', unitsRequested: 1, urgency: 'moderate', notes: '' });
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestsAPI.getAll({ ...filters, limit: 10 });
      setRequests(res.data.requests); setTotal(res.data.total);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    const res = await patientsAPI.getAll({ status: 'waiting', limit: 100 });
    setPatients(res.data.patients || []);
    setForm({ patientId: '', bloodGroup: 'A+', unitsRequested: 1, urgency: 'moderate', notes: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await requestsAPI.create({ patient: form.patientId, ...form });
      toast.success('Request created!'); setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try { await requestsAPI.updateStatus(id, { status }); toast.success(`Request ${status}`); load(); }
    catch { toast.error('Error updating status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try { await requestsAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">📋 Blood Requests</h1><p className="page-subtitle">{total} total requests</p></div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Request</button>
      </div>

      <div className="filters card">
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['pending','approved','matched','completed','rejected','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <select value={filters.urgency} onChange={e => setFilters(f => ({ ...f, urgency: e.target.value, page: 1 }))}>
          <option value="">All Urgency</option>
          {['critical','urgent','moderate','low'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Patient</th><th>Blood Group</th><th>Units</th><th>Urgency</th>
                <th>Donor</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={8} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No requests found</td></tr>
                ) : requests.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.patient?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.patient?.hospital}</div>
                    </td>
                    <td><div className="blood-group-badge">{r.bloodGroup}</div></td>
                    <td>{r.unitsRequested} unit{r.unitsRequested > 1 ? 's' : ''}</td>
                    <td><span className={`badge badge-${r.urgency === 'critical' ? 'danger' : r.urgency === 'urgent' ? 'warning' : 'info'}`}>{r.urgency}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{r.donor?.name || <span style={{ color: 'var(--text-muted)' }}>Not assigned</span>}</td>
                    <td><span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        {r.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => updateStatus(r._id, 'approved')} title="Approve"><FiCheck /></button>}
                        {['pending','approved','matched'].includes(r.status) && <button className="btn btn-sm btn-success" onClick={() => updateStatus(r._id, 'completed')} title="Complete">✓✓</button>}
                        {r.status !== 'completed' && r.status !== 'cancelled' && <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(r._id, 'cancelled')} title="Cancel"><FiX /></button>}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <span className="page-info">{requests.length} of {total}</span>
          <div className="page-btns">
            <button className="btn btn-sm btn-secondary" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
            <span className="page-num">Page {filters.page}</span>
            <button className="btn btn-sm btn-secondary" disabled={requests.length < 10} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>📋 New Blood Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group"><label>Patient *</label>
                  <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} required>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.bloodGroup} ({p.hospital})</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label>Blood Group *</label>
                    <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                      {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Units Requested *</label>
                    <input type="number" min={1} value={form.unitsRequested} onChange={e => setForm(f => ({ ...f, unitsRequested: e.target.value }))} required />
                  </div>
                  <div className="form-group"><label>Urgency *</label>
                    <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                      {['critical','urgent','moderate','low'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
