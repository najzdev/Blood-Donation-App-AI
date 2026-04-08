// import React from 'react'
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { Toaster } from 'react-hot-toast'
// import { AuthProvider, useAuth } from './context/AuthContext.jsx'
// import Layout from './components/Layout.jsx'
// import Login from './pages/Login.jsx'
// import Dashboard from './pages/Dashboard.jsx'
// import Donors from './pages/Donors.jsx'
// import Patients from './pages/Patients.jsx'
// import Requests from './pages/Requests.jsx'
// import Inventory from './pages/Inventory.jsx'
// import AIAnalysis from './pages/AIAnalysis.jsx'
// import AIChat from './pages/AIChat.jsx'

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth()
//   if (loading) return (
//     <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
//       <div style={{ fontSize:'2rem' }}>🩸</div>
//       <div className="spinner" />
//       <p style={{ color:'var(--text-secondary)' }}>Loading BloodBank AI...</p>
//     </div>
//   )
//   return isAuthenticated ? children : <Navigate to="/login" replace />
// }

// function AppRoutes() {
//   const { isAuthenticated } = useAuth()
//   return (
//     <Routes>
//       <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
//       <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//         <Route index element={<Dashboard />} />
//         <Route path="donors" element={<Donors />} />
//         <Route path="patients" element={<Patients />} />
//         <Route path="requests" element={<Requests />} />
//         <Route path="inventory" element={<Inventory />} />
//         <Route path="ai-analysis" element={<AIAnalysis />} />
//         <Route path="ai-chat" element={<AIChat />} />
//       </Route>
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   )
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <AppRoutes />
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
//             success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
//             error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
//           }}
//         />
//       </BrowserRouter>
//     </AuthProvider>
//   )
// }

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Donors from './pages/Donors.jsx'
import Patients from './pages/Patients.jsx'
import Requests from './pages/Requests.jsx'
import Inventory from './pages/Inventory.jsx'
import AIAnalysis from './pages/AIAnalysis.jsx'
import AIChat from './pages/AIChat.jsx'

const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth()
  
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:'2rem' }}>🩸</div>
      <div className="spinner" />
      <p style={{ color:'var(--text-secondary)' }}>Loading BloodBank AI...</p>
    </div>
  )

  // COMMENTED OUT FOR TESTING: Always allows access
  // return isAuthenticated ? children : <Navigate to="/login" replace />
  return children 
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      {/* Changed logic: Don't redirect away from login automatically if testing */}
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="donors" element={<Donors />} />
        <Route path="patients" element={<Patients />} />
        <Route path="requests" element={<Requests />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="ai-analysis" element={<AIAnalysis />} />
        <Route path="ai-chat" element={<AIChat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}