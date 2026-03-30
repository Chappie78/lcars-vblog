import React, { useState } from 'react'

const TYPE_COLORS = { text: 'var(--lcars-gold)', video: 'var(--lcars-orange)', audio: 'var(--lcars-purple)' }
const TYPE_ICONS  = { text: '📝', video: '🎥', audio: '🎙' }

export default function LogCard({ log, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(log.createdAt).toLocaleString('en-GB')
  const color = TYPE_COLORS[log.type] || 'var(--lcars-gold)'

  return (
    <div style={{ background: 'var(--lcars-panel)', border: `1px solid ${color}33`, borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ background: `${color}22`, borderBottom: `1px solid ${color}44`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: '16px' }}>{TYPE_ICONS[log.type]}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Antonio', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color }}>
            {log.title || `${log.type.toUpperCase()} LOG`}
          </div>
          <div className="lcars-label">{date} · STARDATE {log.stardate}</div>
        </div>
        <div style={{ color, fontSize: '12px', fontFamily: 'Antonio' }}>{expanded ? '▲' : '▼'}</div>
        <button className="lcars-pill lcars-pill-danger" style={{ fontSize: '11px', padding: '3px 10px' }}
          onClick={e => { e.stopPropagation(); onDelete(log.id) }}>DEL</button>
      </div>
      {expanded && (
        <div style={{ padding: '16px' }}>
          {log.type === 'text' && <p style={{ fontFamily: 'Antonio', fontSize: '14px', lineHeight: 1.7, color: 'var(--lcars-white)', whiteSpace: 'pre-wrap' }}>{log.content}</p>}
          {log.type === 'video' && log.url && <video controls style={{ width: '100%', maxHeight: '360px', borderRadius: '4px', border: '1px solid var(--lcars-orange)' }} src={log.url} />}
          {log.type === 'audio' && log.url && <audio controls style={{ width: '100%' }} src={log.url} />}
          {log.notes && <p style={{ marginTop: '10px', fontFamily: 'Antonio', fontSize: '13px', color: 'var(--lcars-gray)', fontStyle: 'italic' }}>{log.notes}</p>}
        </div>
      )}
    </div>
  )
}