import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../utils/api.js';
import { FiEdit2, FiDroplet, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PageStyles.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const BG_COLORS = { 'A+':'#ef4444','A-':'#f97316','B+':'#f59e0b','B-':'#eab308','AB+':'#8b5cf6','AB-':'#6366f1','O+':'#3b82f6','O-':'#06b6d4' };

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ unitsAvailable: 0, unitsReserved: 0, criticalThreshold: 5 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getAll();
      setInventory(res.data.inventory || []);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const openEdit = (inv) => {
    setEditing(inv.bloodGroup);
    setEditForm({ unitsAvailable: inv.unitsAvailable, unitsReserved: inv.unitsReserved || 0, criticalThreshold: inv.criticalThreshold || 5 });
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await inventoryAPI.update(editing, editForm);
      toast.success('Inventory updated!');
      setEditing(null); load();
    } catch { toast.error('Error updating'); }
    finally { setSaving(false); }
  };

  const totalUnits = inventory.reduce((a, b) => a + b.unitsAvailable, 0);
  const criticalGroups = inventory.filter(i => i.unitsAvailable <= (i.criticalThreshold || 5));

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">🩸 Blood Inventory</h1><p className="page-subtitle">Manage blood stock levels</p></div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--red-primary)' }}>{totalUnits}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Units Available</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: criticalGroups.length > 0 ? 'var(--danger)' : 'var(--success)' }}>{criticalGroups.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Critical Blood Groups</div>
          {criticalGroups.length > 0 && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{criticalGroups.map(g => g.bloodGroup).join(', ')}</div>}
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--info)' }}>{BLOOD_GROUPS.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Blood Group Types</div>
        </div>
      </div>

      {/* Critical Alert */}
      {criticalGroups.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiAlertTriangle color="var(--danger)" size={18} />
          <div>
            <strong style={{ color: 'var(--danger)' }}>Critical Stock Alert:</strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>{criticalGroups.map(g => `${g.bloodGroup} (${g.unitsAvailable} units)`).join(' · ')}</span>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {inventory.map(inv => {
          const isCritical = inv.unitsAvailable <= (inv.criticalThreshold || 5);
          const pct = Math.min((inv.unitsAvailable / 30) * 100, 100);
          const color = BG_COLORS[inv.bloodGroup];
          return (
            <div key={inv.bloodGroup} className="card" style={{ border: isCritical ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              {isCritical && (
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>⚠ Critical</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '22', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', border: `1px solid ${color}44` }}>
                  {inv.bloodGroup}
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{inv.unitsAvailable}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>units available</div>
                </div>
              </div>
              <div className="priority-bar" style={{ marginBottom: 8 }}>
                <div className="priority-fill" style={{ width: `${pct}%`, background: isCritical ? 'var(--danger)' : pct > 60 ? 'var(--success)' : 'var(--warning)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                <span>Reserved: {inv.unitsReserved || 0}</span>
                <span>Threshold: {inv.criticalThreshold || 5}</span>
              </div>
              {editing === inv.bloodGroup ? (
                <form onSubmit={handleSave}>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <input type="number" min={0} value={editForm.unitsAvailable} onChange={e => setEditForm(f => ({ ...f, unitsAvailable: +e.target.value }))} placeholder="Available" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <input type="number" min={0} value={editForm.unitsReserved} onChange={e => setEditForm(f => ({ ...f, unitsReserved: +e.target.value }))} placeholder="Reserved" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <input type="number" min={1} value={editForm.criticalThreshold} onChange={e => setEditForm(f => ({ ...f, criticalThreshold: +e.target.value }))} placeholder="Critical threshold" />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="submit" className="btn btn-sm btn-primary" style={{ flex: 1 }} disabled={saving}>Save</button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setEditing(null)}>✕</button>
                  </div>
                </form>
              ) : (
                <button className="btn btn-sm btn-secondary" style={{ width: '100%' }} onClick={() => openEdit(inv)}>
                  <FiEdit2 /> Edit Stock
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Table View */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 16 }}><FiDroplet /> Inventory Summary Table</h3>
        <div className="table-container">
          <table>
            <thead><tr>
              <th>Blood Group</th><th>Available</th><th>Reserved</th><th>Total</th>
              <th>Critical Threshold</th><th>Status</th><th>Last Updated</th>
            </tr></thead>
            <tbody>
              {inventory.map(inv => (
                <tr key={inv.bloodGroup}>
                  <td><div className="blood-group-badge">{inv.bloodGroup}</div></td>
                  <td style={{ fontWeight: 700 }}>{inv.unitsAvailable}</td>
                  <td>{inv.unitsReserved || 0}</td>
                  <td>{(inv.unitsAvailable || 0) + (inv.unitsReserved || 0)}</td>
                  <td>{inv.criticalThreshold || 5}</td>
                  <td>
                    <span className={`badge badge-${inv.unitsAvailable <= (inv.criticalThreshold || 5) ? 'danger' : inv.unitsAvailable <= 10 ? 'warning' : 'success'}`}>
                      {inv.unitsAvailable <= (inv.criticalThreshold || 5) ? '⚠ Critical' : inv.unitsAvailable <= 10 ? '⬇ Low' : '✓ Adequate'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(inv.lastUpdated || inv.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
