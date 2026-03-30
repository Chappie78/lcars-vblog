import React, { useState } from 'react'
import LoginScreen from './screens/LoginScreen.jsx'
import Dashboard from './screens/Dashboard.jsx'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />
  return <Dashboard user={user} onLogout={handleLogout} />
}