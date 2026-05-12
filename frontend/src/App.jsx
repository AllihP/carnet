import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import MedecinDashboard from './pages/medecin/MedecinDashboard'
import DossierMedical from './pages/medecin/DossierMedical'
import NouvelleConsultation from './pages/medecin/NouvelleConsultation'
import PatientChangeCode from './pages/patient/PatientChangeCode'
import PatientCover from './pages/patient/PatientCover'
import PatientBooklet from './pages/patient/PatientBooklet'
import DirectionDashboard from './pages/direction/DirectionDashboard'

export default function App() {
  const { auth } = useAuth()

  return (
    <Routes>
      <Route path="/" element={
        auth
          ? auth.role === 'medecin'    ? <Navigate to="/medecin" replace />
          : auth.role === 'direction'  ? <Navigate to="/direction" replace />
          : <Navigate to="/patient/cover" replace />
          : <Login />
      } />

      {/* Espace Médecin */}
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

      {/* Espace Patient */}
      <Route path="/patient/change-code" element={
        <ProtectedRoute role="patient"><PatientChangeCode /></ProtectedRoute>
      } />
      <Route path="/patient/cover" element={
        <ProtectedRoute role="patient"><PatientCover /></ProtectedRoute>
      } />
      <Route path="/patient/carnet" element={
        <ProtectedRoute role="patient"><PatientBooklet /></ProtectedRoute>
      } />

      {/* Espace Direction */}
      <Route path="/direction" element={
        <ProtectedRoute role="direction"><DirectionDashboard /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
