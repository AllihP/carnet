import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { auth, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{borderWidth:3}}></div>
          <p className="text-muted text-sm">Chargement…</p>
        </div>
      </div>
    )
  }

  if (!auth) return <Navigate to="/" replace />

  if (role && auth.role !== role) {
    const redirect = auth.role === 'medecin' ? '/medecin' : auth.role === 'direction' ? '/direction' : '/patient/cover'
    return <Navigate to={redirect} replace />
  }

  return children
}
