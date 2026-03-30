import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  isBiometricsSupported,
  registerBiometric,
  authenticateBiometric,
  hasBiometricRegistered,
  removeBiometric
} from '../biometrics'

function buildStarfleetID(firstName, lastName, dobCompact, genderSpecies) {
  const initials =
    (firstName[0] || '').toUpperCase() + (lastName[0] || '').toUpperCase()
  return `${initials}-${dobCompact}-${genderSpecies}`
}

const DAYS = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, '0')
)
const MONTHS = [
  { value: '01', label: '01 — Jan' },
  { value: '02', label: '02 — Feb' },
  { value: '03', label: '03 — Mar' },
  { value: '04', label: '04 — Apr' },
  { value: '05', label: '05 — May' },
  { value: '06', label: '06 — Jun' },
  { value: '07', label: '07 — Jul' },
  { value: '08', label: '08 — Aug' },
  { value: '09', label: '09 — Sep' },
  { value: '10', label: '10 — Oct' },
  { value: '11', label: '11 — Nov' },
  { value: '12', label: '12 — Dec' }
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 120 }, (_, i) =>
  String(CURRENT_YEAR - i).padStart(4, '0')
)

export default function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    day: '',
    month: '',
    year: '',
    genderSpecies: 'M'
  })
  const [loginId, setLoginId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [savedIds, setSavedIds] = useState([])

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (isBiometricsSupported()) {
      setBiometricAvailable(true)
      const stored = JSON.parse(localStorage.getItem('lcars-webauthn') || '{}')
      setSavedIds(Object.keys(stored))
    }
  }, [])

  const getDobStrings = () => {
    const { day, month, year } = form
    if (!day || !month || !year) return { dobDisplay: '', dobCompact: '' }
    const dobDisplay = `${day}-${month}-${year}`
    const dobCompact = `${day}${month}${year}`
    return { dobDisplay, dobCompact }
  }

  const handleRegister = async () => {
    setError('')
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return setError('First and last name required.')
    }

    const { dobDisplay, dobCompact } = getDobStrings()
    if (!dobDisplay) return setError('Date of birth required.')

    // Validate date using JS Date to respect Apple HIG: no surprising rejections
    const dobIso = `${form.year}-${form.month}-${form.day}`
    const date = new Date(dobIso)
    if (
      isNaN(date) ||
      date.getDate() !== Number(form.day) ||
      date.getMonth() + 1 !== Number(form.month) ||
      date.getFullYear() !== Number(form.year)
    ) {
      return setError('Invalid date of birth.')
    }

    const id = buildStarfleetID(
      form.firstName,
      form.lastName,
      dobCompact,
      form.genderSpecies
    )

    setLoading(true)
    try {
      const ref = doc(db, 'users', id)
      const snap = await getDoc(ref)
      if (snap.exists()) return setError('Starfleet ID already registered.')
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: dobDisplay,
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
    if (!id) return setError('Please enter your Starfleet ID.')
    setLoading(true)
    try {
      const ref = doc(db, 'users', id)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        return setError('Starfleet ID not found. Please register first.')
      }
      const userData = snap.data()

      if (biometricAvailable && !hasBiometricRegistered(id)) {
        const offer = window.confirm(
          'Would you like to enable biometric login for this device?'
        )
        if (offer) {
          try {
            await registerBiometric(id)
            setSavedIds(prev => [...prev, id])
          } catch {
            // ignore
          }
        }
      }

      onLogin(userData)
    } catch (e) {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async id => {
    setError('')
    setLoading(true)
    try {
      const verified = await authenticateBiometric(id)
      if (!verified) return setError('Biometric verification failed.')
      const ref = doc(db, 'users', id)
      const snap = await getDoc(ref)
      if (!snap.exists()) return setError('Starfleet ID not found.')
      onLogin(snap.data())
    } catch (e) {
      setError('Biometric login failed. Use your Starfleet ID instead.')
    } finally {
      setLoading(false)
    }
  }

  const { dobDisplay, dobCompact } = getDobStrings()
  const previewId =
    form.firstName && form.lastName && dobCompact.length === 8
      ? buildStarfleetID(
          form.firstName,
          form.lastName,
          dobCompact,
          form.genderSpecies
        )
      : null

  return (
    <div
      className="lcars-page"
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 32,
        paddingBottom: 32,
        fontFamily: "'Orbitron', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480
        }}
      >
        {/* LCARS Header */}
        <div
          className="lcars-mobile-stack"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            marginBottom: 24,
            gap: 8
          }}
        >
          <div
            style={{
              width: 60,
              background: '#f90',
              borderRadius: '32px 0 0 32px',
              minHeight: 40
            }}
          />
          <div
            style={{
              flex: 1,
              background: '#c66',
              padding: '10px 16px',
              minWidth: 0
            }}
          >
            <div
              style={{
                color: '#000',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              STARFLEET MEDICAL
            </div>
            <div
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 3
              }}
            >
              PERSONNEL ACCESS
            </div>
          </div>
          <div
            className="lcars-mobile-hide"
            style={{ width: 16, background: '#99f', borderRadius: '0 8px 8px 0' }}
          />
        </div>

        {/* Biometric quick-login buttons */}
        {biometricAvailable && savedIds.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                color: '#f90',
                fontSize: 10,
                letterSpacing: 2,
                marginBottom: 8,
                textAlign: 'center'
              }}
            >
              BIOMETRIC ACCESS — THIS DEVICE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {savedIds.map(id => (
                <button
                  key={id}
                  onClick={() => handleBiometricLogin(id)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 12,
                    background: '#1a1a2e',
                    border: '1px solid #99f',
                    borderRadius: 6,
                    color: '#99f',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 12,
                    letterSpacing: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    touchAction: 'manipulation'
                  }}
                >
                  <span style={{ fontSize: 20 }}>🔐</span>
                  <span
                    style={{
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {id}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: '#333', margin: '16px 0' }} />
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setError('')
              }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: tab === t ? '#f90' : '#333',
                color: tab === t ? '#000' : '#f90',
                border: 'none',
                borderRadius: 6,
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 2,
                cursor: 'pointer',
                textTransform: 'uppercase',
                touchAction: 'manipulation'
              }}
            >
              {t === 'login' ? 'Access Terminal' : 'New Enlistment'}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div
          style={{
            background: '#111',
            border: '2px solid #f90',
            borderRadius: 8,
            padding: 20
          }}
        >
          {tab === 'login' ? (
            <div>
              <div style={labelStyle}>STARFLEET ID</div>
              <input
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="e.g. JK-15031985-M"
                style={inputStyle}
                inputMode="text"
                autoCapitalize="characters"
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                style={btnStyle('#f90')}
              >
                {loading ? 'ACCESSING...' : 'ACCESS SYSTEM'}
              </button>
            </div>
          ) : (
            <div>
              <div
                className="lcars-mobile-stack"
                style={{ display: 'flex', gap: 12, marginBottom: 12 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={labelStyle}>FIRST NAME</div>
                  <input
                    value={form.firstName}
                    onChange={e => setField('firstName', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={labelStyle}>LAST NAME</div>
                  <input
                    value={form.lastName}
                    onChange={e => setField('lastName', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* DOB with pickers — iOS-friendly */}
              <div style={labelStyle}>DATE OF BIRTH</div>
              <div
                className="lcars-mobile-stack"
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 12
                }}
              >
                <select
                  value={form.day}
                  onChange={e => setField('day', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Day</option>
                  {DAYS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={form.month}
                  onChange={e => setField('month', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Month</option>
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={form.year}
                  onChange={e => setField('year', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Year</option>
                  {YEARS.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div style={labelStyle}>GENDER / SPECIES CODE</div>
              <select
                value={form.genderSpecies}
                onChange={e => setField('genderSpecies', e.target.value)}
                style={{ ...inputStyle, marginBottom: 16 }}
              >
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
                <div
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #555',
                    borderRadius: 4,
                    padding: '8px 12px',
                    marginBottom: 16,
                    color: '#99f',
                    fontSize: 12,
                    letterSpacing: 2,
                    wordBreak: 'break-all'
                  }}
                >
                  PREVIEW DOB: {dobDisplay}
                  <br />
                  PREVIEW ID: <strong>{previewId}</strong>
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={loading}
                style={btnStyle('#99f')}
              >
                {loading ? 'REGISTERING...' : 'ENLIST IN STARFLEET'}
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: '#2a0000',
                border: '1px solid #c66',
                borderRadius: 4,
                color: '#f66',
                fontSize: 12,
                letterSpacing: 1
              }}
            >
              ⚠ {error}
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: 16,
            color: '#444',
            fontSize: 10,
            letterSpacing: 2
          }}
        >
          STARFLEET MEDICAL DATABASE — AUTHORISED PERSONNEL ONLY
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#000',
  border: '1px solid #555',
  borderRadius: 4,
  color: '#fff',
  fontFamily: "'Orbitron', sans-serif",
  fontSize: 12,
  letterSpacing: 1,
  marginBottom: 12,
  boxSizing: 'border-box',
  outline: 'none',
  minHeight: 44
}

const labelStyle = {
  color: '#f90',
  fontSize: 10,
  letterSpacing: 2,
  marginBottom: 4
}

const btnStyle = color => ({
  width: '100%',
  padding: '12px 0',
  background: color,
  border: 'none',
  borderRadius: 6,
  color: '#000',
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 2,
  cursor: 'pointer',
  marginTop: 4,
  touchAction: 'manipulation',
  minHeight: 44
})