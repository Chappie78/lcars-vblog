import React, { useState, useEffect } from 'react'
import LoginScreen from './screens/LoginScreen.jsx'
import Dashboard from './screens/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('lcars_user')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogin = (loggedInUser) => {
    sessionStorage.setItem('lcars_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('lcars_user')
    setUser(null)
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />
  return <Dashboard user={user} onLogout={handleLogout} />
}