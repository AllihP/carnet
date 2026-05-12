import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('medicarnet_auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAuth(parsed)
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
      } catch (_) { localStorage.removeItem('medicarnet_auth') }
    }
    setLoading(false)
  }, [])

  const loginStaff = (token, user) => {
    const data = { token, user, type: 'staff', role: user.role }
    setAuth(data)
    localStorage.setItem('medicarnet_auth', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const loginPatient = (token, patient) => {
    const data = { token, patient, type: 'patient', role: 'patient' }
    setAuth(data)
    localStorage.setItem('medicarnet_auth', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const updatePatientToken = (token, patient) => {
    const data = { token, patient, type: 'patient', role: 'patient' }
    setAuth(data)
    localStorage.setItem('medicarnet_auth', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const logout = () => {
    setAuth(null)
    localStorage.removeItem('medicarnet_auth')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ auth, loading, loginStaff, loginPatient, updatePatientToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
