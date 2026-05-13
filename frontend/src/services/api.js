import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      let redirect = '/login/medecin'
      try {
        const stored = localStorage.getItem('medicarnet_auth')
        if (stored) {
          const { role } = JSON.parse(stored)
          if (role === 'patient')   redirect = '/login/patient'
          else if (role === 'direction') redirect = '/login/direction'
        }
      } catch (_) {}
      localStorage.removeItem('medicarnet_auth')
      delete api.defaults.headers.common['Authorization']
      window.location.href = redirect
    }
    return Promise.reject(err)
  }
)

export default api
