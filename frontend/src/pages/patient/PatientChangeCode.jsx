import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

export default function PatientChangeCode() {
  const [newCode, setNewCode] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePatientToken } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!newCode || newCode.length < 4) { setError('Le code doit avoir au moins 4 caractères.'); return }
    if (newCode !== confirm) { setError('Les codes ne correspondent pas.'); return }
    setLoading(true)
    try {
      const res = await api.post('/patient/change-code/', { new_code: newCode, confirm_code: confirm })
      updatePatientToken(res.data.token, res.data.patient)
      navigate('/patient/cover')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de code.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg-patient relative overflow-hidden">
      <div className="ring-circle" style={{top:-180,left:-180,width:500,height:500}}/>
      <div className="ring-circle" style={{bottom:-100,right:-100,width:350,height:350}}/>
      <div className="relative z-10 w-[420px] glass-box p-11">
        <div className="text-4xl text-center mb-5">🔑</div>
        <h1 className="font-display text-2xl text-white text-center mb-2">Créez votre code personnel</h1>
        <p className="text-sm text-white/40 text-center leading-relaxed mb-7">
          Bienvenue ! C'est votre première connexion. Créez votre propre code d'accès sécurisé pour protéger votre dossier médical.
        </p>

        <div className="bg-gold/10 border border-gold/25 rounded-xl p-4 mb-5 text-xs text-gold leading-relaxed">
          ⚠️ <strong>Important :</strong> Votre médecin aura besoin de ce code lors de chaque consultation pour accéder à votre dossier. Communiquez-lui en personne au cabinet lors de vos visites.
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {['Minimum 4 caractères','Peut contenir lettres et chiffres','Ne partagez ce code qu\'avec votre médecin en cabinet'].map(r=>(
            <div key={r} className="flex items-center gap-2 text-xs text-white/35">
              <div className="w-4 h-4 rounded-full bg-teal/30 flex items-center justify-center text-teal text-[9px]">✓</div>
              {r}
            </div>
          ))}
        </div>

        {error && <div className="bg-red-500/15 border border-red-500/30 rounded-lg px-3.5 py-2.5 text-xs text-red-300 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">Nouveau code d'accès</label>
          <input type="password" className="w-full rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-4"
            style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)'}}
            placeholder="Choisissez un code sécurisé" value={newCode} onChange={e=>setNewCode(e.target.value)} required/>
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">Confirmer le code</label>
          <input type="password" className="w-full rounded-xl px-3.5 py-3 text-sm text-white font-sans outline-none mb-6"
            style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)'}}
            placeholder="Répétez votre code" value={confirm} onChange={e=>setConfirm(e.target.value)} required/>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none font-sans disabled:opacity-60"
            style={{background:'#C9A84C',color:'#1A0A00'}}>
            {loading ? 'Création…' : 'Créer mon code et accéder au carnet →'}
          </button>
        </form>
      </div>
    </div>
  )
}
