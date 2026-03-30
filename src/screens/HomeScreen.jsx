export default function HomeScreen({ user }) {
  const { avatar, division, rank, country, serviceSummary, commandTrack, performanceNotes, careerObjective } = user

  const stardate = () => {
    const now = new Date()
    const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
    return `${now.getFullYear() - 1900 + 21}${String(doy).padStart(3,'0')}.${String(now.getHours()).padStart(2,'0')}`
  }

  const Section = ({ title, value, color = 'var(--lcars-white)' }) => {
    if (!value) return null
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: 'Antonio', fontWeight: 700, fontSize: 11,
          color: 'var(--lcars-gold)', letterSpacing: '0.18em',
          textTransform: 'uppercase', marginBottom: 8,
          paddingBottom: 4, borderBottom: '1px solid var(--lcars-gray)'
        }}>
          {title}
        </div>
        <div style={{ fontFamily: 'Antonio', fontSize: 14, color, lineHeight: 1.7, letterSpacing: '0.03em', whiteSpace: 'pre-wrap' }}>
          {value}
        </div>
      </div>
    )
  }

  const hasBio = division || rank || serviceSummary || commandTrack || performanceNotes || careerObjective

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Personnel card */}
        <div style={{ background: 'var(--lcars-dgray)', border: '1px solid var(--lcars-gold)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: 36 }}>
            <div style={{ background: 'var(--lcars-purple)', width: 36 }} />
            <div style={{ background: 'var(--lcars-gold)', flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 14 }}>
              <span style={{ fontFamily: 'Antonio', fontWeight: 700, fontSize: 12, color: '#000', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Starfleet Personnel Record
              </span>
            </div>
            <div style={{ background: 'var(--lcars-orange)', width: 80 }} />
          </div>

          <div style={{ padding: 24, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{ width: 120, height: 140, flexShrink: 0, border: '2px solid var(--lcars-gold)', borderRadius: 4, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatar
                ? <img src={avatar} alt="personnel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 52 }}>👤</span>
              }
            </div>

            {/* Core details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="lcars-label" style={{ marginBottom: 3 }}>Name</div>
                <div style={{ fontFamily: 'Antonio', fontSize: 22, color: 'var(--lcars-white)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {rank && <span style={{ color: 'var(--lcars-orange)', fontSize: 15, marginRight: 10 }}>{rank}</span>}
                  {user.firstName} {user.lastName}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div className="lcars-label" style={{ marginBottom: 3 }}>Starfleet ID</div>
                  <div style={{ fontFamily: 'Antonio', fontSize: 14, color: 'var(--lcars-gold)' }}>{user.starfleetId}</div>
                </div>
                {division && (
                  <div>
                    <div className="lcars-label" style={{ marginBottom: 3 }}>Division</div>
                    <div style={{ fontFamily: 'Antonio', fontSize: 14, color: 'var(--lcars-lavender)' }}>{division}</div>
                  </div>
                )}
                {country && (
                  <div>
                    <div className="lcars-label" style={{ marginBottom: 3 }}>Country of Origin</div>
                    <div style={{ fontFamily: 'Antonio', fontSize: 14, color: 'var(--lcars-white)' }}>{country}</div>
                  </div>
                )}
                <div>
                  <div className="lcars-label" style={{ marginBottom: 3 }}>Current Stardate</div>
                  <div style={{ fontFamily: 'Antonio', fontSize: 14, color: 'var(--lcars-orange)' }}>{stardate()}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', height: 8 }}>
            <div style={{ background: 'var(--lcars-purple)', width: 36 }} />
            <div style={{ background: 'var(--lcars-gold)', flex: 1 }} />
            <div style={{ background: 'var(--lcars-orange)', width: 80 }} />
          </div>
        </div>

        {/* Bio card */}
        {hasBio ? (
          <div style={{ background: 'var(--lcars-dgray)', border: '1px solid var(--lcars-gray)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: 36 }}>
              <div style={{ background: 'var(--lcars-purple)', width: 36 }} />
              <div style={{ background: 'var(--lcars-lavender)', flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 14 }}>
                <span style={{ fontFamily: 'Antonio', fontWeight: 700, fontSize: 12, color: '#000', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Personnel Bio
                </span>
              </div>
              <div style={{ background: 'var(--lcars-purple)', width: 80 }} />
            </div>

            <div style={{ padding: 24 }}>
              <Section title="Division"          value={division}          color="var(--lcars-lavender)" />
              <Section title="Rank"              value={rank}              color="var(--lcars-orange)" />
              <Section title="Service Summary"   value={serviceSummary} />
              <Section title="Command Track"     value={commandTrack} />
              <Section title="Performance Notes" value={performanceNotes} />
              <Section title="Career Objective"  value={careerObjective}   color="var(--lcars-ltblue)" />
            </div>

            <div style={{ display: 'flex', height: 8 }}>
              <div style={{ background: 'var(--lcars-purple)', width: 36 }} />
              <div style={{ background: 'var(--lcars-lavender)', flex: 1 }} />
              <div style={{ background: 'var(--lcars-purple)', width: 80 }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.4, padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontFamily: 'Antonio', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No bio on file</div>
            <div className="lcars-label" style={{ marginTop: 4 }}>Complete your personnel record in Settings</div>
          </div>
        )}

      </div>
    </div>
  )
}