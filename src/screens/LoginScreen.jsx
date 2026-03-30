import React, { useState } from 'react'

function buildStarfleetID(firstName, lastName, dob, genderSpecies) {
  const initials = (firstName[0] || '').toUpperCase() + (lastName[0] || '').toUpperCase()
  const dobClean = dob.replace(/-/g, '')
  return `${initials}-${dobClean}-${genderSpecies}`
}

export default function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '', genderSpecies: 'M' })
  const [loginId, setLoginId] = useState('')
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = () => {
    setError('')
    if (!form.firstName.trim() || !form.lastName.trim()) return setError('First and last name required.')
    if (!form.dob) return setError('Date of birth required.')
    const dobRegex = /^\d{2}-\d{2}-\d{4}$/
    if (!dobRegex.test(form.dob)) return setError('Date must be DD-MM-YYYY.')
    const [dd, mm, yyyy] = form.dob.split('-')
    const date = new Date(`${yyyy}-${mm}-${dd}`)
    if (isNaN(date)) return setError('Invalid date.')
    const dobCompact = `${dd}${mm}${yyyy}`
    const id = buildStarfleetID(form.firstName, form.lastName, dobCompact, form.genderSpecies)
    const existing = JSON.parse(localStorage.getItem('lcars_users') || '{}')
    if (existing[id]) return setError('Starfleet ID already registered.')
    existing[id] = { firstName: form.firstName, lastName: form.lastName, dob: form.dob, genderSpecies: form.genderSpecies, starfleetId: id, logs: [] }
    localStorage.setItem('lcars_users', JSON.stringify(existing))
    onLogin(existing[id])
  }

  const handleLogin = () => {
    setError('')
    const existing = JSON.parse(localStorage.getItem('lcars_users') || '{}')
    const id = loginId.trim().toUpperCase()
    if (!existing[id]) return setError('Starfleet ID not found. Please register first.')
    onLogin(existing[id])
  }

  const previewId = form.firstName && form.lastName && form.dob.length === 10
    ? buildStarfleetID(form.firstName, form.lastName, form.dob.replace(/-/g, ''), form.genderSpecies)
    : null

  return (
    <div className="lcars-scanline" style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: '8px', height: '44px' }}>
          <div style={{ background: 'var(--lcars-purple)', width: '60px', borderRadius: '999px 0 0 999px', flexShrink: 0 }} />
          <div className="lcars-bar" style={{ background: 'var(--lcars-gold)', flex: 1, justifyContent: 'center', fontSize: '18px', letterSpacing: '0.15em' }}>
            LCARS ACCESS
          </div>
          <div style={{ background: 'var(--lcars-orange)', width: '44px', borderRadius: '0 999px 999px 0', flexShrink: 0 }} />
        </div>
        <div style={{ height: '4px', background: 'var(--lcars-gray)', marginBottom: '16px', borderRadius: '2px' }} />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button className={`lcars-pill ${tab === 'login' ? 'lcars-pill-gold' : 'lcars-pill-ghost'}`} style={{ flex: 1 }} onClick={() => { setTab('login'); setError('') }}>
            → Login
          </button>
          <button className={`lcars-pill ${tab === 'register' ? 'lcars-pill-purple' : 'lcars-pill-ghost'}`} style={{ flex: 1 }} onClick={() => { setTab('register'); setError('') }}>
            + Register
          </button>
        </div>
        <div style={{ background: 'var(--lcars-panel)', border: '1px solid var(--lcars-gray)', borderRadius: '4px', padding: '24px' }}>
          {tab === 'login' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="lcars-label" style={{ marginBottom: '6px' }}>Starfleet ID</div>
                <input className="lcars-input" placeholder="EP-01061978-M" value={loginId} onChange={e => setLoginId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div className="lcars-label">Format: Initials – DDMMYYYY – Gender/Species</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div className="lcars-label" style={{ marginBottom: '6px' }}>First Name</div>
                  <input className="lcars-input" placeholder="Eugene" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="lcars-label" style={{ marginBottom: '6px' }}>Last Name</div>
                  <input className="lcars-input" placeholder="Petzer" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <div className="lcars-label" style={{ marginBottom: '6px' }}>Date of Birth</div>
                <input className="lcars-input" placeholder="DD-MM-YYYY" value={form.dob} maxLength={10}
                  onChange={e => {
                    let v = e.target.value.replace(/[^0-9]/g, '')
                    if (v.length > 2) v = v.slice(0,2) + '-' + v.slice(2)
                    if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5)
                    set('dob', v.slice(0,10))
                  }}
                />
              </div>
              <div>
                <div className="lcars-label" style={{ marginBottom: '6px' }}>Gender / Species</div>
                <select className="lcars-input" value={form.genderSpecies} onChange={e => set('genderSpecies', e.target.value)}>
                  {[['M','Male (M)'],['F','Female (F)'],['X','Non-Binary (X)'],['Vulcan','Vulcan'],['Klingon','Klingon'],['Bajoran','Bajoran'],['Betazoid','Betazoid'],['Andorian','Andorian'],['Hologram','Hologram'],['Android','Android'],['Other','Other']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              {previewId && (
                <div style={{ background: '#000', border: '1px solid var(--lcars-gold)', borderRadius: '4px', padding: '10px 14px' }}>
                  <div className="lcars-label" style={{ marginBottom: '4px' }}>Your Starfleet ID will be</div>
                  <div style={{ color: 'var(--lcars-gold)', fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em' }}>{previewId}</div>
                </div>
              )}
            </div>
          )}
          {error && <div style={{ marginTop: '12px', color: '#FF4444', fontSize: '13px', fontFamily: 'Antonio', letterSpacing: '0.05em' }}>⚠ {error}</div>}
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className={`lcars-pill ${tab === 'login' ? 'lcars-pill-gold' : 'lcars-pill-purple'}`} style={{ width: '100%', height: '44px', fontSize: '16px' }}
            onClick={tab === 'login' ? handleLogin : handleRegister}>
            {tab === 'login' ? 'AUTHORIZE ACCESS' : 'ENLIST IN STARFLEET'}
          </button>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '4px', height: '6px' }}>
          <div style={{ background: 'var(--lcars-gray)', flex: 3, borderRadius: '999px' }} />
          <div style={{ background: 'var(--lcars-purple)', flex: 2, borderRadius: '999px' }} />
          <div style={{ background: 'var(--lcars-orange)', flex: 1, borderRadius: '999px' }} />
        </div>
        <div className="lcars-label" style={{ textAlign: 'center', marginTop: '8px', color: 'var(--lcars-gray)' }}>LCARS VBLOG SYSTEM v1.0</div>
      </div>
    </div>
  )
}