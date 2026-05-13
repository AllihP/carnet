import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginMedecin    from './pages/LoginMedecin'
import LoginPatient    from './pages/LoginPatient'
import LoginDirection  from './pages/LoginDirection'

import MedecinDashboard    from './pages/medecin/MedecinDashboard'
import DossierMedical      from './pages/medecin/DossierMedical'
import NouvelleConsultation from './pages/medecin/NouvelleConsultation'

import PatientChangeCode from './pages/patient/PatientChangeCode'
import PatientCover      from './pages/patient/PatientCover'
import PatientBooklet    from './pages/patient/PatientBooklet'

import DirectionDashboard from './pages/direction/DirectionDashboard'

function AuthRedirect() {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login/medecin" replace />
  if (auth.role === 'medecin')    return <Navigate to="/medecin" replace />
  if (auth.role === 'direction')  return <Navigate to="/direction" replace />
  return <Navigate to="/patient/cover" replace />
}

function GuestOnly({ children, redirectTo }) {
  const { auth } = useAuth()
  if (!auth) return children
  if (auth.role === 'medecin')    return <Navigate to="/medecin" replace />
  if (auth.role === 'direction')  return <Navigate to="/direction" replace />
  return <Navigate to="/patient/cover" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Racine — redirige selon l'état de connexion */}
      <Route path="/" element={<AuthRedirect />} />

      {/* ── Pages de connexion (une par espace) ── */}
      <Route path="/login/medecin" element={
        <GuestOnly><LoginMedecin /></GuestOnly>
      } />
      <Route path="/login/patient" element={
        <GuestOnly><LoginPatient /></GuestOnly>
      } />
      <Route path="/login/direction" element={
        <GuestOnly><LoginDirection /></GuestOnly>
      } />

      {/* ── Espace Médecin ── */}
      <Route path="/medecin" element={
        <ProtectedRoute role="medecin"><MedecinDashboard /></ProtectedRoute>
      } />
      <Route path="/medecin/dossier/:dmpId" element={
        <ProtectedRoute role="medecin"><DossierMedical /></ProtectedRoute>
      } />
      <Route path="/medecin/consultation" element={
        <ProtectedRoute role="medecin"><NouvelleConsultation /></ProtectedRoute>
      } />
      <Route path="/medecin/consultation/:dmpId" element={
        <ProtectedRoute role="medecin"><NouvelleConsultation /></ProtectedRoute>
      } />

      {/* ── Espace Patient ── */}
      <Route path="/patient/change-code" element={
        <ProtectedRoute role="patient"><PatientChangeCode /></ProtectedRoute>
      } />
      <Route path="/patient/cover" element={
        <ProtectedRoute role="patient"><PatientCover /></ProtectedRoute>
      } />
      <Route path="/patient/carnet" element={
        <ProtectedRoute role="patient"><PatientBooklet /></ProtectedRoute>
      } />

      {/* ── Espace Direction ── */}
      <Route path="/direction" element={
        <ProtectedRoute role="direction"><DirectionDashboard /></ProtectedRoute>
      } />
      <Route path="/direction/dossier/:dmpId" element={
        <ProtectedRoute role="direction"><DossierMedical /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
