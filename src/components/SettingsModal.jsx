import { useState, useRef } from 'react'
import { db } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize',
  'Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei',
  'Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chad','Chile',
  'China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
  'Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia',
  'Ethiopia','Fiji','Finland','France','Gabon','Georgia','Germany','Ghana','Greece',
  'Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran',
  'Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya',
  'Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Libya','Liechtenstein','Lithuania',
  'Luxembourg','Madagascar','Malaysia','Maldives','Mali','Malta','Mexico','Moldova',
  'Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','Norway','Oman',
  'Pakistan','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Singapore','Slovakia',
  'Slovenia','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka',
  'Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Togo','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam',
  'Yemen','Zambia','Zimbabwe'
]

const DIVISIONS = [
  'Command','Flight Control / Operations','Engineering','Science','Medical',
  'Security / Tactical','Communications','Sensor Operations','Astrometrics',
  'Stellar Cartography','Computer Systems','Transporter Operations','Shuttle Operations',
  'Environmental Systems','Damage Control','Logistics / Replicator Systems',
  'Diplomatic Services'
]

const RANKS = {
  'Enlisted Ranks': [
    'Crewman Recruit','Crewman Apprentice','Crewman',
    'Petty Officer Third Class','Petty Officer Second Class','Petty Officer First Class',
    'Chief Petty Officer','Senior Chief Petty Officer','Master Chief Petty Officer'
  ],
  'Warrant Officers': ['Warrant Officer','Chief Warrant Officer'],
  'Commissioned Officers': [
    'Ensign','Lieutenant (Junior Grade)','Lieutenant',
    'Lieutenant Commander','Commander','Captain'
  ],
  'Flag Officers': [
    'Commodore','Rear Admiral (Lower Half)','Rear Admiral',
    'Vice Admiral','Admiral','Fleet Admiral'
  ]
}

const Field = ({ label, children }) => (
  <div>
    <div className="lcars-label" style={{ marginBottom: 6 }}>{label}</div>
    {children}
  </div>
)

export default function SettingsModal({ user, onClose, onSave }) {
  const [avatar,           setAvatar]           = useState(user.avatar           || null)
  const [country,          setCountry]          = useState(user.country          || '')
  const [division,         setDivision]         = useState(user.division         || '')
  const [rank,             setRank]             = useState(user.rank             || '')
  const [serviceSummary,   setServiceSummary]   = useState(user.serviceSummary   || '')
  const [commandTrack,     setCommandTrack]     = useState(user.commandTrack     || '')
  const [performanceNotes, setPerformanceNotes] = useState(user.performanceNotes || '')
  const [careerObjective,  setCareerObjective]  = useState(user.careerObjective  || '')
  const [saved,            setSaved]            = useState(false)
  const [loading,          setLoading]          = useState(false)
  const fileInput = useRef()

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updates = {
        avatar:           avatar || null,
        country,          division,        rank,
        serviceSummary,   commandTrack,    performanceNotes, careerObjective
      }
      const ref = doc(db, 'users', user.starfleetId)
      await updateDoc(ref, updates)
      onSave({ ...user, ...updates })
      setSaved(true)
      setTimeout(() => { setSaved(false); onClose() }, 1000)
    } catch (e) {
      console.error('Save failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: 'var(--lcars-panel)', border: '1px solid var(--lcars-peach)', borderRadius: 4, width: '100%', maxWidth: 560, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: 44, flexShrink: 0 }}>
          <div style={{ background: 'var(--lcars-purple)', width: 48, borderRadius: '4px 0 0 0' }} />
          <div style={{ background: 'var(--lcars-peach)', flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 16, fontFamily: 'Antonio', fontWeight: 700, fontSize: 15, color: '#000', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Personnel Settings
          </div>
          <button onClick={onClose} style={{ background: '#CC2200', width: 44, border: 'none', cursor: 'pointer', color: '#fff', fontFamily: 'Antonio', fontWeight: 700, fontSize: 14, borderRadius: '0 4px 0 0' }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Starfleet ID */}
          <div style={{ padding: '10px 14px', background: 'var(--lcars-dgray)', borderRadius: 4, border: '1px solid var(--lcars-gray)' }}>
            <div className="lcars-label" style={{ marginBottom: 3 }}>Starfleet ID</div>
            <div style={{ fontFamily: 'Antonio', fontSize: 16, color: 'var(--lcars-gold)', letterSpacing: '0.08em' }}>{user.starfleetId}</div>
          </div>

          {/* Avatar */}
          <Field label="Personnel Photo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: 4, border: '2px solid var(--lcars-peach)', background: 'var(--lcars-dgray)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👤</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="lcars-pill lcars-pill-ghost" style={{ fontSize: 12 }} onClick={() => fileInput.current.click()}>📁 Upload Photo</button>
                {avatar && <button className="lcars-pill lcars-pill-danger" style={{ fontSize: 12 }} onClick={() => setAvatar(null)}>Remove</button>}
              </div>
              <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
            </div>
          </Field>

          {/* Country */}
          <Field label="Country of Origin">
            <select className="lcars-input" value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">— Select Country —</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <div style={{ height: 1, background: 'var(--lcars-gray)' }} />
          <div style={{ fontFamily: 'Antonio', fontSize: 11, color: 'var(--lcars-gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Personnel Bio</div>

          {/* Division */}
          <Field label="Division">
            <select className="lcars-input" value={division} onChange={e => setDivision(e.target.value)}>
              <option value="">— Select Division —</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

          {/* Rank */}
          <Field label="Rank">
            <select className="lcars-input" value={rank} onChange={e => setRank(e.target.value)}>
              <option value="">— Select Rank —</option>
              {Object.entries(RANKS).map(([group, ranks]) => (
                <optgroup key={group} label={group}>
                  {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>

          {/* Service Summary */}
          <Field label="Service Summary">
            <textarea className="lcars-input" placeholder="Brief summary of service history..." value={serviceSummary} onChange={e => setServiceSummary(e.target.value)} style={{ minHeight: 80 }} />
          </Field>

          {/* Command Track */}
          <Field label="Command Track">
            <textarea className="lcars-input" placeholder="Command assignments and responsibilities..." value={commandTrack} onChange={e => setCommandTrack(e.target.value)} style={{ minHeight: 80 }} />
          </Field>

          {/* Performance Notes */}
          <Field label="Performance Notes">
            <textarea className="lcars-input" placeholder="Use • for bullet points e.g. • Exceptional performance during..." value={performanceNotes} onChange={e => setPerformanceNotes(e.target.value)} style={{ minHeight: 100 }} />
          </Field>

          {/* Career Objective */}
          <Field label="Career Objective">
            <textarea className="lcars-input" placeholder="Long-term career goals and aspirations..." value={careerObjective} onChange={e => setCareerObjective(e.target.value)} style={{ minHeight: 80 }} />
          </Field>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--lcars-gray)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="lcars-pill lcars-pill-ghost" onClick={onClose}>Cancel</button>
          <button style={{ background: 'var(--lcars-peach)', color: '#000' }} className="lcars-pill" onClick={handleSave} disabled={loading}>
            {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </div>
    </div>
  )
}