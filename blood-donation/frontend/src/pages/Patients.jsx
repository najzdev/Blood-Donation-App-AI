import React, { useState, useEffect, useCallback } from 'react';
import { patientsAPI, aiAPI } from '../utils/api.js';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PageStyles.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const empty = {
  name: '', email: '', phone: '', bloodGroup: 'A+', age: '', gender: 'Male',
  hospital: '', ward: '', doctor: '', diagnosis: '', urgencyLevel: 'moderate',
  unitsRequired: 1,
  medicalCondition: { hemoglobinLevel: '', bloodPressure: '', oxygenSaturation: '', hasAnemia: false, hasCancer: false, hasSurgery: false, hasThalassemia: false, notes: '' },
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filters, setFilters] = useState({ search: '', bloodGroup: '', urgencyLevel: '', status: '', page: 1 });
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientsAPI.getAll({ ...filters, limit: 10 });
      setPatients(res.data.patients); setTotal(res.data.total);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (p) => { setEditing(p._id); setForm({ ...p, medicalCondition: p.medicalCondition || empty.medicalCondition }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await patientsAPI.update(editing, form);
      else await patientsAPI.create(form);
      toast.success(editing ? 'Patient updated!' : 'Patient registered!');
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try { await patientsAPI.delete(id); toast.success('Patient deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const handleMatch = async (patient) => {
    setSelectedPatient(patient); setMatchResult(null); setShowMatchModal(true); setMatching(true);
    try {
      const res = await aiAPI.matchDonor(patient._id);
      setMatchResult(res.data);
    } catch { toast.error('AI matching failed'); }
    finally { setMatching(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setMed = (k, v) => setForm(f => ({ ...f, medicalCondition: { ...f.medicalCondition, [k]: v } }));

  const urgencyColor = { critical: 'danger', urgent: 'warning', moderate: 'info', low: 'success' };
  const statusColor = { waiting: 'warning', partially_fulfilled: 'info', fulfilled: 'success', cancelled: 'danger' };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">🏥 Patients</h1><p className="page-subtitle">{total} registered patients</p></div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Patient</button>
      </div>

      <div className="filters card">
        <div className="filter-search">
          <FiSearch className="search-icon" />
          <input placeholder="Search name, hospital, diagnosis..." value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
        <select value={filters.bloodGroup} onChange={e => setFilters(f => ({ ...f, bloodGroup: e.target.value, page: 1 }))}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
        </select>
        <select value={filters.urgencyLevel} onChange={e => setFilters(f => ({ ...f, urgencyLevel: e.target.value, page: 1 }))}>
          <option value="">All Urgency</option>
          {['critical','urgent','moderate','low'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['waiting','partially_fulfilled','fulfilled','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Patient</th><th>Blood Group</th><th>Hospital</th><th>Diagnosis</th>
                <th>Urgency</th><th>Units</th><th>AI Score</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={9} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No patients found</td></tr>
                ) : patients.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.age}y / {p.gender}</div>
                    </td>
                    <td><div className="blood-group-badge">{p.bloodGroup}</div></td>
                    <td style={{ fontSize: '0.85rem' }}>{p.hospital}</td>
                    <td style={{ fontSize: '0.85rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diagnosis}</td>
                    <td><span className={`badge badge-${urgencyColor[p.urgencyLevel]}`}>{p.urgencyLevel}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{p.unitsProvided}/{p.unitsRequired}</td>
                    <td>
                      {p.aiAnalysis?.priorityScore ? (
                        <div>
                          <div style={{ fontWeight: 700, color: p.aiAnalysis.priorityScore >= 80 ? 'var(--danger)' : p.aiAnalysis.priorityScore >= 60 ? 'var(--warning)' : 'var(--success)' }}>
                            {p.aiAnalysis.priorityScore}
                          </div>
                          <div className="priority-bar" style={{ width: 60 }}>
                            <div className="priority-fill" style={{ width: `${p.aiAnalysis.priorityScore}%`, background: p.aiAnalysis.priorityScore >= 80 ? 'var(--danger)' : 'var(--warning)' }} />
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td><span className={`badge badge-${statusColor[p.status]}`}>{p.status?.replace('_',' ')}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-primary" onClick={() => handleMatch(p)} title="AI Match Donor"><FiCpu /></button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}><FiEdit2 /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <span className="page-info">{patients.length} of {total}</span>
          <div className="page-btns">
            <button className="btn btn-sm btn-secondary" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
            <span className="page-num">Page {filters.page}</span>
            <button className="btn btn-sm btn-secondary" disabled={patients.length < 10} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 750 }}>
            <div className="modal-header">
              <h2>🏥 {editing ? 'Edit Patient' : 'Register Patient'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} required /></div>
                  <div className="form-group"><label>Phone *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
                  <div className="form-group"><label>Blood Group *</label>
                    <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                      {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Age *</label><input type="number" min={1} value={form.age} onChange={e => set('age', e.target.value)} required /></div>
                  <div className="form-group"><label>Gender *</label>
                    <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Hospital *</label><input value={form.hospital} onChange={e => set('hospital', e.target.value)} required /></div>
                  <div className="form-group"><label>Doctor</label><input value={form.doctor} onChange={e => set('doctor', e.target.value)} /></div>
                  <div className="form-group"><label>Ward</label><input value={form.ward} onChange={e => set('ward', e.target.value)} /></div>
                </div>
                <div className="form-group"><label>Diagnosis *</label><textarea rows={2} value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} required /></div>
                <div className="grid-2">
                  <div className="form-group"><label>Urgency Level *</label>
                    <select value={form.urgencyLevel} onChange={e => set('urgencyLevel', e.target.value)}>
                      {['critical','urgent','moderate','low'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Units Required *</label><input type="number" min={1} value={form.unitsRequired} onChange={e => set('unitsRequired', e.target.value)} required /></div>
                </div>
                <div className="section-divider">Medical Condition</div>
                <div className="grid-3">
                  <div className="form-group"><label>Hemoglobin (g/dL)</label><input type="number" step="0.1" value={form.medicalCondition.hemoglobinLevel} onChange={e => setMed('hemoglobinLevel', e.target.value)} /></div>
                  <div className="form-group"><label>Blood Pressure</label><input placeholder="120/80" value={form.medicalCondition.bloodPressure} onChange={e => setMed('bloodPressure', e.target.value)} /></div>
                  <div className="form-group"><label>O₂ Saturation (%)</label><input type="number" min={0} max={100} value={form.medicalCondition.oxygenSaturation} onChange={e => setMed('oxygenSaturation', e.target.value)} /></div>
                </div>
                <div className="checkbox-grid">
                  {[['hasAnemia','Anemia'],['hasCancer','Cancer'],['hasSurgery','Surgery'],['hasThalassemia','Thalassemia']].map(([k,l]) => (
                    <label key={k} className="checkbox-label">
                      <input type="checkbox" checked={form.medicalCondition[k] || false} onChange={e => setMed(k, e.target.checked)} />
                      {l}
                    </label>
                  ))}
                </div>
                <div className="form-group mt-2"><label>Clinical Notes</label><textarea rows={2} value={form.medicalCondition.notes} onChange={e => setMed('notes', e.target.value)} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Update' : 'Register')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Match Modal */}
      {showMatchModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMatchModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <h2>🤖 AI Donor Matching</h2>
                {matchResult && <span className="ai-badge">✨ {matchResult.usingAI ? 'Gemini AI' : 'Algorithmic'}</span>}
              </div>
              <button className="modal-close" onClick={() => setShowMatchModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {selectedPatient && (
                <div className="card" style={{ background: 'var(--bg-card2)', marginBottom: 16 }}>
                  <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
                    <div className="blood-group-badge">{selectedPatient.bloodGroup}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedPatient.hospital} · {selectedPatient.diagnosis}</div>
                    </div>
                    <span className={`badge badge-${urgencyColor[selectedPatient.urgencyLevel]}`} style={{ marginLeft: 'auto' }}>{selectedPatient.urgencyLevel}</span>
                  </div>
                  {matchResult && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>Compatible: {matchResult.compatibleBloodGroups?.join(', ')}</div>}
                </div>
              )}
              {matching ? (
                <div className="loading-overlay"><div className="spinner" /><p>AI is finding best matches...</p></div>
              ) : matchResult?.matches?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {matchResult.matches.map((m, i) => m.donor && (
                    <div key={i} className="match-card">
                      <div className="match-rank">#{i + 1}</div>
                      <div className="blood-group-badge">{m.donor.bloodGroup}</div>
                      <div className="match-info">
                        <div className="match-name">{m.donor.name}</div>
                        <div className="match-sub">{m.donor.phone} · {m.bloodGroupMatch === 'exact' ? '✓ Exact Match' : '~ Compatible'}</div>
                        <div className="match-sub" style={{ marginTop: 2 }}>{m.reason}</div>
                      </div>
                      <div className="match-score">
                        <div className="match-score-val">{m.matchScore}%</div>
                        <div className="match-score-label">Match</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : matchResult ? (
                <div className="empty-state"><p>No eligible donors found for this blood group.</p></div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
