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

  // Keep the rest of your existing JSX return exactly as-is below here
  // Just add {loading && <p>Processing...</p>} somewhere visible if you want a loading indicator
}