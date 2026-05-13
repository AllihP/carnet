import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

function Avatar({ initials, color, size = 36 }) {
  return (
    <div className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.33 }}>
      {initials}
    </div>
  )
}

function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null
}

export default function MedecinDashboard() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [toast, setToast] = useState('')
  const [newForm, setNewForm] = useState({ prenom:'', nom:'', dob:'', sexe:'F', blood:'O+', addr:'', tel:'', job:'', urg:'' })
  const [createdInfo, setCreatedInfo] = useState(null)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadPatients = useCallback(async () => {
    try {
      const res = await api.get('/medecin/patients/')
      setPatients(res.data)
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => { loadPatients() }, [loadPatients])

  const createPatient = async e => {
    e.preventDefault()
    try {
      const res = await api.post('/medecin/patients/', newForm)
      setCreatedInfo(res.data)
      setShowNew(false)
      loadPatients()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la création.')
    }
  }

  const stats = {
    patients: patients.length,
    consultations: patients.reduce((a, p) => a + (p.total_consultations || 0), 0),
    pending: patients.filter(p => p.first_login).length,
    rdv: patients.filter(p => p.last_consult).length,
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg screen-fade">
      {/* Topbar */}
      <div className="topbar-white">
        <span className="font-display text-navy font-bold text-lg">Medi<span className="text-teal">Carnet</span></span>
        <div className="w-px h-5 bg-border"/>
        <span className="text-xs text-muted">Tableau de bord médecin</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-medium text-text">{auth?.user?.first_name} {auth?.user?.last_name}</span>
          <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center text-[11px] font-bold text-white">
            {(auth?.user?.first_name?.[0] || '') + (auth?.user?.last_name?.[0] || '')}
          </div>
          <button onClick={logout} className="btn-secondary text-xs px-3 py-1.5">Déconnexion</button>
        </div>
      </div>

      <div className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-display text-2xl text-navy mb-1">Bonjour, Dr. {auth?.user?.last_name} 👋</h1>
        <p className="text-xs text-muted mb-6">{new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3.5 mb-7">
          {[
            { icon:'👥', num: stats.patients,      label:'Patients enregistrés' },
            { icon:'📋', num: stats.consultations,  label:'Consultations totales' },
            { icon:'⏳', num: stats.pending,        label:'1ères connexions en attente' },
            { icon:'💊', num: stats.rdv,            label:'Patients avec historique' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <span className="text-xl mb-1">{s.icon}</span>
              <span className="stat-num">{s.num}</span>
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => navigate('/medecin/consultation')} className="flex items-center gap-2 px-5 py-3 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors border-none cursor-pointer font-sans">
            🩺 Nouvelle consultation
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-3 bg-teal text-white rounded-xl text-sm font-medium hover:bg-teal-light transition-colors border-none cursor-pointer font-sans">
            + Nouveau patient
          </button>
        </div>

        <div className="p-4 bg-white border border-border rounded-xl text-xs text-muted leading-relaxed">
          💡 <strong className="text-text">Démarrer une consultation :</strong> Cliquez sur "Nouvelle consultation" et saisissez l'identifiant DMP du patient pour ouvrir sa fiche.
        </div>
      </div>

      {/* Modal: Nouveau patient */}
      {showNew && (
        <div className="fixed inset-0 bg-navy/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-[520px] max-h-[90vh] overflow-y-auto shadow-modal">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-navy">📋 Créer un carnet médical</h2>
              <button onClick={() => setShowNew(false)} className="text-muted hover:text-text text-lg cursor-pointer bg-none border-none">✕</button>
            </div>
            <form onSubmit={createPatient} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Prénom *</label><input className="form-input" value={newForm.prenom} onChange={e=>setNewForm({...newForm,prenom:e.target.value})} required/></div>
                <div><label className="form-label">Nom *</label><input className="form-input" value={newForm.nom} onChange={e=>setNewForm({...newForm,nom:e.target.value})} required/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Date de naissance *</label><input type="date" className="form-input" value={newForm.dob} onChange={e=>setNewForm({...newForm,dob:e.target.value})} required/></div>
                <div><label className="form-label">Sexe</label>
                  <select className="form-select" value={newForm.sexe} onChange={e=>setNewForm({...newForm,sexe:e.target.value})}>
                    <option value="F">Féminin</option><option value="M">Masculin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Groupe sanguin</label>
                  <select className="form-select" value={newForm.blood} onChange={e=>setNewForm({...newForm,blood:e.target.value})}>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Téléphone</label><input className="form-input" placeholder="+235 6x xx xx xx" value={newForm.tel} onChange={e=>setNewForm({...newForm,tel:e.target.value})}/></div>
              </div>
              <div><label className="form-label">Adresse</label><input className="form-input" placeholder="Quartier, ville" value={newForm.addr} onChange={e=>setNewForm({...newForm,addr:e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Profession</label><input className="form-input" value={newForm.job} onChange={e=>setNewForm({...newForm,job:e.target.value})}/></div>
                <div><label className="form-label">Contact urgence</label><input className="form-input" placeholder="Nom & téléphone" value={newForm.urg} onChange={e=>setNewForm({...newForm,urg:e.target.value})}/></div>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={()=>setShowNew(false)} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary">Générer le carnet et le code</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Code créé */}
      {createdInfo && (
        <div className="fixed inset-0 bg-navy/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-[420px] shadow-modal text-center">
            <h2 className="font-display text-xl text-navy mb-4">✅ Carnet médical créé !</h2>
            <p className="text-sm text-muted mb-1">Patient enregistré :</p>
            <p className="text-base font-semibold text-navy mb-1">{createdInfo.prenom} {createdInfo.nom}</p>
            <p className="text-xs text-muted mb-5">DMP : <strong className="text-text">{createdInfo.dmp_id}</strong></p>
            <div className="border-2 border-dashed border-border rounded-xl p-6 mb-5">
              <p className="text-[10px] uppercase tracking-widest text-muted mb-2">Code temporaire d'accès patient</p>
              <p className="font-display text-5xl tracking-widest text-navy font-bold mb-3">{createdInfo.temp_code}</p>
              <p className="text-xs text-muted leading-relaxed">Remettez ce code au patient. Il créera son propre code à la première connexion.</p>
            </div>
            <button onClick={() => { navigator.clipboard?.writeText(createdInfo.temp_code); showToast('Code copié !') }}
              className="btn-secondary mb-3 w-full">📋 Copier le code</button>
            <button onClick={() => setCreatedInfo(null)} className="btn-primary w-full">Fermer</button>
          </div>
        </div>
      )}

      <Toast msg={toast}/>
    </div>
  )
}
