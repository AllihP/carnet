import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LOGIN_BY_ROLE = {
  medecin:   '/login/medecin',
  patient:   '/login/patient',
  direction: '/login/direction',
}

export default function ProtectedRoute({ children, role }) {
  const { auth, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3 }} />
          <p className="text-muted text-sm">Chargement…</p>
        </div>
      </div>
    )
  }

  // Non connecté → page de connexion de cet espace
  if (!auth) {
    return <Navigate to={LOGIN_BY_ROLE[role] ?? '/login/medecin'} replace />
  }

  // Connecté mais mauvais rôle → espace qui lui appartient
  if (role && auth.role !== role) {
    const home = auth.role === 'medecin'   ? '/medecin'
               : auth.role === 'direction' ? '/direction'
               : '/patient/cover'
    return <Navigate to={home} replace />
  }

  return children
}
