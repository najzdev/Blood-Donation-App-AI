import React, { useState, useEffect } from 'react';
import { aiAPI, patientsAPI } from '../utils/api.js';
import { FiCpu, FiRefreshCw, FiAlertTriangle, FiCheck, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AIAnalysis.css';

const immediacyIcon = { immediate: '🚨', within_hours: '⚡', within_24h: '⏰', scheduled: '📅' };
const immediacyColor = { immediate: 'danger', within_hours: 'warning', within_24h: 'info', scheduled: 'success' };

export default function AIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastAnalyzed, setLastAnalyzed] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await patientsAPI.getAll({ status: 'waiting', limit: 50 });
      setPatients(res.data.patients || []);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await aiAPI.analyzePatients();
      setResults(res.data);
      setLastAnalyzed(new Date());
      toast.success(res.data.usingAI ? '🤖 Gemini AI analysis complete!' : '✅ Algorithmic analysis complete!');
      await loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Patient Analysis</h1>
          <p className="page-subtitle">Gemini AI prioritizes patients by medical urgency and blood availability</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={runAnalysis} disabled={analyzing}>
          {analyzing ? <><div className="spinner-sm" /> Analyzing...</> : <><FiCpu /> Run AI Analysis</>}
        </button>
      </div>

      {/* AI Info Banner */}
      <div className="ai-banner">
        <div className="ai-banner-icon">🧠</div>
        <div className="ai-banner-text">
          <div className="ai-banner-title">How AI Analysis Works</div>
          <div className="ai-banner-desc">
            Gemini AI evaluates each waiting patient based on: urgency level, hemoglobin levels,
            oxygen saturation, diagnosis severity, time waiting, and available blood inventory.
            It assigns a priority score (0–100) and recommends immediate action timing.
          </div>
        </div>
        {results && (
          <div className="ai-banner-badge">
            <span className={`badge badge-${results.usingAI ? 'info' : 'warning'}`}>
              {results.usingAI ? '✨ Powered by Gemini' : '⚙ Algorithmic Mode'}
            </span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Waiting Patients', value: patients.length, color: 'var(--warning)', icon: <FiClock /> },
          { label: 'Critical', value: patients.filter(p => p.urgencyLevel === 'critical').length, color: 'var(--danger)', icon: <FiAlertTriangle /> },
          { label: 'Analyzed', value: results?.results?.length || 0, color: 'var(--info)', icon: <FiCpu /> },
          { label: 'Last Run', value: lastAnalyzed ? lastAnalyzed.toLocaleTimeString() : 'Never', color: 'var(--success)', icon: <FiCheck /> },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '22', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {results?.results?.length > 0 ? (
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="section-title">📊 Priority Ranking Results</h3>
            <button className="btn btn-sm btn-secondary" onClick={runAnalysis} disabled={analyzing}><FiRefreshCw /> Re-analyze</button>
          </div>
          <div className="analysis-list">
            {results.results.map((r, i) => r.patient && (
              <div key={i} className={`analysis-item priority-${r.immediacy}`}>
                <div className="analysis-rank">#{i + 1}</div>
                <div className="analysis-patient">
                  <div className="blood-group-badge">{r.patient.bloodGroup}</div>
                  <div>
                    <div className="analysis-name">{r.patient.name}</div>
                    <div className="analysis-sub">{r.patient.hospital} · {r.patient.diagnosis}</div>
                  </div>
                </div>
                <div className="analysis-urgency">
                  <span className={`badge badge-${r.patient.urgencyLevel === 'critical' ? 'danger' : r.patient.urgencyLevel === 'urgent' ? 'warning' : 'info'}`}>
                    {r.patient.urgencyLevel}
                  </span>
                </div>
                <div className="analysis-score-section">
                  <div className="analysis-score" style={{ color: r.priorityScore >= 80 ? 'var(--danger)' : r.priorityScore >= 60 ? 'var(--warning)' : 'var(--success)' }}>
                    {r.priorityScore}
                  </div>
                  <div className="priority-bar" style={{ width: 80 }}>
                    <div className="priority-fill" style={{ width: `${r.priorityScore}%`, background: r.priorityScore >= 80 ? 'var(--danger)' : r.priorityScore >= 60 ? 'var(--warning)' : 'var(--success)' }} />
                  </div>
                </div>
                <div className="analysis-immediacy">
                  <span className={`badge badge-${immediacyColor[r.immediacy]}`}>
                    {immediacyIcon[r.immediacy]} {r.immediacy?.replace('_', ' ')}
                  </span>
                </div>
                <div className="analysis-recommendation">{r.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="ai-empty">
            <div className="ai-empty-icon">🤖</div>
            <h3>Ready for Analysis</h3>
            <p>Click "Run AI Analysis" to have Gemini AI prioritize all waiting patients based on their medical conditions and urgency.</p>
            <button className="btn btn-primary btn-lg" onClick={runAnalysis} disabled={analyzing || patients.length === 0}>
              <FiCpu /> {patients.length === 0 ? 'No Patients Waiting' : 'Start AI Analysis'}
            </button>
          </div>
        </div>
      )}

      {/* Patient Table */}
      {patients.length > 0 && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>📋 Waiting Patients ({patients.length})</h3>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Patient</th><th>Blood Group</th><th>Hospital</th><th>Urgency</th>
                <th>Units Needed</th><th>AI Priority</th><th>Recommendation</th>
              </tr></thead>
              <tbody>
                {patients.sort((a,b) => (b.aiAnalysis?.priorityScore || 0) - (a.aiAnalysis?.priorityScore || 0)).map(p => (
                  <tr key={p._id}>
                    <td><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.age}y</div></td>
                    <td><div className="blood-group-badge">{p.bloodGroup}</div></td>
                    <td style={{ fontSize: '0.85rem' }}>{p.hospital}</td>
                    <td><span className={`badge badge-${p.urgencyLevel === 'critical' ? 'danger' : p.urgencyLevel === 'urgent' ? 'warning' : 'info'}`}>{p.urgencyLevel}</span></td>
                    <td>{p.unitsRequired - p.unitsProvided} units</td>
                    <td>
                      {p.aiAnalysis?.priorityScore ? (
                        <div>
                          <div style={{ fontWeight: 800, color: p.aiAnalysis.priorityScore >= 80 ? 'var(--danger)' : p.aiAnalysis.priorityScore >= 60 ? 'var(--warning)' : 'var(--success)' }}>
                            {p.aiAnalysis.priorityScore}/100
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>Not analyzed</span>}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 200 }}>
                      {p.aiAnalysis?.recommendation || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
