import { useState, useEffect } from 'react'

const WX_CODES = {
  0: 'CLEAR SKIES', 1: 'MOSTLY CLEAR', 2: 'PARTLY CLOUDY', 3: 'OVERCAST',
  45: 'FOG DETECTED', 48: 'RIME FOG', 51: 'LIGHT DRIZZLE', 53: 'DRIZZLE',
  55: 'HEAVY DRIZZLE', 61: 'LIGHT RAIN', 63: 'RAIN', 65: 'HEAVY RAIN',
  71: 'LIGHT SNOW', 73: 'SNOW', 75: 'HEAVY SNOW', 80: 'RAIN SHOWERS',
  81: 'SHOWERS', 82: 'HEAVY SHOWERS', 95: 'THUNDERSTORM', 99: 'HAIL STORM',
}

function stardate() {
  const now = new Date()
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  return `${now.getFullYear() - 1900 + 21}${String(doy).padStart(3, '0')}.${String(now.getHours()).padStart(2, '0')}`
}

async function geocodeCountry(country) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(country)}&format=json&limit=1`
  )
  const data = await res.json()
  if (!data.length) throw new Error('Not found')
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name }
}

async function fetchWeather(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`
  )
  return res.json()
}

export default function WeatherPanel({ user }) {
  const [data,     setData]     = useState(null)
  const [location, setLocation] = useState(null)
  const [time,     setTime]     = useState('')
  const [error,    setError]    = useState(false)

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const tz  = Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' })
        .formatToParts(now).find(p => p.type === 'timeZoneName')?.value || ''
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '  ' + tz)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  // Load weather whenever user's country changes
  useEffect(() => {
    const users   = JSON.parse(localStorage.getItem('lcars_users') || '{}')
    const country = users[user?.starfleetId]?.country || null

    if (!country) {
      // Fall back to browser geolocation
      if (!navigator.geolocation) { setError(true); return }
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude: lat, longitude: lon } }) => {
          try {
            const [wx, geo] = await Promise.all([
              fetchWeather(lat, lon),
              fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`).then(r => r.json())
            ])
            const city    = geo.address?.city || geo.address?.town || geo.address?.village || 'UNKNOWN'
            const cc      = geo.address?.country_code?.toUpperCase() || ''
            setLocation(`${city.toUpperCase()}, ${cc}`)
            setData({
              temp:      Math.round(wx.current_weather.temperature),
              wind:      Math.round(wx.current_weather.windspeed),
              condition: WX_CODES[wx.current_weather.weathercode] || 'UNKNOWN',
              humidity:  wx.hourly?.relativehumidity_2m?.[new Date().getHours()] ?? '--',
            })
          } catch { setError(true) }
        },
        () => setError(true)
      )
      return
    }

    // Use saved country
    setLocation(country.toUpperCase())
    setData(null)
    setError(false)
    geocodeCountry(country)
      .then(({ lat, lon }) => fetchWeather(lat, lon))
      .then(wx => {
        setData({
          temp:      Math.round(wx.current_weather.temperature),
          wind:      Math.round(wx.current_weather.windspeed),
          condition: WX_CODES[wx.current_weather.weathercode] || 'UNKNOWN',
          humidity:  wx.hourly?.relativehumidity_2m?.[new Date().getHours()] ?? '--',
        })
      })
      .catch(() => setError(true))
  }, [user?.starfleetId])

  const Row = ({ label, value, color }) => (
    <div style={{ marginBottom: 10 }}>
      <div className="lcars-label" style={{ fontSize: 9, marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'Antonio', fontSize: 13, color: color || 'var(--lcars-white)', letterSpacing: '0.05em' }}>{value}</div>
    </div>
  )

  return (
    <div style={{ border: '1px solid var(--lcars-gold)', borderRadius: 4, overflow: 'hidden', background: 'var(--lcars-dgray)' }}>
      <div style={{ background: 'var(--lcars-gold)', padding: '5px 10px' }}>
        <span style={{ fontFamily: 'Antonio', fontWeight: 700, fontSize: 10, color: '#000', letterSpacing: '0.1em' }}>
          PLANETARY CONDITIONS
        </span>
      </div>
      <div style={{ padding: '12px 10px' }}>
        <Row label="STARDATE"   value={stardate()}      color="var(--lcars-gold)" />
        <Row label="LOCAL TIME" value={time || '--:--'} color="var(--lcars-gold)" />
        <div style={{ height: 1, background: 'var(--lcars-gray)', margin: '8px 0' }} />
        <Row label="LOCATION"   value={location || 'NOT SET'} color={location ? 'var(--lcars-white)' : 'var(--lcars-gray)'} />
        {!location ? (
          <div className="lcars-label" style={{ marginTop: 4, fontSize: 9 }}>Set country in Settings</div>
        ) : data ? <>
          <Row label="TEMPERATURE" value={`${data.temp}°C`}    color="var(--lcars-orange)" />
          <Row label="CONDITIONS"  value={data.condition}      color="var(--lcars-white)" />
          <Row label="WIND"        value={`${data.wind} km/h`} color="var(--lcars-ltblue)" />
          <Row label="HUMIDITY"    value={`${data.humidity}%`} color="var(--lcars-ltblue)" />
        </> : !error ? (
          <div className="lcars-label lcars-blink" style={{ marginTop: 8 }}>ACQUIRING DATA...</div>
        ) : (
          <div className="lcars-label" style={{ marginTop: 8, color: '#FF4444' }}>SENSORS OFFLINE</div>
        )}
      </div>
    </div>
  )
}