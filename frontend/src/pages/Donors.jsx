import React, { useState, useEffect, useCallback } from 'react';
import { donorsAPI } from '../utils/api.js';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiHeart, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PageStyles.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const emptyForm = {
  name: '', email: '', phone: '', bloodGroup: 'A+', age: '', gender: 'Male',
  weight: '', address: { city: '', street: '', state: '' },
  medicalHistory: { hasDiabetes: false, hasHypertension: false, hasHepatitis: false, hasHIV: false, recentSurgery: false },
};

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ search: '', bloodGroup: '', status: '', page: 1 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donorsAPI.getAll({ ...filters, limit: 10 });
      setDonors(res.data.donors);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load donors'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (d) => {
    setEditing(d._id);
    setForm({ ...d, medicalHistory: d.medicalHistory || emptyForm.medicalHistory, address: d.address || emptyForm.address });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await donorsAPI.update(editing, form);
      else await donorsAPI.create(form);
      toast.success(editing ? 'Donor updated!' : 'Donor registered!');
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving donor'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donor?')) return;
    try { await donorsAPI.delete(id); toast.success('Donor deleted'); load(); }
    catch { toast.error('Error deleting donor'); }
  };

  const handleDonate = async (id) => {
    try { await donorsAPI.donate(id); toast.success('🩸 Donation recorded!'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error recording donation'); }
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setMed = (field, val) => setForm(f => ({ ...f, medicalHistory: { ...f.medicalHistory, [field]: val } }));
  const setAddr = (field, val) => setForm(f => ({ ...f, address: { ...f.address, [field]: val } }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Donors</h1>
          <p className="page-subtitle">{total} registered donors</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Donor</button>
      </div>

      {/* Filters */}
      <div className="filters card">
        <div className="filter-search">
          <FiSearch className="search-icon" />
          <input placeholder="Search by name, email, phone..." value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
        <select value={filters.bloodGroup} onChange={e => setFilters(f => ({ ...f, bloodGroup: e.target.value, page: 1 }))}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deferred">Deferred</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Donor</th><th>Blood Group</th><th>Age/Gender</th>
                  <th>Phone</th><th>Donations</th><th>Last Donation</th>
                  <th>Eligible</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr><td colSpan={9} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No donors found</td></tr>
                ) : donors.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.email}</div>
                    </td>
                    <td><div className="blood-group-badge">{d.bloodGroup}</div></td>
                    <td>{d.age}y / {d.gender}</td>
                    <td>{d.phone}</td>
                    <td><span className="badge badge-info">{d.totalDonations} times</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      <span className={`badge ${d.isEligible ? 'badge-success' : 'badge-danger'}`}>
                        {d.isEligible ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td><span className={`badge badge-${d.status === 'active' ? 'success' : 'warning'}`}>{d.status}</span></td>
                    <td>
                      <div className="action-btns">
                        {d.isEligible && (
                          <button className="btn btn-sm btn-primary" onClick={() => handleDonate(d._id)} title="Record Donation">
                            <FiHeart />
                          </button>
                        )}
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(d)}><FiEdit2 /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        <div className="pagination">
          <span className="page-info">{donors.length} of {total}</span>
          <div className="page-btns">
            <button className="btn btn-sm btn-secondary" disabled={filters.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
            <span className="page-num">Page {filters.page}</span>
            <button className="btn btn-sm btn-secondary" disabled={donors.length < 10}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>🩸 {editing ? 'Edit Donor' : 'Register New Donor'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} required /></div>
                  <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                  <div className="form-group"><label>Phone *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
                  <div className="form-group"><label>Blood Group *</label>
                    <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                      {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Age *</label><input type="number" min={18} max={65} value={form.age} onChange={e => set('age', e.target.value)} required /></div>
                  <div className="form-group"><label>Gender *</label>
                    <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Weight (kg) *</label><input type="number" min={50} value={form.weight} onChange={e => set('weight', e.target.value)} required /></div>
                  <div className="form-group"><label>City</label><input value={form.address?.city || ''} onChange={e => setAddr('city', e.target.value)} /></div>
                </div>
                <div className="section-divider">Medical History</div>
                <div className="checkbox-grid">
                  {[['hasDiabetes','Diabetes'],['hasHypertension','Hypertension'],['hasHepatitis','Hepatitis'],['hasHIV','HIV'],['recentSurgery','Recent Surgery']].map(([k,l]) => (
                    <label key={k} className="checkbox-label">
                      <input type="checkbox" checked={form.medicalHistory?.[k] || false} onChange={e => setMed(k, e.target.checked)} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Update' : 'Register')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
