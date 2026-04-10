import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('Account created successfully!');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-circle c1" />
        <div className="bg-circle c2" />
        <div className="bg-circle c3" />
      </div>

      <div className="login-left">
        <div className="brand">
          <span className="brand-icon">🩸</span>
          <h1>Dem AI</h1>
        </div>
        <h2>Intelligent Blood Donation Management</h2>
        <p>Powered by AI to match donors with patients and save lives faster.</p>
        <div className="features">
          {['🤖 AI-powered patient prioritization', '🔬 Smart donor-patient matching', '📊 Real-time inventory tracking', '⚡ Critical alert system'].map(f => (
            <div key={f} className="feature-item">{f}</div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isRegister ? 'Register to manage the blood bank' : 'Sign in to your account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. Ahmed Hassan" required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={form.role} onChange={handleChange}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="donor">Donor</option>
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@bloodbank.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Please wait...' : (isRegister ? '🩸 Create Account' : '🔑 Sign In')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button className="link-btn" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? ' Sign In' : ' Register'}
              </button>
            </p>
          </div>

          <div className="demo-creds">
            <p>Demo: <strong>admin@bloodbank.com</strong> / <strong>admin123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
