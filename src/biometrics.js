const BASE = 'lcars-webauthn'

function b64encode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function b64decode(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

export function isBiometricsSupported() {
  return window.PublicKeyCredential !== undefined
}

export async function registerBiometric(starfleetId) {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = new TextEncoder().encode(starfleetId)

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Starfleet Medical', id: window.location.hostname },
      user: { id: userId, name: starfleetId, displayName: starfleetId },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000
    }
  })

  // Store credential ID linked to this Starfleet ID
  const stored = JSON.parse(localStorage.getItem(BASE) || '{}')
  stored[starfleetId] = b64encode(credential.rawId)
  localStorage.setItem(BASE, JSON.stringify(stored))
  return true
}

export async function authenticateBiometric(starfleetId) {
  const stored = JSON.parse(localStorage.getItem(BASE) || '{}')
  const credId = stored[starfleetId]
  if (!credId) return false

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: window.location.hostname,
      allowCredentials: [{
        type: 'public-key',
        id: b64decode(credId),
        transports: ['internal']
      }],
      userVerification: 'required',
      timeout: 60000
    }
  })

  return true
}

export function hasBiometricRegistered(starfleetId) {
  const stored = JSON.parse(localStorage.getItem(BASE) || '{}')
  return !!stored[starfleetId]
}

export function removeBiometric(starfleetId) {
  const stored = JSON.parse(localStorage.getItem(BASE) || '{}')
  delete stored[starfleetId]
  localStorage.setItem(BASE, JSON.stringify(stored))
}