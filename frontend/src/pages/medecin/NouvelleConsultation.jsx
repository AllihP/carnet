import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

const SECTIONS = ['Motif & Symptômes','Signes vitaux','Examen clinique','Diagnostic','Ordonnance','Examens complémentaires','Antécédents','Vaccinations','Allergies','Suivi & Clôture']

const EXAMS_BIO = ['NFS complète','Glycémie à jeun','Créatinine / Urée','Bilan hépatique','CRP / VS','Frottis sanguin / Paludisme','ECBU','Fer / Ferritine','Sérologie VIH','Ionogramme','Groupe / Rhésus','Test de grossesse']
const EXAMS_IMG = ['Radiographie thoracique','Échographie abdominale','Échographie pelvienne','ECG de repos','Scanner cérébral','Mammographie']

function Toast({ msg }) { return msg ? <div className="toast">{msg}</div> : null }

export default function NouvelleConsultation() {
  const { dmpId } = useParams()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [section, setSection] = useState(0)
  const [patient, setPatient] = useState(null)
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  // Search patient if no dmpId
  const [searchId, setSearchId] = useState(dmpId || '')
  const [searchErr, setSearchErr] = useState('')
  const [searching, setSearching] = useState(false)

  // Form state
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    consult_type: 'Consultation ordinaire',
    motif: '', s1:'', s2:'', s3:'', s4:'',
    obs_symp: '', duration_symp: 'Moins de 24h',
    tas:'120', tad:'80', fc:'78', temp:'37.0', fr:'16', spo2:'98', gly:'0.90', poids:'60', taille:'165',
    ex_cv:'', ex_resp:'', ex_abdo:'', ex_neuro:'', ex_orl:'', ex_gen:'',
    diag_main:'', diag_cim:'', diag_severity:'Légère', diag_d1:'', diag_d2:'', diag_conclusion:'',
    rx_notes:'', obs_notes:'',
    rdv_date:'', rdv_motif:'', rdv_urg:'', arret_travail:'Non', refer_spec:'Aucun', refer_motif:'',
    ant_chr:'', ant_chir:'', ant_gyn:'', ant_hab:'', ant_pere:'', ant_mere:'', ant_fra:'',
  })
  const [rx, setRx] = useState([{ med:'', dose:'', freq:'1×/j', dur:'', voie:'Orale' }])
  const [vaccines, setVaccines] = useState([])
  const [allergies, setAllergies] = useState([])
  const [examsChecked, setExamsChecked] = useState([])
  const [results, setResults] = useState([])
  const [rsForm, setRsForm] = useState({ name:'', val:'', norm:'', interp:'Normal' })

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  useEffect(() => {
    if (dmpId) loadPatient(dmpId)
  }, [dmpId])

  const loadPatient = async id => {
    setSearching(true)
    try {
      const res = await api.get(`/medecin/patients/${id}/`)
      setPatient(res.data)
      setForm(f => ({...f,
        ant_chr: res.data.ant_chr||'', ant_chir: res.data.ant_chir||'',
        ant_gyn: res.data.ant_gyn||'', ant_hab: res.data.ant_hab||'',
        ant_pere: res.data.ant_pere||'', ant_mere: res.data.ant_mere||'', ant_fra: res.data.ant_fra||'',
      }))
      if (res.data.vaccines) setVaccines(res.data.vaccines.map(v=>({name:v.name,date:v.date||'',next_date:v.next_date||'',status:v.status||'À jour'})))
      if (res.data.allergies) setAllergies(res.data.allergies.map(a=>({name:a.name,allergy_type:a.allergy_type||'Médicament',reaction:a.reaction||'',severity:a.severity||'Légère'})))
      setSearchErr('')
    } catch (_) {
      setSearchErr('Patient introuvable avec cet identifiant.')
    }
    setSearching(false)
  }

  const f = (key, val) => setForm(prev => ({...prev, [key]: val}))

  const addRx = () => setRx(r => [...r, { med:'', dose:'', freq:'1×/j', dur:'', voie:'Orale' }])
  const delRx = i => setRx(r => r.filter((_,idx)=>idx!==i))
  const setRxField = (i, k, v) => setRx(r => r.map((row,idx)=>idx===i?{...row,[k]:v}:row))

  const addVac = () => setVaccines(v => [...v, {name:'',date:'',next_date:'',status:'À jour'}])
  const delVac = i => setVaccines(v => v.filter((_,idx)=>idx!==i))
  const setVacField = (i,k,v) => setVaccines(arr=>arr.map((row,idx)=>idx===i?{...row,[k]:v}:row))

  const addAll = () => setAllergies(a => [...a, {name:'',allergy_type:'Médicament',reaction:'',severity:'Légère'}])
  const delAll = i => setAllergies(a => a.filter((_,idx)=>idx!==i))
  const setAllField = (i,k,v) => setAllergies(arr=>arr.map((row,idx)=>idx===i?{...row,[k]:v}:row))

  const toggleExam = v => setExamsChecked(e => e.includes(v) ? e.filter(x=>x!==v) : [...e,v])

  const addResult = () => {
    if (!rsForm.name || !rsForm.val) return
    setResults(r => [...r, {...rsForm}])
    setRsForm({name:'',val:'',norm:'',interp:'Normal'})
  }

  const saveConsult = async () => {
    if (!patient) { showToast('Sélectionnez un patient d\'abord.'); return }
    setSaving(true)
    try {
      const payload = {
        patient_dmp: patient.dmp_id,
        date: form.date,
        consult_type: form.consult_type,
        motif: form.motif,
        symptoms: [form.s1, form.s2, form.s3, form.s4].filter(Boolean),
        obs_symp: form.obs_symp,
        duration_symp: form.duration_symp,
        vitals: { ta:`${form.tas}/${form.tad}`, fc:form.fc, temp:form.temp, fr:form.fr, spo2:form.spo2, gly:form.gly, poids:form.poids, taille:form.taille },
        exam_cv: form.ex_cv, exam_resp: form.ex_resp, exam_abdo: form.ex_abdo,
        exam_neuro: form.ex_neuro, exam_orl: form.ex_orl, exam_gen: form.ex_gen,
        diag_main: form.diag_main, diag_cim: form.diag_cim, diag_severity: form.diag_severity,
        diag_d1: form.diag_d1, diag_d2: form.diag_d2, diag_conclusion: form.diag_conclusion,
        prescriptions: rx.filter(r=>r.med),
        rx_notes: form.rx_notes,
        exams_requested: examsChecked,
        results: results,
        obs_notes: form.obs_notes,
        next_rdv: form.rdv_date || null,
        next_motif: form.rdv_motif,
        next_urg: form.rdv_urg,
        arret_travail: form.arret_travail,
        refer_spec: form.refer_spec,
        refer_motif: form.refer_motif,
        antecedents: { ant_chr:form.ant_chr, ant_chir:form.ant_chir, ant_gyn:form.ant_gyn, ant_hab:form.ant_hab, ant_pere:form.ant_pere, ant_mere:form.ant_mere, ant_fra:form.ant_fra },
        vaccines: vaccines.filter(v=>v.name),
        allergies: allergies.filter(a=>a.name),
      }
      await api.post('/medecin/consultations/', payload)
      showToast('✅ Consultation sauvegardée avec succès !')
      setTimeout(() => navigate('/medecin'), 1200)
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la sauvegarde.')
    }
    setSaving(false)
  }

  const inputCls = "form-input"
  const selCls = "form-select"
  const taCls = "form-textarea"

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col bg-bg screen-fade">
        <div className="topbar-white">
          <span className="font-display text-navy font-bold text-lg">Medi<span className="text-teal">Carnet</span></span>
          <div className="w-px h-5 bg-border"/>
          <span className="text-xs text-muted">Nouvelle consultation</span>
          <div className="ml-auto">
            <button onClick={() => navigate('/medecin')} className="btn-secondary text-xs">← Tableau de bord</button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="card w-[400px] text-center p-10">
            <div className="text-4xl mb-4">🩺</div>
            <h2 className="font-display text-xl text-navy mb-2">Sélectionner un patient</h2>
            <p className="text-sm text-muted mb-6">Entrez l'identifiant DMP du patient pour commencer la consultation.</p>
            {searchErr && <div className="bg-danger-pale border border-danger/30 rounded-lg p-3 text-xs text-danger mb-4">{searchErr}</div>}
            <input className={`${inputCls} mb-3 text-center`} placeholder="Ex : AO-847152" value={searchId} onChange={e=>setSearchId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadPatient(searchId)}/>
            <button onClick={() => loadPatient(searchId)} disabled={searching} className="btn-primary w-full">
              {searching ? 'Recherche…' : 'Ouvrir la consultation →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const init = (patient.prenom[0]+patient.nom[0]).toUpperCase()
  const progress = ((section + 1) / 10) * 100

  return (
    <div className="min-h-screen flex flex-col bg-bg screen-fade">
      {/* Topbar */}
      <div className="topbar-white">
        <span className="font-display text-navy font-bold text-lg">Medi<span className="text-teal">Carnet</span></span>
        <div className="w-px h-5 bg-border"/>
        <span className="text-xs text-muted">Consultation médicale</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => navigate('/medecin')} className="btn-secondary text-xs">← Tableau de bord</button>
          <button onClick={saveConsult} disabled={saving} className="btn-primary text-xs">💾 Sauvegarder</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-white border-r border-border flex-shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2" style={{background:patient.color}}>
              {init}
            </div>
            <div className="font-semibold text-sm text-navy">{patient.prenom} {patient.nom}</div>
            <div className="text-xs text-muted">{patient.age} ans · {patient.sexe} · {patient.blood}</div>
            <div className="text-[10px] mt-1.5 px-2 py-0.5 rounded-full bg-teal-pale text-teal inline-block">DMP-{patient.dmp_id}</div>
          </div>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider px-4 pt-3 pb-1.5">Sections</p>
          {SECTIONS.map((s,i) => (
            <button key={i} onClick={() => setSection(i)}
              className={`nav-item w-full text-left border-none font-sans ${section===i?'nav-item-active':''} ${section>i?'text-teal':''}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${section===i?'bg-teal text-white':section>i?'bg-teal-pale text-teal':'bg-border text-muted'}`}>{i+1}</div>
              <span className="text-xs">{s}</span>
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-7">
          {/* Progress */}
          <div className="h-1 bg-border rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-teal rounded-full transition-all duration-300" style={{width:`${progress}%`}}/>
          </div>

          {/* S0: Motif */}
          {section === 0 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Motif de consultation & Symptômes</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Raisons de la visite et symptômes déclarés.</p>
            <div className="card mb-4">
              <div className="card-title">📝 Informations générales</div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="form-label">Date</label><input type="date" className={inputCls} value={form.date} onChange={e=>f('date',e.target.value)}/></div>
                <div><label className="form-label">Type de consultation</label>
                  <select className={selCls} value={form.consult_type} onChange={e=>f('consult_type',e.target.value)}>
                    {['Consultation ordinaire','Urgence','Suivi de traitement','Bilan de santé','Consultation prénatale','Vaccination'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Médecin</label><input className={inputCls} value={`Dr. ${auth?.user?.first_name} ${auth?.user?.last_name}`} readOnly/></div>
              </div>
            </div>
            <div className="card mb-4">
              <div className="card-title">🔍 Motif principal</div>
              <input className={inputCls} placeholder="Décrivez le motif de consultation…" value={form.motif} onChange={e=>f('motif',e.target.value)}/>
            </div>
            <div className="card">
              <div className="card-title">🤒 Symptômes déclarés</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {['s1','s2','s3','s4'].map((k,i)=><div key={k}><label className="form-label">Symptôme {i+1}</label><input className={inputCls} placeholder={['Fièvre 39°C','Céphalées','Frissons','Fatigue'][i]} value={form[k]} onChange={e=>f(k,e.target.value)}/></div>)}
              </div>
              <div className="mb-3"><label className="form-label">Durée des symptômes</label>
                <select className={selCls} value={form.duration_symp} onChange={e=>f('duration_symp',e.target.value)}>
                  {['Moins de 24h','1 à 3 jours','3 à 7 jours','1 à 2 semaines','Plus de 2 semaines','Chronique'].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="form-label">Observations supplémentaires</label><textarea className={taCls} value={form.obs_symp} onChange={e=>f('obs_symp',e.target.value)}/></div>
            </div>
          </div>}

          {/* S1: Vitaux */}
          {section === 1 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Signes vitaux</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Constantes physiologiques mesurées.</p>
            <div className="card">
              <div className="card-title">📊 Constantes</div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {label:'Tension artérielle',unit:'mmHg',el:<div className="flex gap-1 items-center"><input type="number" className="w-16 text-center text-xl font-display font-bold border border-border rounded-lg p-1 outline-none focus:border-teal" value={form.tas} onChange={e=>f('tas',e.target.value)}/><span className="text-muted">/</span><input type="number" className="w-16 text-center text-xl font-display font-bold border border-border rounded-lg p-1 outline-none focus:border-teal" value={form.tad} onChange={e=>f('tad',e.target.value)}/></div>},
                  {label:'Fréq. cardiaque',unit:'bpm',key:'fc'},
                  {label:'Température',unit:'°C',key:'temp',step:'0.1'},
                  {label:'Fréq. respiratoire',unit:'cycles/min',key:'fr'},
                  {label:'SpO2',unit:'%',key:'spo2'},
                  {label:'Glycémie',unit:'g/L',key:'gly',step:'0.01'},
                  {label:'Poids',unit:'kg',key:'poids'},
                  {label:'Taille',unit:'cm',key:'taille'},
                ].map(v=>(
                  <div key={v.label} className="bg-bg rounded-xl p-4 text-center">
                    <div className="text-[11px] text-muted mb-2 font-medium">{v.label}</div>
                    {v.el || <input type="number" step={v.step||'1'} className="w-full text-center text-xl font-display font-bold border border-border rounded-lg p-1 outline-none focus:border-teal bg-white" value={form[v.key]} onChange={e=>f(v.key,e.target.value)}/>}
                    <div className="text-[10px] text-muted mt-1">{v.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>}

          {/* S2: Examen clinique */}
          {section === 2 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Examen clinique</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Résultats par appareil et système.</p>
            <div className="card">
              <div className="card-title">🫀 Examen par appareil</div>
              <div className="grid grid-cols-2 gap-4">
                {[{k:'ex_cv',l:'Cardiovasculaire'},{k:'ex_resp',l:'Respiratoire'},{k:'ex_abdo',l:'Abdomen'},{k:'ex_neuro',l:'Neurologique'},{k:'ex_orl',l:'ORL'},{k:'ex_gen',l:'État général'}].map(e=>(
                  <div key={e.k}><label className="form-label">{e.l}</label><textarea className={taCls} value={form[e.k]} onChange={ev=>f(e.k,ev.target.value)}/></div>
                ))}
              </div>
            </div>
          </div>}

          {/* S3: Diagnostic */}
          {section === 3 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Diagnostic médical</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Diagnostic principal, différentiels et conclusion.</p>
            <div className="card mb-4">
              <div className="card-title">🎯 Diagnostic principal</div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="form-label">Diagnostic</label><input className={inputCls} placeholder="Ex : Paludisme à P. falciparum" value={form.diag_main} onChange={e=>f('diag_main',e.target.value)}/></div>
                <div><label className="form-label">Code CIM-10</label><input className={inputCls} placeholder="Ex : B50.0" value={form.diag_cim} onChange={e=>f('diag_cim',e.target.value)}/></div>
                <div><label className="form-label">Sévérité</label>
                  <select className={selCls} value={form.diag_severity} onChange={e=>f('diag_severity',e.target.value)}>
                    {['Légère','Modérée','Sévère','Critique'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="card mb-4">
              <div className="card-title">🔀 Diagnostics différentiels</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Différentiel 1</label><input className={inputCls} value={form.diag_d1} onChange={e=>f('diag_d1',e.target.value)}/></div>
                <div><label className="form-label">Différentiel 2</label><input className={inputCls} value={form.diag_d2} onChange={e=>f('diag_d2',e.target.value)}/></div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">📄 Conclusion clinique</div>
              <textarea className={taCls} style={{minHeight:100}} value={form.diag_conclusion} onChange={e=>f('diag_conclusion',e.target.value)}/>
            </div>
          </div>}

          {/* S4: Ordonnance */}
          {section === 4 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Ordonnance médicale</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Médicaments prescrits avec posologie.</p>
            <div className="card mb-4">
              <div className="card-title">💊 Médicaments prescrits</div>
              <table className="w-full text-xs mb-3">
                <thead><tr className="text-muted font-semibold uppercase tracking-wider border-b border-border">
                  <th className="text-left pb-2">Médicament</th><th className="text-left pb-2">Dosage</th><th className="text-left pb-2">Fréquence</th><th className="text-left pb-2">Durée</th><th className="text-left pb-2">Voie</th><th/>
                </tr></thead>
                <tbody>
                  {rx.map((r,i)=>(
                    <tr key={i} className="border-t border-bg">
                      <td className="py-1 pr-1"><input className="form-input text-xs py-1.5" placeholder="Médicament" value={r.med} onChange={e=>setRxField(i,'med',e.target.value)}/></td>
                      <td className="py-1 pr-1"><input className="form-input text-xs py-1.5" placeholder="250mg" value={r.dose} onChange={e=>setRxField(i,'dose',e.target.value)}/></td>
                      <td className="py-1 pr-1"><select className="form-select text-xs py-1.5" value={r.freq} onChange={e=>setRxField(i,'freq',e.target.value)}>
                        {['1×/j','2×/j','3×/j','Si besoin','Dose unique'].map(o=><option key={o}>{o}</option>)}
                      </select></td>
                      <td className="py-1 pr-1"><input className="form-input text-xs py-1.5" placeholder="7 jours" value={r.dur} onChange={e=>setRxField(i,'dur',e.target.value)}/></td>
                      <td className="py-1 pr-1"><select className="form-select text-xs py-1.5" value={r.voie} onChange={e=>setRxField(i,'voie',e.target.value)}>
                        {['Orale','Injectable','Topique','Sublinguale'].map(o=><option key={o}>{o}</option>)}
                      </select></td>
                      <td className="py-1"><button onClick={()=>delRx(i)} className="text-muted hover:text-danger text-base bg-none border-none cursor-pointer px-2">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addRx} className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:border-teal hover:text-teal transition-colors cursor-pointer bg-none font-sans">+ Ajouter un médicament</button>
            </div>
            <div className="card">
              <div className="card-title">📌 Instructions patient</div>
              <textarea className={taCls} placeholder="Conseils, alimentation, mode de vie…" value={form.rx_notes} onChange={e=>f('rx_notes',e.target.value)}/>
            </div>
          </div>}

          {/* S5: Examens */}
          {section === 5 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Examens complémentaires</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Analyses et imagerie demandées.</p>
            <div className="card mb-4">
              <div className="card-title">🔬 Analyses biologiques</div>
              <div className="grid grid-cols-3 gap-2">
                {EXAMS_BIO.map(ex=>(
                  <label key={ex} className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer text-xs transition-all ${examsChecked.includes(ex)?'border-teal bg-teal-pale text-teal':'border-border text-muted hover:border-teal/50'}`}>
                    <input type="checkbox" className="accent-teal" checked={examsChecked.includes(ex)} onChange={()=>toggleExam(ex)}/>{ex}
                  </label>
                ))}
              </div>
            </div>
            <div className="card mb-4">
              <div className="card-title">🩻 Imagerie médicale</div>
              <div className="grid grid-cols-3 gap-2">
                {EXAMS_IMG.map(ex=>(
                  <label key={ex} className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer text-xs transition-all ${examsChecked.includes(ex)?'border-teal bg-teal-pale text-teal':'border-border text-muted hover:border-teal/50'}`}>
                    <input type="checkbox" className="accent-teal" checked={examsChecked.includes(ex)} onChange={()=>toggleExam(ex)}/>{ex}
                  </label>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title">📊 Saisir des résultats</div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div><label className="form-label">Examen</label><input className={inputCls} placeholder="Ex : Hémoglobine" value={rsForm.name} onChange={e=>setRsForm({...rsForm,name:e.target.value})}/></div>
                <div><label className="form-label">Valeur</label><input className={inputCls} placeholder="11.8 g/dL" value={rsForm.val} onChange={e=>setRsForm({...rsForm,val:e.target.value})}/></div>
                <div><label className="form-label">Norme</label><input className={inputCls} placeholder="12–16 g/dL" value={rsForm.norm} onChange={e=>setRsForm({...rsForm,norm:e.target.value})}/></div>
                <div><label className="form-label">Interprétation</label>
                  <select className={selCls} value={rsForm.interp} onChange={e=>setRsForm({...rsForm,interp:e.target.value})}>
                    {['Normal','Abaissé','Élevé','Critique'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={addResult} className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:border-teal hover:text-teal transition-colors cursor-pointer bg-none font-sans mb-3">+ Enregistrer ce résultat</button>
              {results.map((r,i)=>(
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium">{r.name}</span><span className="text-muted">{r.val} ({r.norm||'—'})</span></div>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${r.interp==='Normal'?78:r.interp==='Abaissé'?32:r.interp==='Élevé'?90:96}%`,background:r.interp==='Normal'?'#0E7A5F':r.interp==='Critique'?'#C0392B':'#D4840A'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* S6: Antécédents */}
          {section === 6 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Antécédents médicaux</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Historique médical personnel et familial.</p>
            <div className="card mb-4">
              <div className="card-title">👤 Antécédents personnels</div>
              <div className="grid grid-cols-2 gap-4">
                {[{k:'ant_chr',l:'Maladies chroniques'},{k:'ant_chir',l:'Chirurgies / Hospitalisations'},{k:'ant_gyn',l:'Gynécologie / Obstétrique'},{k:'ant_hab',l:'Habitudes de vie'}].map(e=>(
                  <div key={e.k}><label className="form-label">{e.l}</label><textarea className={taCls} value={form[e.k]} onChange={ev=>f(e.k,ev.target.value)}/></div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title">👨‍👩‍👧 Antécédents familiaux</div>
              <div className="grid grid-cols-3 gap-3">
                {[{k:'ant_pere',l:'Père'},{k:'ant_mere',l:'Mère'},{k:'ant_fra',l:'Fratrie'}].map(e=>(
                  <div key={e.k}><label className="form-label">{e.l}</label><input className={inputCls} value={form[e.k]} onChange={ev=>f(e.k,ev.target.value)}/></div>
                ))}
              </div>
            </div>
          </div>}

          {/* S7: Vaccinations */}
          {section === 7 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Carnet de vaccination</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">État vaccinal du patient.</p>
            <div className="card">
              <div className="card-title">💉 Vaccins</div>
              <table className="w-full text-xs mb-3">
                <thead><tr className="text-muted font-semibold uppercase tracking-wider border-b border-border">
                  <th className="text-left pb-2">Vaccin</th><th className="text-left pb-2">Date</th><th className="text-left pb-2">Prochain rappel</th><th className="text-left pb-2">Statut</th><th/>
                </tr></thead>
                <tbody>
                  {vaccines.map((v,i)=>(
                    <tr key={i} className="border-t border-bg">
                      <td className="py-1 pr-1"><input className="form-input text-xs py-1.5" placeholder="Nom du vaccin" value={v.name} onChange={e=>setVacField(i,'name',e.target.value)}/></td>
                      <td className="py-1 pr-1"><input type="date" className="form-input text-xs py-1.5" value={v.date} onChange={e=>setVacField(i,'date',e.target.value)}/></td>
                      <td className="py-1 pr-1"><input className="form-input text-xs py-1.5" placeholder="2029 ou À vie" value={v.next_date} onChange={e=>setVacField(i,'next_date',e.target.value)}/></td>
                      <td className="py-1 pr-1"><select className="form-select text-xs py-1.5" value={v.status} onChange={e=>setVacField(i,'status',e.target.value)}>
                        {['À jour','Rappel dû','Non administré'].map(o=><option key={o}>{o}</option>)}
                      </select></td>
                      <td><button onClick={()=>delVac(i)} className="text-muted hover:text-danger bg-none border-none cursor-pointer px-2">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addVac} className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:border-teal hover:text-teal transition-colors cursor-pointer bg-none font-sans">+ Ajouter un vaccin</button>
            </div>
          </div>}

          {/* S8: Allergies */}
          {section === 8 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Allergies & Contre-indications</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Allergies documentées du patient.</p>
            <div className="card">
              <div className="card-title">⚠️ Allergies connues</div>
              <table className="w-full text-xs mb-3">
                <thead><tr className="text-muted font-semibold uppercase tracking-wider border-b border-border">
                  <th className="text-left pb-2">Allergène</th><th className="text-left pb-2">Type</th><th className="text-left pb-2">Réaction</th><th className="text-left pb-2">Sévérité</th><th/>
                </tr></thead>
                <tbody>
                  {allergies.map((a,i)=>(
                    <tr key={i} className="border-t border-bg">
                      <td className="py-1 pr-1"><input className="form-input text-xs py-1.5" placeholder="Allergène" value={a.name} onChange={e=>setAllField(i,'name',e.target.value)}/></td>
                      <td className="py-1 pr-1"><select className="form-select text-xs py-1.5" value={a.allergy_type} onChange={e=>setAllField(i,'allergy_type',e.target.value)}>
                        {['Médicament','Alimentaire','Environnemental','Contact'].map(o=><option key={o}>{o}</option>)}
                      </select></td>
                      <td className="py-1 pr-1"><input className="form-input text-xs py-1.5" placeholder="Réaction" value={a.reaction} onChange={e=>setAllField(i,'reaction',e.target.value)}/></td>
                      <td className="py-1 pr-1"><select className="form-select text-xs py-1.5" value={a.severity} onChange={e=>setAllField(i,'severity',e.target.value)}>
                        {['Légère','Modérée-Sévère','Anaphylaxie'].map(o=><option key={o}>{o}</option>)}
                      </select></td>
                      <td><button onClick={()=>delAll(i)} className="text-muted hover:text-danger bg-none border-none cursor-pointer px-2">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addAll} className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:border-teal hover:text-teal transition-colors cursor-pointer bg-none font-sans">+ Ajouter une allergie</button>
            </div>
          </div>}

          {/* S9: Suivi */}
          {section === 9 && <div className="screen-fade">
            <h2 className="font-display text-xl text-navy mb-1">Observations & Plan de suivi</h2>
            <p className="text-xs text-muted mb-5 pb-4 border-b border-border">Notes cliniques finales et suivi programmé.</p>
            <div className="card mb-4">
              <div className="card-title">📝 Notes cliniques</div>
              <textarea className={taCls} style={{minHeight:110}} value={form.obs_notes} onChange={e=>f('obs_notes',e.target.value)}/>
            </div>
            <div className="card mb-4">
              <div className="card-title">📅 Plan de suivi</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Prochain RDV</label><input type="date" className={inputCls} value={form.rdv_date} onChange={e=>f('rdv_date',e.target.value)}/></div>
                <div><label className="form-label">Motif du RDV</label><input className={inputCls} value={form.rdv_motif} onChange={e=>f('rdv_motif',e.target.value)}/></div>
                <div><label className="form-label">Consulter en urgence si</label><input className={inputCls} value={form.rdv_urg} onChange={e=>f('rdv_urg',e.target.value)}/></div>
                <div><label className="form-label">Arrêt de travail</label>
                  <select className={selCls} value={form.arret_travail} onChange={e=>f('arret_travail',e.target.value)}>
                    {['Non','1 jour','2 jours','3 jours','5 jours','1 semaine','2 semaines'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🏥 Référence spécialiste</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Spécialiste</label>
                  <select className={selCls} value={form.refer_spec} onChange={e=>f('refer_spec',e.target.value)}>
                    {['Aucun','Cardiologue','Gynécologue','Pédiatre','Pneumologue','Neurologue','Ophtalmologue','Rhumatologue','Chirurgien'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Motif</label><input className={inputCls} value={form.refer_motif} onChange={e=>f('refer_motif',e.target.value)}/></div>
              </div>
            </div>
          </div>}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-5 border-t border-border">
            <button onClick={() => setSection(s => Math.max(0, s-1))} disabled={section===0}
              className="btn-secondary disabled:opacity-40">← Précédent</button>
            {section < 9
              ? <button onClick={() => setSection(s => s+1)} className="btn-primary">Suivant →</button>
              : <button onClick={saveConsult} disabled={saving} className="px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors border-none cursor-pointer font-sans disabled:opacity-60">
                  {saving ? 'Sauvegarde…' : '✅ Valider et sauvegarder'}
                </button>
            }
          </div>
        </div>
      </div>
      <Toast msg={toast}/>
    </div>
  )
}
