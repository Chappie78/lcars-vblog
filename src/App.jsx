import React, { useState, useEffect } from 'react'
import LoginScreen from './screens/LoginScreen.jsx'
import Dashboard from './screens/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('lcars_session')
    if (saved) {
      try {
        const sessionUser = JSON.parse(saved)
        const users = JSON.parse(localStorage.getItem('lcars_users') || '{}')
        if (users[sessionUser.starfleetId]) {
          setUser(users[sessionUser.starfleetId])
        }
      } catch {
        localStorage.removeItem('lcars_session')
      }
    }
  }, [])

  const handleLogin = (loggedInUser) => {
    localStorage.setItem('lcars_session', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('lcars_session')
    setUser(null)
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />
  return <Dashboard user={user} onLogout={handleLogout} />
}
