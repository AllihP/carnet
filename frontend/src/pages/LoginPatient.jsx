import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const COLOR = '#C9A84C'
const FEATURES = ['Votre carnet médical numérique', 'Historique des consultations', 'Ordonnances & résultats']

export default function LoginPatient() {
  const [form, setForm] = useState({ dmp_id: '', code: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginPatient } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/patient/login/', form)
      loginPatient(res.data.token, res.data.patient)
      if (res.data.first_login) navigate('/patient/change-code')
      else navigate('/patient/cover')
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiant DMP ou code incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden login-bg-patient">
      <div className="ring-circle" style={{ top: -150, right: -150, width: 500, height: 500 }} />
      <div className="ring-circle" style={{ bottom: -100, left: -100, width: 350, height: 350 }} />

      <div className="relative z-10 flex gap-16 items-center max-w-4xl w-full px-8 py-10">

        {/* Branding */}
        <div className="flex-1 hidden md:block">
          <div className="text-2xl font-display font-bold text-white mb-1">
            Medi<span style={{ color: COLOR }}>Carnet</span>
          </div>
          <div className="text-xs text-white/30 uppercase tracking-widest mb-8">Hôpital National de N'Djamena</div>
          <h1 className="font-display text-4xl text-white leading-tight mb-4">
            Espace<br />Patient<br />
            <span style={{ color: COLOR }}>Personnel</span>
          </h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-8">
            Consultez votre dossier médical, vos ordonnances et l'historique de vos soins.
          </p>
          <div className="flex flex-col gap-2 mb-10">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/50">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COLOR }} />
                {f}
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <Link to="/login/medecin" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              → Espace Médecin
            </Link>
            <Link to="/login/direction" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              → Espace Direction
            </Link>
          </div>
        </div>

        {/* Formulaire */}
        <div className="w-[400px] flex-shrink-0">
          <div className="glass-box p-9">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">👤</span>
              <div className="font-display text-2xl text-white">Espace Patient</div>
            </div>
            <div className="text-xs text-white/40 mb-7">Accédez à votre carnet médical numérique</div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-3.5 py-2.5 text-sm text-red-300 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Identifiant DMP
              </label>
              <input
                className="w-full rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-4 placeholder-white/20 transition-colors"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)' }}
                placeholder="Ex : AO-847152"
                value={form.dmp_id}
                onChange={e => setForm({ ...form, dmp_id: e.target.value })}
                autoComplete="username"
                required
              />
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Code d'accès
              </label>
              <input
                type="password"
                className="w-full rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-6 placeholder-white/20 transition-colors"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)' }}
                placeholder="••••••••"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none font-sans disabled:opacity-60"
                style={{ background: COLOR, color: '#1A0A00' }}
              >
                {loading ? 'Connexion…' : 'Accéder à mon carnet →'}
              </button>
            </form>

            <div className="mt-5 p-3 rounded-lg text-[11px] text-white/30 leading-relaxed" style={{ background: 'rgba(255,255,255,.04)' }}>
              Démo — DMP : <b className="text-white/55">AO-847152</b> · code : <b className="text-white/55">MC-4829</b>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
