import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

function ChangeCodeModal({ onClose, onSaved }) {
  const [newCode, setNewCode] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePatientToken } = useAuth()

  const handleSave = async () => {
    if (!newCode || newCode.length < 4) { setError('Le code doit avoir au moins 4 caractères.'); return }
    if (newCode !== confirm) { setError('Les codes ne correspondent pas.'); return }
    setLoading(true)
    try {
      const res = await api.post('/patients/change-code/', { new_code: newCode, confirm_code: confirm })
      updatePatientToken(res.data.token, res.data.patient)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-navy/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-[400px] shadow-modal">
        <h2 className="font-display text-xl text-navy mb-4">🔑 Changer mon code d'accès</h2>
        <div className="p-3 bg-bg rounded-lg text-xs text-muted leading-relaxed mb-5">
          Votre nouveau code sera demandé à votre médecin lors de chaque consultation. Communiquez-lui le code en personne au cabinet.
        </div>
        {error && <div className="bg-danger-pale border border-danger/30 rounded-lg p-3 text-xs text-danger mb-4">{error}</div>}
        <label className="form-label">Nouveau code</label>
        <input type="password" className="form-input mb-3" placeholder="Nouveau code d'accès" value={newCode} onChange={e=>setNewCode(e.target.value)}/>
        <label className="form-label">Confirmer le code</label>
        <input type="password" className="form-input mb-5" placeholder="Répétez le code" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-[2] disabled:opacity-60">
            {loading ? 'Enregistrement…' : 'Enregistrer le nouveau code'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PatientCover() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [showChange, setShowChange] = useState(false)
  const [toast, setToast] = useState('')
  const patient = auth?.patient
  if (!patient) return null

  const init = (patient.prenom[0] + patient.nom[0]).toUpperCase()
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fmtDate = d => {
    if (!d) return '—'
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
  }

  // Barcode
  const bars = [2,1,3,1,2,2,1,3,2,1,2,3,1,2,1,3,2,1,2,1,3,2,1,2,3,1]

  return (
    <div className="min-h-screen flex flex-col" style={{background:'linear-gradient(145deg,#062318 0%,#0B3D2E 55%,#071D14 100%)'}}>
      {/* Topbar */}
      <div className="topbar">
        <span className="font-display text-lg font-bold text-white">Medi<span style={{color:'#E4C46A'}}>Carnet</span></span>
        <div className="w-px h-5 bg-white/15"/>
        <span className="text-xs text-white/40">Carnet de santé électronique</span>
        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-xs font-medium text-white/70">{patient.prenom} {patient.nom}</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{background:'#C9A84C',color:'#1A0A00'}}>{init}</div>
          <button onClick={() => navigate('/patient/carnet')} className="px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer font-sans" style={{background:'#C9A84C',color:'#1A0A00'}}>Consulter mon carnet →</button>
          <button onClick={() => setShowChange(true)} className="px-3 py-1.5 text-xs rounded-lg border border-white/20 bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer font-sans">🔑 Changer mon code</button>
          <button onClick={logout} className="px-3 py-1.5 text-xs rounded-lg border border-white/20 bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer font-sans">Déconnexion</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8 gap-14">
        {/* Left info */}
        <div className="max-w-[260px]">
          <h1 className="font-display text-3xl text-white leading-tight mb-3">
            Votre dossier<br/>médical <span style={{color:'#E4C46A'}}>officiel</span>
          </h1>
          <p className="text-sm text-white/40 leading-relaxed mb-7">Ce carnet électronique contient l'intégralité de votre historique médical. Cliquez sur le carnet pour consulter vos informations.</p>
          <div className="flex flex-col gap-2">
            {['Informations personnelles','Consultations & diagnostics','Traitements & prescriptions','Examens biologiques','Carnet vaccinal','Allergies documentées','Antécédents médicaux','Signes vitaux'].map(s=>(
              <div key={s} className="flex items-center gap-2.5 text-xs text-white/40">
                <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"/>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Book */}
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => navigate('/patient/carnet')}
            className="cursor-pointer transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
            style={{
              width:370,height:560,borderRadius:5,
              background:'#0B3D2E',
              boxShadow:'0 40px 100px rgba(0,0,0,.7), 6px 0 0 0 #C9A84C inset, -1px 0 0 0 rgba(0,0,0,.3) inset'
            }}
          >
            {/* Pattern */}
            <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(255,255,255,.012) 14px,rgba(255,255,255,.012) 15px)'}}/>
            {/* Stripes */}
            <div style={{position:'absolute',top:0,left:0,right:0,height:6,background:'linear-gradient(90deg,#C9A84C,#E4C46A,#C9A84C)'}}/>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:6,background:'linear-gradient(90deg,#C9A84C,#E4C46A,#C9A84C)'}}/>
            {/* Inner */}
            <div className="relative z-10 p-7 h-full flex flex-col">
              <div className="text-center text-[8px] uppercase tracking-[.2em] mb-0.5" style={{color:'rgba(201,168,76,.6)'}}>République du Tchad · جمهورية تشاد</div>
              <div className="text-center text-[10px] uppercase tracking-wider mb-4" style={{color:'rgba(255,255,255,.4)'}}>Ministère de la Santé Publique</div>
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl relative" style={{borderColor:'#C9A84C'}}>
                  <div className="absolute inset-1.5 rounded-full border" style={{borderColor:'rgba(201,168,76,.25)'}}/>
                  ⚕️
                </div>
              </div>
              <div className="text-center text-[11.5px] uppercase tracking-wider mb-0.5" style={{color:'#E4C46A',fontFamily:'Playfair Display, serif'}}>HÔPITAL NATIONAL DE N'DJAMENA</div>
              <div className="text-center text-[8.5px] tracking-wider mb-4" style={{color:'rgba(255,255,255,.3)'}}>Avenue Charles de Gaulle — N'Djamena, Tchad</div>
              <div className="h-px mb-4" style={{background:'linear-gradient(90deg,transparent,#C9A84C,transparent)',margin:'0 16px'}}/>
              <div className="text-center text-[8px] uppercase tracking-[.18em] mb-1.5" style={{color:'rgba(255,255,255,.35)'}}>Dossier Médical Partagé</div>
              <div className="text-center font-display text-xl text-white mb-0.5">Carnet de Santé<br/>Électronique</div>
              <div className="text-center text-[8px] uppercase tracking-widest mb-5" style={{color:'rgba(201,168,76,.55)'}}>Document médical officiel</div>

              <div className="flex items-start gap-3 mb-4">
                <div className="w-16 h-20 border-2 rounded-sm flex items-center justify-center flex-shrink-0" style={{borderColor:'#C9A84C',background:'rgba(255,255,255,.05)'}}>
                  <span className="font-display text-xl" style={{color:'#E4C46A'}}>{init}</span>
                </div>
                <div className="flex-1">
                  <div className="font-display text-sm text-white leading-tight mb-1.5">{patient.prenom}<br/>{patient.nom}</div>
                  <div className="text-[9px] mb-1" style={{color:'rgba(255,255,255,.4)'}}>Né(e) le <strong style={{color:'rgba(255,255,255,.7)'}}>{fmtDate(patient.dob)}</strong></div>
                  <div className="text-[9px] mb-1" style={{color:'rgba(255,255,255,.4)'}}>Groupe sanguin <strong style={{color:'rgba(255,255,255,.7)'}}>{patient.blood}</strong></div>
                  <div className="text-[9px]" style={{color:'rgba(255,255,255,.4)'}}>Médecin <strong style={{color:'rgba(255,255,255,.7)'}}>Dr. I. Mahamat</strong></div>
                </div>
              </div>

              <div className="rounded-sm p-2.5 mb-3" style={{background:'rgba(0,0,0,.25)',border:'1px solid rgba(201,168,76,.2)'}}>
                <div className="text-[8px] uppercase tracking-widest mb-1" style={{color:'rgba(201,168,76,.45)'}}>Identifiant dossier</div>
                <div className="font-display text-xs tracking-wider" style={{color:'#E4C46A'}}>DMP-2026-TD-{patient.dmp_id?.replace('-','')}</div>
              </div>

              <div className="flex items-end gap-0.5 mb-1.5" style={{height:20}}>
                {bars.map((w,i)=>(
                  <div key={i} style={{width:w*2,height:[18,14,10][i%3],background:`rgba(201,168,76,${0.3+i%3*0.2})`,borderRadius:1}}/>
                ))}
              </div>
              <div className="text-center text-[8px]" style={{color:'rgba(255,255,255,.2)'}}>
                Délivré le {new Date().toLocaleDateString('fr-FR')} · Établissement : HNN
              </div>
            </div>
          </div>
          <p className="text-sm text-white/35">Cliquez sur le carnet pour consulter votre dossier <span style={{color:'#E4C46A'}}>→</span></p>
        </div>
      </div>

      {showChange && <ChangeCodeModal onClose={() => setShowChange(false)} onSaved={() => { setShowChange(false); showToast('✅ Code modifié avec succès !') }}/>}
      {toast && <div className="toast" style={{background:'#0B3D2E'}}>{toast}</div>}
    </div>
  )
}
