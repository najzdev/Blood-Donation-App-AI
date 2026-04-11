// import { Routes, Route, Navigate } from 'react-router-dom'
// import { useAuth } from './context/AuthContext'
// import { useTranslation } from 'react-i18next'
// import { useEffect } from 'react'

// // Pages
// import Home from './pages/Home'
// import About from './pages/About'
// import Login from './pages/Login'
// import Register from './pages/Register'

// // Dashboards
// import AdminDashboard from './pages/admin/Dashboard'
// import DoctorDashboard from './pages/doctor/Dashboard'
// import DonorDashboard from './pages/donor/Dashboard'
// import PatientDashboard from './pages/patient/Dashboard'

// function ProtectedRoute({ children, roles }) {
//   const { user, loading } = useAuth()
//   if (loading) return <div className="page-loader"><div className="spinner" /></div>
//   if (!user) return <Navigate to="/login" replace />
//   if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
//   return children
// }

// function DashboardRedirect() {
//   const { user } = useAuth()
//   if (!user) return <Navigate to="/login" replace />
//   const paths = { admin: '/admin', doctor: '/doctor', donor: '/donor', patient: '/patient' }
//   return <Navigate to={paths[user.role] || '/login'} replace />
// }

// export default function App() {
//   const { i18n } = useTranslation()

//   useEffect(() => {
//     document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
//     document.documentElement.lang = i18n.language
//   }, [i18n.language])

//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/about" element={<About />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/dashboard" element={<DashboardRedirect />} />

//       <Route path="/admin/*" element={
//         <ProtectedRoute roles={['admin']}>
//           <AdminDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="/doctor/*" element={
//         <ProtectedRoute roles={['doctor']}>
//           <DoctorDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="/donor/*" element={
//         <ProtectedRoute roles={['donor']}>
//           <DonorDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="/patient/*" element={
//         <ProtectedRoute roles={['patient']}>
//           <PatientDashboard />
//         </ProtectedRoute>
//       } />
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   )
// }

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'

// Dashboards
import AdminDashboard from './pages/admin/Dashboard'
import DoctorDashboard from './pages/doctor/Dashboard'
import DonorDashboard from './pages/donor/Dashboard'
import PatientDashboard from './pages/patient/Dashboard'

function ProtectedRoute({ children, roles }) {
  // Commented out for testing
  /* const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace /> 
  */

  // Always allow access
  return children
}

function DashboardRedirect() {
  // During testing, if you hit /dashboard, you might want to force a specific view
  // or just default to the home page since role logic is bypassed.
  return <Navigate to="/" replace />
  
  /* const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const paths = { admin: '/admin', doctor: '/doctor', donor: '/donor', patient: '/patient' }
  return <Navigate to={paths[user.role] || '/login'} replace /> 
  */
}

export default function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Roles are now ignored; you can visit any URL directly */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctor/*" element={
        <ProtectedRoute>
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/donor/*" element={
        <ProtectedRoute>
          <DonorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/patient/*" element={
        <ProtectedRoute>
          <PatientDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}