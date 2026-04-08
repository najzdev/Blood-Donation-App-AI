import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { donorsAPI, patientsAPI, inventoryAPI, requestsAPI, aiAPI } from '../utils/api.js';
import { FiUsers, FiUser, FiDroplet, FiActivity, FiAlertTriangle, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const BLOOD_COLORS = {
  'A+': '#ef4444', 'A-': '#f97316', 'B+': '#f59e0b', 'B-': '#eab308',
  'AB+': '#8b5cf6', 'AB-': '#6366f1', 'O+': '#3b82f6', 'O-': '#06b6d4'
};

export default function Dashboard() {
  const [stats, setStats] = useState({ donors: 0, patients: 0, requests: 0, units: 0 });
  const [inventory, setInventory] = useState([]);
  const [criticalPatients, setCriticalPatients] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [donorsRes, patientsRes, requestsRes, invRes, critRes] = await Promise.all([
        donorsAPI.getAll({ limit: 1 }),
        patientsAPI.getAll({ limit: 1 }),
        requestsAPI.getAll({ limit: 1 }),
        inventoryAPI.getAll(),
        patientsAPI.getCritical(),
      ]);
      setStats({
        donors: donorsRes.data.total || 0,
        patients: patientsRes.data.total || 0,
        requests: requestsRes.data.total || 0,
        units: invRes.data.inventory?.reduce((a, b) => a + b.unitsAvailable, 0) || 0,
      });
      setInventory(invRes.data.inventory || []);
      setCriticalPatients(critRes.data.patients?.slice(0, 5) || []);

      // Load AI insights
      const insRes = await aiAPI.insights();
      setInsights(insRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Donors', value: stats.donors, icon: <FiUsers />, color: '#3b82f6', link: '/donors' },
    { label: 'Patients Waiting', value: stats.patients, icon: <FiUser />, color: '#f59e0b', link: '/patients' },
    { label: 'Blood Requests', value: stats.requests, icon: <FiActivity />, color: '#8b5cf6', link: '/requests' },
    { label: 'Blood Units', value: stats.units, icon: <FiDroplet />, color: '#ef4444', link: '/inventory' },
  ];

  const barData = {
    labels: inventory.map(i => i.bloodGroup),
    datasets: [{
      label: 'Units Available',
      data: inventory.map(i => i.unitsAvailable),
      backgroundColor: inventory.map(i => BLOOD_COLORS[i.bloodGroup] + '99'),
      borderColor: inventory.map(i => BLOOD_COLORS[i.bloodGroup]),
      borderWidth: 2, borderRadius: 6,
    }],
  };

  const donutData = {
    labels: criticalPatients.map(p => p.name),
    datasets: [{
      data: criticalPatients.map(p => p.aiAnalysis?.priorityScore || 50),
      backgroundColor: ['#ef4444','#f97316','#f59e0b','#8b5cf6','#3b82f6'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(51,65,85,0.4)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(51,65,85,0.4)' }, ticks: { color: '#94a3b8' } },
    },
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="dashboard">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">🩸 Dashboard</h1>
          <p className="page-subtitle">Blood bank overview and real-time insights</p>
        </div>
        <Link to="/ai-analysis" className="btn btn-primary">
          <FiCpu /> Run AI Analysis
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map(card => (
          <Link to={card.link} key={card.label} className="stat-card" style={{ '--card-color': card.color }}>
            <div className="stat-icon" style={{ background: card.color + '22', color: card.color }}>{card.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Insights */}
      {insights?.insights?.insights && (
        <div className="insights-section">
          <h3 className="section-title"><FiCpu /> AI Insights {!insights.usingAI && <span className="badge badge-warning" style={{fontSize:'0.7rem'}}>Demo Mode</span>}</h3>
          <div className="insights-grid">
            {insights.insights.insights.map((ins, i) => (
              <div key={i} className={`insight-card insight-${ins.type}`}>
                <div className="insight-title">{ins.title}</div>
                <div className="insight-desc">{ins.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="charts-row">
        <div className="card chart-card">
          <h3 className="section-title">Blood Inventory by Group</h3>
          <div style={{ height: 220 }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="flex-between mb-4">
            <h3 className="section-title">Critical Patients</h3>
            <Link to="/patients?urgency=critical" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {criticalPatients.length > 0 ? (
            <div className="critical-list">
              {criticalPatients.map(p => (
                <div key={p._id} className="critical-item">
                  <div className="blood-group-badge">{p.bloodGroup}</div>
                  <div className="critical-info">
                    <div className="critical-name">{p.name}</div>
                    <div className="critical-sub">{p.hospital} · {p.diagnosis}</div>
                  </div>
                  <div className="critical-right">
                    <span className={`badge badge-${p.urgencyLevel}`}>{p.urgencyLevel}</span>
                    <div className="priority-val">{p.aiAnalysis?.priorityScore || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><FiAlertTriangle /><p>No critical patients</p></div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="flex-between mb-4">
          <h3 className="section-title"><FiDroplet /> Blood Inventory Status</h3>
          <Link to="/inventory" className="btn btn-sm btn-secondary">Manage</Link>
        </div>
        <div className="inv-grid">
          {inventory.map(inv => (
            <div key={inv.bloodGroup} className={`inv-item ${inv.unitsAvailable <= 5 ? 'critical' : inv.unitsAvailable <= 10 ? 'low' : 'good'}`}>
              <div className="inv-bg">{inv.bloodGroup}</div>
              <div className="inv-units">{inv.unitsAvailable}</div>
              <div className="inv-label">units</div>
              {inv.unitsAvailable <= 5 && <div className="inv-alert">⚠ Critical</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
