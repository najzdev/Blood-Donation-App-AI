import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FiHome, FiUsers, FiUser, FiActivity, FiDroplet,
  FiCpu, FiMessageSquare, FiLogOut, FiMenu, FiX, FiBell
} from 'react-icons/fi';
import './Layout.css';

const navItems = [
  { to: '/', icon: <FiHome />, label: 'Dashboard', end: true },
  { to: '/donors', icon: <FiUsers />, label: 'Donors' },
  { to: '/patients', icon: <FiUser />, label: 'Patients' },
  { to: '/requests', icon: <FiActivity />, label: 'Blood Requests' },
  { to: '/inventory', icon: <FiDroplet />, label: 'Inventory' },
  { to: '/ai-analysis', icon: <FiCpu />, label: 'AI Analysis' },
  { to: '/ai-chat', icon: <FiMessageSquare />, label: 'AI Assistant' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🩸</span>
            {sidebarOpen && <span className="logo-text">Dem <span>AI</span></span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu />
            </button>
          </div>
          <div className="topbar-right">
            <button className="icon-btn"><FiBell /></button>
            <div className="topbar-user">
              <div className="user-avatar-sm">{user?.name?.charAt(0).toUpperCase()}</div>
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
