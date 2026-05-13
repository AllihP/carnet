import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#0E7A5F','#185FA5','#C9A84C','#C0392B','#6D3088','#2E7D32','#8B5E15','#1DAA84','#E4C46A','#FF7043']

function StatCard({ icon, value, label, color = '#0E7A5F', sub }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-card">
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-2xl font-semibold font-display mb-0.5" style={{color}}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
      {sub && <div className="text-[11px] text-muted/70 mt-1">{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  return <h3 className="text-sm font-semibold text-navy mb-3">{children}</h3>
}

function ChartCard({ title, height = 220, children }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-card">
      <div className="text-xs font-semibold text-navy mb-4">{title}</div>
      <div style={{height}}>{children}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-md text-xs">
        <div className="font-medium text-navy mb-0.5">{label}</div>
        {payload.map((p, i) => <div key={i} style={{color: p.color}}>{p.name}: <strong>{p.value}</strong></div>)}
      </div>
    )
  }
  return null
}

export default function DirectionDashboard() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [patientSearch, setPatientSearch] = useState('')

  useEffect(() => {
    api.get('/direction/stats/').then(res => { setStats(res.data); setLoading(false) }).catch(() => setLoading(false))
    api.get('/direction/patients/').then(res => setPatients(res.data)).catch(() => {})
  }, [])

  const tabs = [
    { id: 'overview',      label: '📊 Vue d\'ensemble' },
    { id: 'patients',      label: '👥 Liste des patients' },
    { id: 'diseases',      label: '🦠 Maladies & Diagnostics' },
    { id: 'medications',   label: '💊 Médicaments' },
    { id: 'consultations', label: '📋 Liste consultations' },
    { id: 'doctors',       label: '🩺 Médecins' },
  ]

  const initials = (auth?.user?.first_name?.[0]||'') + (auth?.user?.last_name?.[0]||'')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-muted text-sm">Chargement des statistiques…</p>
        </div>
      </div>
    )
  }

  if (!stats) return <div className="min-h-screen flex items-center justify-center bg-bg"><p className="text-muted text-sm">Erreur lors du chargement.</p></div>

  const typeData = stats.type_counts.map(t => ({ name: t.consult_type, value: t.count }))

  return (
    <div className="min-h-screen flex flex-col bg-bg screen-fade">
      {/* Topbar */}
      <div className="h-14 flex items-center px-6 gap-3 flex-shrink-0 border-b border-border" style={{background:'linear-gradient(90deg,#1A0A00,#2D1A00)'}}>
        <span className="font-display text-lg font-bold text-white">Medi<span style={{color:'#C9A84C'}}>Carnet</span></span>
        <div className="w-px h-5 bg-white/15"/>
        <span className="text-xs text-white/40">Direction — Hôpital National de N'Djamena</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-white/60">{auth?.user?.first_name} {auth?.user?.last_name}</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{background:'#C9A84C',color:'#1A0A00'}}>{initials}</div>
          <button onClick={logout} className="px-3 py-1.5 text-xs rounded-lg border border-white/20 bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer font-sans">Déconnexion</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar tabs */}
        <div className="w-52 bg-white border-r border-border flex-shrink-0 py-4">
          <div className="px-4 mb-3 text-[10px] font-semibold text-muted uppercase tracking-wider">Tableaux de bord</div>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full text-left px-4 py-2.5 text-xs border-l-[3px] border-none font-sans cursor-pointer transition-all ${activeTab===t.id?'bg-gold-pale text-amber-800 border-l-gold font-medium':'border-l-transparent text-muted hover:bg-bg hover:text-text'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* ===== VUE D'ENSEMBLE ===== */}
          {activeTab === 'overview' && <>
            <h1 className="font-display text-2xl text-navy mb-1">Tableau de bord — Direction</h1>
            <p className="text-xs text-muted mb-6">{new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-3.5 mb-6">
              <StatCard icon="👥" value={stats.total_patients} label="Patients enregistrés" color="#0A1F3C"/>
              <StatCard icon="📋" value={stats.total_consultations} label="Consultations totales" color="#0E7A5F"/>
              <StatCard icon="🤰" value={stats.prenatal_patients} label="Femmes enceintes suivies" color="#6D3088"/>
              <StatCard icon="🦠" value={stats.transmissible_count} label="Maladies transmissibles" color="#C0392B"/>
            </div>
            <div className="grid grid-cols-4 gap-3.5 mb-6">
              <StatCard icon="🚨" value={stats.urgence_count} label="Consultations urgences" color="#C0392B"/>
              <StatCard icon="👩" value={stats.female_count} label="Patientes (femmes)" color="#D4840A" sub={`/ ${stats.total_patients} total`}/>
              <StatCard icon="👨" value={stats.male_count} label="Patients (hommes)" color="#185FA5"/>
              <StatCard icon="⏳" value={stats.first_login_pending} label="1ères connexions en attente" color="#8B5E15"/>
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <ChartCard title="📈 Consultations par mois (12 derniers mois)" height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.months_data} margin={{top:5,right:10,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F5FA"/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line type="monotone" dataKey="count" name="Consultations" stroke="#0E7A5F" strokeWidth={2.5} dot={{r:3,fill:'#0E7A5F'}} activeDot={{r:5}}/>
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="🥧 Types de consultation" height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" nameKey="name" paddingAngle={2}>
                      {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                    </Pie>
                    <Tooltip formatter={(val, name) => [val, name]}/>
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{fontSize:10,color:'#6B7A90'}}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <ChartCard title="🦠 Top 10 diagnostics les plus fréquents" height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.top_diagnoses} layout="vertical" margin={{top:0,right:10,left:10,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F5FA" horizontal={false}/>
                    <XAxis type="number" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} axisLine={false}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} width={120}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="count" name="Cas" fill="#0E7A5F" radius={[0,4,4,0]}>
                      {stats.top_diagnoses.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="💊 Top 10 médicaments prescrits" height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.top_medications} layout="vertical" margin={{top:0,right:10,left:10,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F5FA" horizontal={false}/>
                    <XAxis type="number" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} axisLine={false}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} width={120}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="count" name="Prescriptions" fill="#185FA5" radius={[0,4,4,0]}>
                      {stats.top_medications.map((_,i)=><Cell key={i} fill={COLORS[(i+3)%COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>}

          {/* ===== LISTE DES PATIENTS ===== */}
          {activeTab === 'patients' && <>
            <h2 className="font-display text-2xl text-navy mb-1">Liste des patients</h2>
            <p className="text-xs text-muted mb-4">Tous les patients enregistrés dans l'établissement.</p>

            {/* Barre de recherche */}
            <div className="mb-4">
              <input
                className="form-input max-w-sm"
                placeholder="Rechercher par nom, prénom ou DMP…"
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
              />
            </div>

            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="grid text-[10px] font-semibold text-muted uppercase tracking-wider px-5 py-3 bg-bg border-b border-border"
                style={{ gridTemplateColumns: '2.5fr 1fr 1.2fr 1.5fr 1fr 120px' }}>
                <span>Patient</span>
                <span>Âge · Sexe</span>
                <span>Groupe sanguin</span>
                <span>Dernière consultation</span>
                <span>Accès</span>
                <span>Actions</span>
              </div>

              {patients.length === 0
                ? <div className="p-10 text-center text-muted text-sm">Aucun patient enregistré.</div>
                : (() => {
                    const q = patientSearch.toLowerCase()
                    const filtered = q
                      ? patients.filter(p =>
                          p.prenom.toLowerCase().includes(q) ||
                          p.nom.toLowerCase().includes(q) ||
                          p.dmp_id.toLowerCase().includes(q)
                        )
                      : patients

                    if (filtered.length === 0)
                      return <div className="p-8 text-center text-muted text-sm">Aucun résultat pour « {patientSearch} ».</div>

                    return filtered.map(p => {
                      const init = (p.prenom[0] + p.nom[0]).toUpperCase()
                      return (
                        <div key={p.id}
                          className="grid px-5 py-3.5 border-b border-border last:border-0 hover:bg-bg/50 transition-colors items-center"
                          style={{ gridTemplateColumns: '2.5fr 1fr 1.2fr 1.5fr 1fr 120px' }}>

                          {/* Identité */}
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 text-xs"
                              style={{ background: p.color }}>
                              {init}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text">{p.prenom} {p.nom}</div>
                              <div className="text-[11px] text-muted">DMP-{p.dmp_id}</div>
                            </div>
                          </div>

                          <div className="text-xs text-muted">{p.age} ans · {p.sexe === 'F' ? 'F' : 'M'}</div>
                          <div className="text-xs font-medium text-navy">{p.blood}</div>
                          <div className="text-xs text-muted">{p.last_consult || 'Aucune'}</div>

                          {/* Badge accès */}
                          <div>
                            {p.first_login
                              ? <span className="badge-warn text-[10px]">⏳ Code temp.</span>
                              : <span className="badge-ok text-[10px]">🔐 Code actif</span>
                            }
                          </div>

                          {/* Actions */}
                          <div>
                            <button
                              onClick={() => navigate(`/direction/dossier/${p.dmp_id}`)}
                              className="px-3 py-1.5 border border-border rounded-lg text-[11px] font-medium text-muted hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-pointer bg-white font-sans">
                              📁 Dossier
                            </button>
                          </div>
                        </div>
                      )
                    })
                  })()
              }
            </div>

            <div className="mt-3 text-[11px] text-muted">
              {patients.length > 0 && `${patients.length} patient${patients.length > 1 ? 's' : ''} enregistré${patients.length > 1 ? 's' : ''} au total`}
            </div>
          </>}

          {/* ===== MALADIES ===== */}
          {activeTab === 'diseases' && <>
            <h2 className="font-display text-2xl text-navy mb-1">Maladies & Diagnostics</h2>
            <p className="text-xs text-muted mb-6">Analyse épidémiologique basée sur tous les diagnostics enregistrés.</p>
            <ChartCard title="Top 10 diagnostics les plus fréquents" height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_diagnoses} margin={{top:5,right:20,left:0,bottom:40}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F5FA"/>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} angle={-35} textAnchor="end"/>
                  <YAxis tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} axisLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="count" name="Cas" radius={[4,4,0,0]}>
                    {stats.top_diagnoses.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="mt-4 bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-bg border-b border-border text-xs font-semibold text-muted uppercase tracking-wider grid gap-0" style={{gridTemplateColumns:'2fr 1fr 80px'}}>
                <span>Diagnostic</span><span>Cas</span><span>Fréquence</span>
              </div>
              {stats.top_diagnoses.map((d,i)=>(
                <div key={i} className="grid px-5 py-3 border-b border-border last:border-0 hover:bg-bg/50 transition-colors items-center" style={{gridTemplateColumns:'2fr 1fr 80px'}}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                    <span className="text-sm font-medium text-text">{d.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-navy">{d.count}</span>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${Math.min(100, (d.count / (stats.top_diagnoses[0]?.count||1)) * 100)}%`, background:COLORS[i%COLORS.length]}}/>
                  </div>
                </div>
              ))}
              {!stats.top_diagnoses.length && <div className="p-8 text-center text-muted text-sm">Aucun diagnostic enregistré.</div>}
            </div>
          </>}

          {/* ===== MÉDICAMENTS ===== */}
          {activeTab === 'medications' && <>
            <h2 className="font-display text-2xl text-navy mb-1">Médicaments prescrits</h2>
            <p className="text-xs text-muted mb-6">Analyse des prescriptions médicamenteuses.</p>
            <ChartCard title="Top 10 médicaments les plus prescrits" height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_medications} margin={{top:5,right:20,left:0,bottom:40}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F5FA"/>
                  <XAxis dataKey="name" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} angle={-35} textAnchor="end"/>
                  <YAxis tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} axisLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="count" name="Prescriptions" radius={[4,4,0,0]}>
                    {stats.top_medications.map((_,i)=><Cell key={i} fill={COLORS[(i+2)%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="mt-4 bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-bg border-b border-border text-xs font-semibold text-muted uppercase tracking-wider grid" style={{gridTemplateColumns:'2fr 1fr 1fr'}}>
                <span>Médicament</span><span>Prescriptions</span><span>Proportion</span>
              </div>
              {stats.top_medications.map((m,i)=>(
                <div key={i} className="grid px-5 py-3 border-b border-border last:border-0 hover:bg-bg/50 transition-colors items-center" style={{gridTemplateColumns:'2fr 1fr 1fr'}}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[(i+2)%COLORS.length]}}/>
                    <span className="text-sm font-medium text-text">{m.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-navy">{m.count}</span>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${Math.min(100,(m.count/(stats.top_medications[0]?.count||1))*100)}%`,background:COLORS[(i+2)%COLORS.length]}}/>
                  </div>
                </div>
              ))}
              {!stats.top_medications.length && <div className="p-8 text-center text-muted text-sm">Aucune prescription enregistrée.</div>}
            </div>
          </>}

          {/* ===== CONSULTATIONS ===== */}
          {activeTab === 'consultations' && <>
            <h2 className="font-display text-2xl text-navy mb-1">Liste des consultations</h2>
            <p className="text-xs text-muted mb-6">Toutes les consultations avec le médecin ayant consulté chaque patient.</p>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="grid px-5 py-3 bg-bg border-b border-border text-[10px] font-semibold text-muted uppercase tracking-wider"
                style={{gridTemplateColumns:'100px 1.8fr 1.2fr 1fr 1fr 1fr'}}>
                <span>Date</span><span>Patient</span><span>Médecin</span><span>Type</span><span>Diagnostic</span><span>Sévérité</span>
              </div>
              {stats.recent_consultations.length===0
                ? <div className="p-10 text-center text-muted text-sm">Aucune consultation enregistrée.</div>
                : stats.recent_consultations.map((c,i)=>(
                    <div key={i} className="grid px-5 py-3 border-b border-border last:border-0 hover:bg-bg/50 transition-colors items-center text-sm"
                      style={{gridTemplateColumns:'100px 1.8fr 1.2fr 1fr 1fr 1fr'}}>
                      <span className="text-xs text-muted">{c.date}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                            style={{background: c.patient_color||'#0E7A5F'}}>
                            {c.patient.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-text">{c.patient}</div>
                            <div className="text-[10px] text-muted">DMP-{c.dmp_id}</div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-teal font-medium">{c.doctor}</span>
                      <span className="text-xs text-muted">{c.type}</span>
                      <span className="text-xs font-medium text-text truncate max-w-[120px]">{c.diagnostic}</span>
                      <span>{c.severity && c.severity !== '—'
                        ? <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.severity==='Critique'?'bg-danger-pale text-danger':c.severity==='Sévère'?'badge-warn':'badge-ok'}`}>{c.severity}</span>
                        : <span className="text-muted text-xs">—</span>
                      }</span>
                    </div>
                  ))
              }
            </div>
          </>}

          {/* ===== MÉDECINS ===== */}
          {activeTab === 'doctors' && <>
            <h2 className="font-display text-2xl text-navy mb-1">Médecins & Activité</h2>
            <p className="text-xs text-muted mb-6">Statistiques par médecin de l'hôpital.</p>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <ChartCard title="Consultations par médecin" height={240}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.doctors_stats} margin={{top:5,right:10,left:-20,bottom:30}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F5FA"/>
                    <XAxis dataKey="name" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} angle={-20} textAnchor="end"/>
                    <YAxis tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="consultations" name="Consultations" fill="#0E7A5F" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Patients pris en charge par médecin" height={240}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.doctors_stats} margin={{top:5,right:10,left:-20,bottom:30}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F5FA"/>
                    <XAxis dataKey="name" tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} angle={-20} textAnchor="end"/>
                    <YAxis tick={{fontSize:10,fill:'#6B7A90'}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="patients" name="Patients" fill="#185FA5" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="grid px-5 py-3 bg-bg border-b border-border text-[10px] font-semibold text-muted uppercase tracking-wider"
                style={{gridTemplateColumns:'2fr 1.5fr 80px 80px 80px'}}>
                <span>Médecin</span><span>Spécialité</span><span>Téléphone</span><span>Consultations</span><span>Patients</span>
              </div>
              {stats.doctors_stats.length===0
                ? <div className="p-10 text-center text-muted text-sm">Aucun médecin enregistré.</div>
                : stats.doctors_stats.map((d,i)=>(
                    <div key={i} className="grid px-5 py-3.5 border-b border-border last:border-0 hover:bg-bg/50 transition-colors items-center"
                      style={{gridTemplateColumns:'2fr 1.5fr 80px 80px 80px'}}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-xs font-bold text-white">
                          {d.name.split(' ').filter(w=>!['Dr.','Mme','M.'].includes(w)).map(w=>w[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text">{d.name}</div>
                        </div>
                      </div>
                      <span className="text-xs text-muted">{d.specialite||'Médecine générale'}</span>
                      <span className="text-xs text-muted">{d.telephone||'—'}</span>
                      <span className="text-sm font-semibold text-teal text-center">{d.consultations}</span>
                      <span className="text-sm font-semibold text-navy text-center">{d.patients}</span>
                    </div>
                  ))
              }
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}
