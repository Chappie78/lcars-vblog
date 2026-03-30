import React, { useState, useRef } from 'react'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

function genStardate() {
  const now = new Date()
  const doy = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000)
  return `${(now.getFullYear()-1900+21)}${String(doy).padStart(3,'0')}.${String(now.getHours()).padStart(2,'0')}`
}

export default function NewLogModal({ type, user, onSave, onClose }) {
  const [title, setTitle]                 = useState(`${type.toUpperCase()} LOG — STARDATE ${genStardate()}`)
  const [content, setContent]             = useState('')
  const [notes, setNotes]                 = useState('')
  const [mediaUrl, setMediaUrl]           = useState(null)
  const [mediaBlob, setMediaBlob]         = useState(null)
  const [recording, setRecording]         = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [error, setError]                 = useState('')
  const [uploading, setUploading]         = useState(false)
  const fileInput    = useRef()
  const videoPreview = useRef()
  const chunks       = useRef([])

  const TYPE_COLOR = { text: 'var(--lcars-gold)', video: 'var(--lcars-orange)', audio: 'var(--lcars-purple)' }
  const color = TYPE_COLOR[type]

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setMediaBlob(file)
    setMediaUrl(URL.createObjectURL(file))
  }

  const startRecording = async () => {
    setError('')
    try {
      const constraints = type === 'video' ? { video: true, audio: true } : { audio: true }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (type === 'video' && videoPreview.current) {
        videoPreview.current.srcObject = stream
        videoPreview.current.play()
      }
      chunks.current = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = e => chunks.current.push(e.data)
      mr.onstop = () => {
        const mimeType = type === 'video' ? 'video/webm' : 'audio/webm'
        const blob = new Blob(chunks.current, { type: mimeType })
        setMediaBlob(blob)
        setMediaUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        if (videoPreview.current) videoPreview.current.srcObject = null
      }
      mr.start()
      setMediaRecorder(mr)
      setRecording(true)
    } catch {
      setError('Could not access microphone/camera. Please check permissions.')
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setRecording(false)
    setMediaRecorder(null)
  }

  const handleSave = async () => {
    if (type === 'text' && !content.trim()) return setError('Log content cannot be empty.')
    if ((type === 'video' || type === 'audio') && !mediaBlob) return setError('Please record or upload a file.')

    setUploading(true)
    setError('')
    try {
      let uploadedUrl = null

      if (mediaBlob) {
        const ext = type === 'video' ? 'webm' : 'webm'
        const path = `logs/${user.starfleetId}/${Date.now()}.${ext}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, mediaBlob)
        uploadedUrl = await getDownloadURL(storageRef)
      }

      onSave({
        type, title, content, notes,
        url: uploadedUrl,
        stardate: genStardate()
      })
      onClose()
    } catch (e) {
      console.error('Upload failed:', e)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
      <div style={{ background: 'var(--lcars-panel)', border: `1px solid ${color}`, borderRadius: '4px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: '44px', flexShrink: 0 }}>
          <div style={{ background: 'var(--lcars-purple)', width: '48px', borderRadius: '4px 0 0 0' }} />
          <div style={{ background: color, flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '16px', fontFamily: 'Antonio', fontWeight: 700, fontSize: '15px', color: '#000', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            New {type} Log Entry
          </div>
          <button onClick={onClose} style={{ background: '#CC2200', width: '44px', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: 'Antonio', fontWeight: 700, fontSize: '14px', borderRadius: '0 4px 0 0' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div>
            <div className="lcars-label" style={{ marginBottom: '6px' }}>Log Title</div>
            <input className="lcars-input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {type === 'text' ? (
            <div>
              <div className="lcars-label" style={{ marginBottom: '6px' }}>Log Entry</div>
              <textarea
                className="lcars-input"
                placeholder="Captain's log, Stardate..."
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ minHeight: '160px' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {type === 'video' && (
                <video ref={videoPreview} muted style={{ width: '100%', maxHeight: '200px', background: '#000', borderRadius: '4px', border: `1px solid ${color}44`, display: recording ? 'block' : 'none' }} />
              )}
              {mediaUrl && type === 'video' && !recording && (
                <video controls src={mediaUrl} style={{ width: '100%', maxHeight: '200px', borderRadius: '4px', border: `1px solid ${color}` }} />
              )}
              {mediaUrl && type === 'audio' && !recording && (
                <audio controls src={mediaUrl} style={{ width: '100%' }} />
              )}
              {mediaUrl && !recording && (
                <div style={{ color: 'var(--lcars-gold)', fontFamily: 'Antonio', fontSize: 12, letterSpacing: 1 }}>
                  ✓ File ready — will upload when you commit to log
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                {!recording
                  ? <button className={`lcars-pill ${type==='video' ? 'lcars-pill-orange' : 'lcars-pill-purple'}`} onClick={startRecording}>⏺ Record {type}</button>
                  : <button className="lcars-pill lcars-pill-danger lcars-blink" onClick={stopRecording}>⏹ Stop Recording</button>
                }
                <button className="lcars-pill lcars-pill-ghost" onClick={() => fileInput.current.click()}>📁 Upload File</button>
                <input ref={fileInput} type="file" accept={type==='video' ? 'video/*' : 'audio/*'} style={{ display: 'none' }} onChange={handleFile} />
              </div>
            </div>
          )}

          <div>
            <div className="lcars-label" style={{ marginBottom: '6px' }}>Supplemental Notes (optional)</div>
            <input className="lcars-input" placeholder="Additional observations..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {error && <div style={{ color: '#FF4444', fontFamily: 'Antonio', fontSize: '13px' }}>⚠ {error}</div>}
          {uploading && <div style={{ color: 'var(--lcars-gold)', fontFamily: 'Antonio', fontSize: '13px' }}>⏫ Uploading to Starfleet database...</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${color}44`, display: 'flex', gap: '8px', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="lcars-pill lcars-pill-ghost" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className={`lcars-pill ${type==='text' ? 'lcars-pill-gold' : type==='video' ? 'lcars-pill-orange' : 'lcars-pill-purple'}`} onClick={handleSave} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Commit to Log'}
          </button>
        </div>

      </div>
    </div>
  )
}