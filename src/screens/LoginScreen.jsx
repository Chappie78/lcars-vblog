import React, { useState } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async () => {
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
    setLoading(true)
    try {
      const ref = doc(db, 'users', id)
      const snap = await getDoc(ref)
      if (snap.exists()) return setError('Starfleet ID already registered.')
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        genderSpecies: form.genderSpecies,
        starfleetId: id,
        logs: []
      }
      await setDoc(ref, userData)
      onLogin(userData)
    } catch (e) {
      setError('Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setError('')
    const id = loginId.trim().toUpperCase()
    setLoading(true)
    try {
      const ref = doc(db, 'users', id)
      const snap = await getDoc(ref)
      if (!snap.exists()) return setError('Starfleet ID not found. Please register first.')
      onLogin(snap.data())
    } catch (e) {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const previewId = form.firstName && form.lastName && form.dob.length === 10
    ? buildStarfleetID(form.firstName, form.lastName, form.dob.replace(/-/g, ''), form.genderSpecies)
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* LCARS Header Bar */}
        <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
          <div style={{ width: 60, background: '#f90', borderRadius: '32px 0 0 32px' }} />
          <div style={{ flex: 1, background: '#c66', padding: '10px 16px' }}>
            <div style={{ color: '#000', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>STARFLEET MEDICAL</div>
            <div style={{ color: '#000', fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>PERSONNEL ACCESS</div>
          </div>
          <div style={{ width: 16, background: '#99f', borderRadius: '0 8px 8px 0' }} />
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '10px 0', background: tab === t ? '#f90' : '#333',
              color: tab === t ? '#000' : '#f90', border: 'none', borderRadius: 6,
              fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase'
            }}>
              {t === 'login' ? 'Access Terminal' : 'New Enlistment'}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ background: '#111', border: '2px solid #f90', borderRadius: 8, padding: 28 }}>

          {tab === 'login' ? (
            <div>
              <div style={{ color: '#f90', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>STARFLEET ID</div>
              <input
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="e.g. JK-15031985-M"
                style={inputStyle}
              />
              <button onClick={handleLogin} disabled={loading} style={btnStyle('#f90')}>
                {loading ? 'ACCESSING...' : 'ACCESS SYSTEM'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>FIRST NAME</div>
                  <input value={form.firstName} onChange={e => set('firstName', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>LAST NAME</div>
                  <input value={form.lastName} onChange={e => set('lastName', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={labelStyle}>DATE OF BIRTH (DD-MM-YYYY)</div>
              <input
                value={form.dob}
                onChange={e => set('dob', e.target.value)}
                placeholder="23-03-1975"
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <div style={labelStyle}>GENDER / SPECIES CODE</div>
              <select value={form.genderSpecies} onChange={e => set('genderSpecies', e.target.value)} style={{ ...inputStyle, marginBottom: 16 }}>
                <option value="M">M — Male</option>
                <option value="F">F — Female</option>
                <option value="X">X — Non-binary / Other</option>
                <option value="V">V — Vulcan</option>
                <option value="K">K — Klingon</option>
                <option value="B">B — Betazoid</option>
                <option value="A">A — Andorian</option>
                <option value="T">T — Trill</option>
              </select>
              {previewId && (
                <div style={{ background: '#1a1a2e', border: '1px solid #555', borderRadius: 4, padding: '8px 12px', marginBottom: 16, color: '#99f', fontSize: 12, letterSpacing: 2 }}>
                  PREVIEW ID: <strong>{previewId}</strong>
                </div>
              )}
              <button onClick={handleRegister} disabled={loading} style={btnStyle('#99f')}>
                {loading ? 'REGISTERING...' : 'ENLIST IN STARFLEET'}
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#2a0000', border: '1px solid #c66', borderRadius: 4, color: '#f66', fontSize: 12, letterSpacing: 1 }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 16, color: '#444', fontSize: 10, letterSpacing: 2 }}>
          STARFLEET MEDICAL DATABASE — AUTHORISED PERSONNEL ONLY
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', background: '#000', border: '1px solid #555',
  borderRadius: 4, color: '#fff', fontFamily: "'Orbitron', sans-serif", fontSize: 12,
  letterSpacing: 1, marginBottom: 12, boxSizing: 'border-box', outline: 'none'
}

const labelStyle = { color: '#f90', fontSize: 10, letterSpacing: 2, marginBottom: 4 }

const btnStyle = (color) => ({
  width: '100%', padding: '12px 0', background: color, border: 'none', borderRadius: 6,
  color: '#000', fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 12,
  letterSpacing: 2, cursor: 'pointer', marginTop: 4
})