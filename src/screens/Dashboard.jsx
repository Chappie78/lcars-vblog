import { useState, useEffect } from 'react'
import NewLogModal from '../components/NewLogModal.jsx'
import LogCard from '../components/LogCard.jsx'
import LcarsButton from '../components/LcarsButton.jsx'
import WeatherPanel from '../components/WeatherPanel.jsx'
import SettingsModal from '../components/SettingsModal.jsx'
import HomeScreen from './HomeScreen.jsx'
import { db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export default function Dashboard({ user, onLogout }) {
  const [logs, setLogs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('text')
  const [filter, setFilter] = useState('all')
  const [showSettings, setShowSettings] = useState(false)
  const [page, setPage] = useState('home')
  const [userProfile, setUserProfile] = useState(user)

  useEffect(() => {
    const fetchLogs = async () => {
      const snap = await getDoc(doc(db, 'users', user.starfleetId))
      if (snap.exists()) {
        const data = snap.data()
        setLogs(data.logs || [])
        setUserProfile(data)
      }
    }
    fetchLogs()
  }, [user.starfleetId])

  const saveLogs = async updated => {
    await updateDoc(doc(db, 'users', user.starfleetId), { logs: updated })
    setLogs(updated)
  }

  const addLog = log =>
    saveLogs([{ ...log, id: Date.now(), createdAt: new Date().toISOString() }, ...logs])
  const deleteLog = id => saveLogs(logs.filter(l => l.id !== id))
  const openModal = type => {
    setModalType(type)
    setShowModal(true)
  }

  const filteredLogs =
    filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const stardate = () => {
    const now = new Date()
    const doy = Math.floor(
      (now - new Date(now.getFullYear(), 0, 0)) / 86400000
    )
    return `${now.getFullYear() - 1900 + 21}${String(doy).padStart(
      3,
      '0'
    )}.${String(now.getHours()).padStart(2, '0')}`
  }

  const NavBtn = ({ label, bg, color = '#000', onClick, active }) => (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--lcars-white)' : bg,
        border: 'none',
        cursor: 'pointer',
        padding: '8px 12px',
        fontFamily: 'Antonio',
        fontWeight: 700,
        fontSize: 13,
        color: active ? '#000' : color,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderLeft: '3px solid #000',
        transition: 'filter 0.15s',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
      onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* TOP HEADER */}
      <div
        className="lcars-page"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          minHeight: 56,
          flexShrink: 0,
          paddingLeft: 0,
          paddingRight: 0
        }}
      >
        <div
          style={{
            background: 'var(--lcars-purple)',
            width: 56,
            flexShrink: 0,
            minHeight: 56
          }}
        />
        <div
          style={{
            background: 'var(--lcars-gold)',
            flex: 1,
            minWidth: 160,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 12px'
          }}
        >
          <span
            style={{
              fontFamily: 'Antonio',
              fontWeight: 700,
              fontSize: 16,
              color: '#000',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            Personal Log — {userProfile.firstName} {userProfile.lastName}
          </span>
        </div>
        <div
          style={{
            background: 'var(--lcars-gold)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            borderLeft: '3px solid #000',
            flexShrink: 0
          }}
        >
          <span
            style={{
              fontFamily: 'Antonio',
              fontSize: 12,
              color: '#000',
              fontWeight: 600,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap'
            }}
          >
            STARDATE {stardate()}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexShrink: 0,
            flexWrap: 'wrap'
          }}
        >
          <NavBtn
            label="Home"
            bg="var(--lcars-lavender)"
            active={page === 'home'}
            onClick={() => setPage('home')}
          />
          <NavBtn
            label="Settings"
            bg="var(--lcars-orange)"
            onClick={() => setShowSettings(true)}
          />
          <NavBtn
            label="Logout"
            bg="#CC2200"
            color="#fff"
            onClick={onLogout}
          />
        </div>
      </div>

      {/* Decorative sub-bar */}
      <div
        className="lcars-page"
        style={{
          display: 'flex',
          height: 8,
          flexShrink: 0,
          paddingLeft: 0,
          paddingRight: 0
        }}
      >
        <div style={{ background: 'var(--lcars-purple)', width: 56 }} />
        <div style={{ background: 'var(--lcars-gold)', flex: 1 }} />
        <div
          className="lcars-mobile-hide"
          style={{ background: 'var(--lcars-lavender)', width: 100 }}
        />
        <div
          className="lcars-mobile-hide"
          style={{ background: 'var(--lcars-orange)', width: 100 }}
        />
        <div
          className="lcars-mobile-hide"
          style={{ background: '#CC2200', width: 80 }}
        />
      </div>

      {/* ID bar */}
      <div
        className="lcars-page"
        style={{
          background: 'var(--lcars-dgray)',
          borderBottom: '1px solid var(--lcars-gray)',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}
      >
        <span className="lcars-label" style={{ fontSize: 10 }}>
          STARFLEET ID:{' '}
          <span style={{ color: 'var(--lcars-gold)' }}>
            {userProfile.starfleetId}
          </span>
        </span>
      </div>

      {/* BODY */}
      <div
        className="lcars-page"
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          paddingTop: 8,
          paddingBottom: 8,
          gap: 8
        }}
      >
        {/* Left spine — decorative, hidden on mobile */}
        <div
          className="lcars-mobile-hide"
          style={{ width: 36, background: 'var(--lcars-purple)', flexShrink: 0 }}
        />

        {/* MAIN CONTENT WRAPPER (sidebar + main content) */}
        <div
          className="lcars-mobile-stack"
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            gap: 8
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: 220,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              paddingTop: 8,
              paddingRight: 8,
              gap: 10
            }}
          >
            <div
              className="lcars-label"
              style={{
                color: 'var(--lcars-gold)',
                paddingLeft: 4,
                marginBottom: 2
              }}
            >
              New Log Entry
            </div>
            <LcarsButton
              color="gold"
              label="Text Log"
              onClick={() => {
                openModal('text')
                setPage('logs')
              }}
            />
            <LcarsButton
              color="orange"
              label="Video Log"
              onClick={() => {
                openModal('video')
                setPage('logs')
              }}
            />
            <LcarsButton
              color="purple"
              label="Audio Log"
              onClick={() => {
                openModal('audio')
                setPage('logs')
              }}
            />

            <div
              style={{
                height: 1,
                background: 'var(--lcars-gray)',
                margin: '4px 0'
              }}
            />

            <div
              className="lcars-label"
              style={{ color: 'var(--lcars-gold)', paddingLeft: 4 }}
            >
              Stats
            </div>
            <LcarsButton
              color={filter === 'all' ? 'gold' : 'ghost'}
              size="sm"
              label={`Total   ${logs.length}`}
              onClick={() => {
                setFilter('all')
                setPage('logs')
              }}
            />
            <LcarsButton
              color={filter === 'text' ? 'gold' : 'ghost'}
              size="sm"
              label={`Text    ${logs.filter(l => l.type === 'text').length}`}
              onClick={() => {
                setFilter('text')
                setPage('logs')
              }}
            />
            <LcarsButton
              color={filter === 'video' ? 'orange' : 'ghost'}
              size="sm"
              label={`Video   ${logs.filter(l => l.type === 'video').length}`}
              onClick={() => {
                setFilter('video')
                setPage('logs')
              }}
            />
            <LcarsButton
              color={filter === 'audio' ? 'purple' : 'ghost'}
              size="sm"
              label={`Audio   ${logs.filter(l => l.type === 'audio').length}`}
              onClick={() => {
                setFilter('audio')
                setPage('logs')
              }}
            />

            <div
              style={{
                height: 1,
                background: 'var(--lcars-gray)',
                margin: '4px 0'
              }}
            />

            <div
              className="lcars-label"
              style={{ color: 'var(--lcars-gold)', paddingLeft: 4 }}
            >
              Location
            </div>
            <WeatherPanel user={userProfile} />
          </div>

          {/* Main content area */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              background: 'var(--lcars-panel)',
              borderRadius: 4,
              border: '1px solid var(--lcars-gray)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {page === 'home' ? (
              <HomeScreen user={userProfile} />
            ) : (
              <div style={{ padding: 16 }}>
                {filteredLogs.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '50vh',
                      gap: 12,
                      opacity: 0.5,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 48 }}>📡</div>
                    <div
                      style={{
                        fontFamily: 'Antonio',
                        fontSize: 16,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                      }}
                    >
                      {filter === 'all'
                        ? 'No log entries found'
                        : `No ${filter} logs found`}
                    </div>
                    <div
                      className="lcars-label"
                      style={{ textAlign: 'center' }}
                    >
                      {filter === 'all'
                        ? 'Begin your first log using the panel above'
                        : 'Switch filter to see other log types'}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    {filteredLogs.map(log => (
                      <LogCard key={log.id} log={log} onDelete={deleteLog} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right accent column — decorative */}
        <div
          className="lcars-mobile-hide"
          style={{
            width: 12,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              flex: 2,
              background: 'var(--lcars-gold)',
              borderRadius: '4px 4px 0 0'
            }}
          />
          <div style={{ height: 4 }} />
          <div style={{ flex: 2, background: 'var(--lcars-purple)' }} />
          <div style={{ height: 4 }} />
          <div
            style={{
              flex: 1,
              background: 'var(--lcars-orange)',
              borderRadius: '0 0 4px 4px'
            }}
          />
        </div>
      </div>

      {showModal && (
        <NewLogModal
          type={modalType}
          user={userProfile}
          onSave={addLog}
          onClose={() => setShowModal(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          user={userProfile}
          onSave={updated => setUserProfile(updated)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}