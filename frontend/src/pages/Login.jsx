import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const ROLES = [
  { id: 'medecin',   label: 'Médecin',    icon: '🩺', desc: 'Accès dossiers & consultations', color: '#0E7A5F' },
  { id: 'patient',   label: 'Patient',    icon: '👤', desc: 'Votre carnet médical numérique',  color: '#C9A84C' },
  { id: 'direction', label: 'Direction',  icon: '📊', desc: 'Tableau de bord & statistiques',  color: '#185FA5' },
]

export default function Login() {
  const [role, setRole] = useState('medecin')
  const [form, setForm] = useState({ username: '', password: '', dmp_id: '', code: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginStaff, loginPatient } = useAuth()
  const navigate = useNavigate()

  const currentRole = ROLES.find(r => r.id === role)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (role === 'patient') {
        const res = await api.post('/patients/login/', { dmp_id: form.dmp_id, code: form.code })
        loginPatient(res.data.token, res.data.patient)
        if (res.data.first_login) navigate('/patient/change-code')
        else navigate('/patient/cover')
      } else {
        const res = await api.post('/auth/login/', { username: form.username, password: form.password })
        loginStaff(res.data.token, res.data.user)
        navigate(role === 'medecin' ? '/medecin' : '/direction')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const bgClass = role === 'medecin' ? 'login-bg-medecin' : role === 'patient' ? 'login-bg-patient' : 'login-bg-direction'

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${bgClass}`}>
      <div className="ring-circle" style={{top:-150,right:-150,width:500,height:500}}/>
      <div className="ring-circle" style={{bottom:-100,left:-100,width:350,height:350}}/>

      <div className="relative z-10 flex gap-16 items-center max-w-4xl w-full px-8 py-10">
        {/* Branding */}
        <div className="flex-1 hidden md:block">
          <div className="text-2xl font-display font-bold text-white mb-1">
            Medi<span style={{color: currentRole.color}}>Carnet</span>
          </div>
          <div className="text-xs text-white/30 uppercase tracking-widest mb-8">Hôpital National de N'Djamena</div>
          <h1 className="font-display text-4xl text-white leading-tight mb-4">
            Plateforme<br/>Médicale<br/>
            <span style={{color: currentRole.color}}>Intégrée</span>
          </h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-8">
            Système numérique de gestion des dossiers médicaux, consultations et suivi des patients.
          </p>
          <div className="flex flex-col gap-2">
            {['Dossiers médicaux sécurisés', 'Consultations & prescriptions', 'Statistiques en temps réel'].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/50">
                <div className="w-1.5 h-1.5 rounded-full" style={{background: currentRole.color}}/>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Login box */}
        <div className="w-[400px] flex-shrink-0">
          {/* Role selector */}
          <div className="flex gap-1.5 mb-6 p-1 rounded-xl" style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)'}}>
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setError('') }}
                className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-none font-sans"
                style={role === r.id
                  ? { background: r.color, color: '#fff' }
                  : { background: 'transparent', color: 'rgba(255,255,255,.4)' }
                }
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          <div className="glass-box p-9">
            <div className="font-display text-2xl text-white mb-1">
              {role === 'patient' ? 'Connexion Patient' : role === 'medecin' ? 'Espace Médecin' : 'Espace Direction'}
            </div>
            <div className="text-xs text-white/40 mb-7">{currentRole.desc}</div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-3.5 py-2.5 text-sm text-red-300 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
              {role === 'patient' ? (
                <>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Identifiant DMP</label>
                  <input
                    className="w-full bg-white/7 border border-white/12 rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-4 placeholder-white/20 focus:border-white/30 transition-colors"
                    style={{background:'rgba(255,255,255,.07)', borderColor:'rgba(255,255,255,.12)'}}
                    placeholder="Ex : AO-847152"
                    value={form.dmp_id}
                    onChange={e => setForm({...form, dmp_id: e.target.value})}
                    required
                  />
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Code d'accès</label>
                  <input
                    type="password"
                    className="w-full bg-white/7 border border-white/12 rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-6 placeholder-white/20 focus:border-white/30 transition-colors"
                    style={{background:'rgba(255,255,255,.07)', borderColor:'rgba(255,255,255,.12)'}}
                    placeholder="••••••••"
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value})}
                    required
                  />
                </>
              ) : (
                <>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Identifiant</label>
                  <input
                    className="w-full rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-4 placeholder-white/20 transition-colors"
                    style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)'}}
                    placeholder={role === 'medecin' ? 'dr.prenom.nom' : 'identifiant.direction'}
                    value={form.username}
                    onChange={e => setForm({...form, username: e.target.value})}
                    required
                  />
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Mot de passe</label>
                  <input
                    type="password"
                    className="w-full rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-6 placeholder-white/20 transition-colors"
                    style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)'}}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required
                  />
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none font-sans disabled:opacity-60"
                style={{background: currentRole.color, color: role === 'patient' ? '#1A0A00' : '#fff'}}
              >
                {loading ? 'Connexion…' : role === 'patient' ? 'Accéder à mon carnet →' : 'Se connecter →'}
              </button>
            </form>

            <div className="mt-5 p-3 rounded-lg text-[11px] text-white/30 leading-relaxed" style={{background:'rgba(255,255,255,.04)'}}>
              {role === 'patient'
                ? <>Démo — DMP : <b className="text-white/55">AO-847152</b> · code : <b className="text-white/55">MC-4829</b></>
                : <>Démo — Créez un compte via Django admin ou <code className="text-white/50">createsuperuser</code></>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
