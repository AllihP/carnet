import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

function IRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-bg last:border-0 text-sm">
      <span className="text-muted flex-shrink-0">{label}</span>
      <span className="font-medium text-text text-right max-w-[60%]">{value || '—'}</span>
    </div>
  )
}

const NAV = [
  {id:'b0',label:'👤 Informations personnelles'},
  {id:'b1',label:'🏥 Médecin & Établissement'},
  {id:'b2',label:'📋 Consultations & Diagnostics'},
  {id:'b3',label:'💊 Traitements prescrits'},
  {id:'b4',label:'🔬 Examens & Résultats'},
  {id:'b5',label:'📂 Antécédents médicaux'},
  {id:'b6',label:'💉 Carnet vaccinal'},
  {id:'b7',label:'⚠️ Allergies'},
  {id:'b8',label:'📊 Signes vitaux'},
  {id:'b9',label:'🔐 Accès & Confidentialité'},
]

export default function PatientBooklet() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('b0')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/patient/me/').then(res => { setData(res.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-muted text-sm">Chargement…</div></div>
  if (!data) return null

  const patient = data
  const consultations = data.consultations || []
  const lastConsult = consultations[0]
  const init = (patient.prenom[0] + patient.nom[0]).toUpperCase()
  const age = patient.age

  const fmtDate = d => {
    if (!d) return '—'
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg screen-fade">
      {/* Topbar */}
      <div className="topbar">
        <span className="font-display text-lg font-bold text-white">Medi<span style={{color:'#E4C46A'}}>Carnet</span></span>
        <div className="w-px h-5 bg-white/15"/>
        <span className="text-xs text-white/40" id="section-label">Mon carnet médical</span>
        <div className="ml-auto flex items-center gap-2.5">
          <button onClick={() => navigate('/patient/cover')} className="px-3 py-1.5 text-xs rounded-lg border border-white/20 bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer font-sans">← Page de garde</button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{background:'#0E7A5F',color:'#fff'}}>{init}</div>
          <button onClick={logout} className="px-3 py-1.5 text-xs rounded-lg border border-white/20 bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer font-sans">Déconnexion</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{background:'#F2F5FA'}}>
        {/* Sidebar */}
        <div className="w-56 bg-white border-r border-border flex-shrink-0 overflow-y-auto">
          <div className="p-5 border-b border-border">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base mb-2.5" style={{background:patient.color||'#0E7A5F'}}>{init}</div>
            <div className="font-semibold text-sm text-navy">{patient.prenom} {patient.nom}</div>
            <div className="text-xs text-muted mt-0.5">{age} ans · {patient.sexe==='F'?'Féminin':'Masculin'} · {patient.blood}</div>
            <div className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-teal-pale text-teal font-medium">DMP-{patient.dmp_id}</div>
          </div>
          <div className="py-2">
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setActiveTab(n.id)}
                className={`nav-item w-full text-left border-none font-sans ${activeTab===n.id?'nav-item-active':''}`}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          {/* B0: Infos personnelles */}
          {activeTab==='b0' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Informations personnelles</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Vos données d'identification et coordonnées.</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[{l:'Groupe sanguin',v:patient.blood},{l:'Date de naissance',v:fmtDate(patient.dob)},{l:'Âge',v:`${age} ans`},{l:'Sexe',v:patient.sexe==='F'?'Féminin':'Masculin'}].map(b=>(
                <div key={b.l} className="bg-white border border-border rounded-xl p-4">
                  <div className="text-[11px] text-muted mb-1">{b.l}</div>
                  <div className="text-base font-semibold text-navy">{b.v}</div>
                </div>
              ))}
            </div>
            <div className="card mb-4">
              <div className="card-title">Coordonnées</div>
              <IRow label="Nom complet" value={`${patient.prenom} ${patient.nom}`}/>
              <IRow label="Adresse" value={patient.addr}/>
              <IRow label="Téléphone" value={patient.tel}/>
              <IRow label="Profession" value={patient.job}/>
              <IRow label="Contact urgence" value={patient.urg}/>
            </div>
            <div className="card">
              <div className="card-title">Identifiant dossier médical</div>
              <IRow label="Numéro DMP" value={`DMP-2026-TD-${patient.dmp_id?.replace('-','')}`}/>
              <IRow label="Date de création" value={fmtDate(patient.created_at)}/>
              <IRow label="Statut" value={<span className="badge-ok">Dossier actif</span>}/>
            </div>
          </div>}

          {/* B1: Médecin */}
          {activeTab==='b1' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Médecin & Établissement référent</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Informations sur votre médecin traitant.</p>
            <div className="card mb-4">
              <div className="card-title">Médecin traitant</div>
              <IRow label="Nom" value={patient.doctor_name}/>
              <IRow label="Spécialité" value="Médecine générale"/>
            </div>
            <div className="card">
              <div className="card-title">Établissement de santé</div>
              <IRow label="Hôpital" value="Hôpital National de N'Djamena"/>
              <IRow label="Adresse" value="Av. Charles de Gaulle, N'Djamena"/>
              <IRow label="Urgences" value="+235 22 52 11 00"/>
            </div>
          </div>}

          {/* B2: Consultations */}
          {activeTab==='b2' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Consultations & Diagnostics</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Historique complet de vos consultations médicales.</p>
            {consultations.length===0
              ? <div className="card text-center text-muted text-sm py-10">Aucune consultation enregistrée pour le moment.</div>
              : <ul className="flex flex-col gap-0">
                  {consultations.map((c,i)=>(
                    <li key={c.id} className="flex gap-4 pb-5">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-[10px] text-white z-10">✓</div>
                        {i<consultations.length-1&&<div className="w-px flex-1 bg-border mt-1"/>}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="text-[11px] text-muted mb-1">{c.date} — {c.doctor_name}</div>
                        <div className="font-semibold text-sm text-navy mb-1">{c.consult_type} — {c.motif||'—'}</div>
                        <div className="text-xs text-muted mb-2">
                          {c.symptoms?.length>0&&<><strong>Symptômes :</strong> {c.symptoms.join(', ')}<br/></>}
                          <strong>Diagnostic :</strong> {c.diag_main||'—'}{c.diag_cim&&` (${c.diag_cim})`}
                          {c.diag_conclusion&&<><br/><em>{c.diag_conclusion}</em></>}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {c.diag_severity&&<span className="badge-ok">{c.diag_severity}</span>}
                          <span className="badge-info">{c.consult_type}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
            }
          </div>}

          {/* B3: Traitements */}
          {activeTab==='b3' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Traitements prescrits</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Médicaments issus de votre dernière consultation.</p>
            <div className="card mb-4">
              <div className="card-title">Ordonnance en cours</div>
              {lastConsult?.prescriptions?.filter(r=>r.med).length?(
                <table className="w-full text-xs"><thead><tr className="text-muted font-semibold uppercase tracking-wider border-b border-border">
                  <th className="text-left pb-2">Médicament</th><th className="text-left pb-2">Dosage</th><th className="text-left pb-2">Fréquence</th><th className="text-left pb-2">Durée</th>
                </tr></thead><tbody>
                  {lastConsult.prescriptions.filter(r=>r.med).map((r,i)=>(
                    <tr key={i} className="border-t border-bg">
                      <td className="py-2 font-medium text-navy">{r.med}</td>
                      <td className="py-2">{r.dose||'—'}</td>
                      <td className="py-2">{r.freq||'—'}</td>
                      <td className="py-2">{r.dur||'—'}</td>
                    </tr>
                  ))}
                </tbody></table>
              ):<div className="text-muted text-sm">Aucun traitement prescrit.</div>}
            </div>
            <div className="card">
              <div className="card-title">Instructions du médecin</div>
              <p className="text-sm text-muted">{lastConsult?.rx_notes||'Respectez les doses et horaires prescrits.'}</p>
            </div>
          </div>}

          {/* B4: Examens */}
          {activeTab==='b4' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Examens & Résultats biologiques</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Résultats d'analyses et examens prescrits.</p>
            <div className="card mb-4">
              <div className="card-title">Résultats d'analyses</div>
              {lastConsult?.results?.length?lastConsult.results.map((r,i)=>{
                const pct=r.interp==='Normal'?78:r.interp==='Abaissé'?32:r.interp==='Élevé'?90:96
                const col=r.interp==='Normal'?'#0E7A5F':r.interp==='Critique'?'#C0392B':'#D4840A'
                return <div key={i} className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5"><span className="font-medium">{r.name}</span><span className="text-muted">{r.val} (norme: {r.norm||'—'})</span></div>
                  <div className="h-2 bg-bg rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${pct}%`,background:col}}/></div>
                </div>
              }):<div className="text-muted text-sm">Aucun résultat enregistré.</div>}
            </div>
            <div className="card">
              <div className="card-title">Examens à réaliser</div>
              {lastConsult?.exams_requested?.length
                ?lastConsult.exams_requested.map((e,i)=>(
                  <div key={i} className="flex justify-between py-2 border-b border-bg last:border-0 text-sm"><span>🔬 {e}</span><span className="badge-warn">Prescrit</span></div>
                )):<div className="text-muted text-sm">Aucun examen prescrit.</div>}
            </div>
          </div>}

          {/* B5: Antécédents */}
          {activeTab==='b5' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Antécédents médicaux</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Votre historique médical personnel et familial.</p>
            <div className="card mb-4">
              <div className="card-title">Antécédents personnels</div>
              <IRow label="Maladies chroniques" value={patient.ant_chr}/>
              <IRow label="Chirurgies" value={patient.ant_chir}/>
              <IRow label="Gynécologie" value={patient.ant_gyn}/>
              <IRow label="Habitudes de vie" value={patient.ant_hab}/>
            </div>
            <div className="card">
              <div className="card-title">Antécédents familiaux</div>
              <IRow label="Père" value={patient.ant_pere}/>
              <IRow label="Mère" value={patient.ant_mere}/>
              <IRow label="Fratrie" value={patient.ant_fra}/>
            </div>
          </div>}

          {/* B6: Vaccins */}
          {activeTab==='b6' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Carnet de vaccination</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">État à jour de vos vaccinations.</p>
            <div className="card">
              {patient.vaccines?.length?
                <table className="w-full text-xs"><thead><tr className="text-muted font-semibold uppercase tracking-wider border-b border-border">
                  <th className="text-left pb-2">Vaccin</th><th className="text-left pb-2">Date</th><th className="text-left pb-2">Prochain</th><th className="text-left pb-2">Statut</th>
                </tr></thead><tbody>
                  {patient.vaccines.map((v,i)=>(
                    <tr key={i} className="border-t border-bg">
                      <td className="py-2 font-medium text-navy">{v.name}</td>
                      <td className="py-2 text-muted">{fmtDate(v.date)}</td>
                      <td className="py-2 text-muted">{v.next_date||'—'}</td>
                      <td className="py-2"><span className={v.status==='À jour'?'badge-ok':v.status==='Rappel dû'?'badge-warn':'badge-info'}>{v.status}</span></td>
                    </tr>
                  ))}
                </tbody></table>
                :<div className="text-muted text-sm">Aucune vaccination enregistrée.</div>}
            </div>
          </div>}

          {/* B7: Allergies */}
          {activeTab==='b7' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Allergies & Contre-indications</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Informations critiques à communiquer à tout professionnel de santé.</p>
            {patient.allergies?.map((a,i)=>(
              <div key={i} className={`rounded-xl p-4 flex gap-3 mb-3 ${a.severity==='Modérée-Sévère'||a.severity==='Anaphylaxie'?'bg-danger-pale border border-danger/20':'bg-gold-pale border border-gold/20'}`}>
                <span className="text-lg">{a.severity==='Anaphylaxie'?'🚨':'⚠️'}</span>
                <div className="text-sm"><strong>Allergie {a.allergy_type} :</strong> {a.name}<br/>
                <span className="text-muted">Réaction : {a.reaction||'—'} — {a.severity}</span></div>
              </div>
            ))}
            {!patient.allergies?.length&&<div className="p-4 rounded-xl bg-teal-pale border border-teal/20 flex gap-3 text-sm"><span>ℹ️</span><div>Aucune allergie documentée pour le moment.</div></div>}
            <div className="card mt-4">
              <div className="card-title">Détail des allergies</div>
              {patient.allergies?.length?patient.allergies.map((a,i)=>(
                <div key={i} className="flex justify-between py-2 border-b border-bg last:border-0 text-sm">
                  <span>{a.name} <span className="text-[10px] text-muted">({a.allergy_type})</span></span>
                  <span className={a.severity==='Modérée-Sévère'||a.severity==='Anaphylaxie'?'badge-red':'badge-warn'}>{a.severity}</span>
                </div>
              )):<div className="text-muted text-sm">Aucune allergie.</div>}
            </div>
          </div>}

          {/* B8: Signes vitaux */}
          {activeTab==='b8' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Signes vitaux</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Constantes relevées lors de votre dernière consultation.</p>
            {lastConsult?.vitals&&Object.keys(lastConsult.vitals).length?(
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[{l:'Tension artérielle',v:lastConsult.vitals.ta,u:'mmHg'},{l:'Fréq. cardiaque',v:lastConsult.vitals.fc,u:'bpm'},{l:'Température',v:lastConsult.vitals.temp,u:'°C'},{l:'SpO2',v:lastConsult.vitals.spo2,u:'%'},{l:'Poids',v:lastConsult.vitals.poids,u:'kg'},{l:'Taille',v:lastConsult.vitals.taille,u:'cm'},{l:'Glycémie',v:lastConsult.vitals.gly,u:'g/L'},{l:'Fréq. respiratoire',v:lastConsult.vitals.fr,u:'cycles/min'}].map(b=>(
                  <div key={b.l} className="bg-white border border-border rounded-xl p-4">
                    <div className="text-[11px] text-muted mb-1">{b.l}</div>
                    <div className="text-xl font-semibold text-navy font-display">{b.v||'—'}</div>
                    <div className="text-[10px] text-muted">{b.u}</div>
                  </div>
                ))}
              </div>
            ):<div className="card text-center text-muted text-sm py-6">Aucun signe vital enregistré.</div>}
            <div className="card">
              <div className="card-title">Plan de suivi</div>
              <IRow label="Prochain rendez-vous" value={fmtDate(patient.next_rdv)}/>
              <IRow label="Motif" value={patient.next_motif}/>
              <IRow label="Consulter en urgence si" value={patient.next_urg}/>
            </div>
          </div>}

          {/* B9: Accès */}
          {activeTab==='b9' && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Accès & Confidentialité</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Gestion de l'accès à votre dossier médical partagé.</p>
            <div className="card mb-4">
              <div className="card-title">Système de code d'accès</div>
              <IRow label="Fonctionnement" value="Vous communiquez votre code au médecin lors de chaque consultation"/>
              <IRow label="Statut du code" value={<span className="badge-ok">Code personnel actif</span>}/>
            </div>
            <div className="card mb-4">
              <div className="card-title">Professionnels autorisés</div>
              <IRow label="Dr. Ibrahim Mahamat" value={<span className="badge-ok">Médecin traitant</span>}/>
              <IRow label="Hôpital National de N'Djamena" value={<span className="badge-info">Établissement référent</span>}/>
            </div>
            <div className="p-4 rounded-xl bg-teal-pale border border-teal/20 flex gap-3 text-sm mb-3">
              <span className="text-lg">🔐</span>
              <div>Votre dossier est protégé par votre code personnel. Ne partagez ce code qu'avec votre médecin en cabinet, lors de vos consultations.</div>
            </div>
            <div className="p-4 rounded-xl bg-gold-pale border border-gold/20 flex gap-3 text-sm">
              <span className="text-lg">⚠️</span>
              <div>Ne communiquez jamais votre code par téléphone ou message. Votre médecin n'a besoin de ce code qu'en votre présence physique.</div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}
