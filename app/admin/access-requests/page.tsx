'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NAVY, BLUE, LogoWhite } from '../../lib/review-shared'

// Stateless grant page. The requester's name/email arrive encoded in the ?g=
// link from the notification email (no database). Granting sends the branded
// welcome email and also shows a copy-to-send version as a fallback.
const PW_KEY = 'wl_admin_pw'
const GUEST_CODE = 'worshipguest'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .az-input { width: 100%; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; font-size: 13px; font-family: 'Sora', sans-serif; color: #fff; outline: none; transition: border-color 0.2s; }
  .az-input:focus { border-color: rgba(255,255,255,0.3); }
  .az-btn { width: 100%; padding: 13px; border: none; border-radius: 8px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .az-btn:disabled { opacity: 0.4; cursor: default; }
`

function decodeToken(raw: string): { name: string; email: string } | null {
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const o = JSON.parse(json)
    if (o && typeof o.e === 'string') return { name: String(o.n || ''), email: String(o.e) }
    return null
  } catch {
    return null
  }
}

export default function AccessGrantPage() {
  const [pw, setPw] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  const [req, setReq] = useState<{ name: string; email: string } | null>(null)
  const [noToken, setNoToken] = useState(false)

  const [working, setWorking] = useState<'grant' | 'decline' | null>(null)
  const [result, setResult] = useState<{ type: 'granted' | 'declined'; emailed?: boolean; emailError?: string | null } | null>(null)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  async function verify(candidate: string, silent = false) {
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', password: candidate }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && (d as any).role === 'admin') {
        setPw(candidate); setUnlocked(true); setPwError(false)
        if (typeof window !== 'undefined') sessionStorage.setItem(PW_KEY, candidate)
      } else {
        if (!silent) setPwError(true)
        if (silent && typeof window !== 'undefined') sessionStorage.removeItem(PW_KEY)
      }
    } catch {
      if (!silent) setPwError(true)
    }
  }

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(PW_KEY) : null
    if (cached) verify(cached, true)
    const g = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('g') : null
    if (g) {
      const decoded = decodeToken(g)
      if (decoded) setReq(decoded); else setNoToken(true)
    } else {
      setNoToken(true)
    }
  }, [])

  const welcomeText = req
    ? `Hi ${req.name || 'there'},\n\nThank you for requesting access to the WorshipLens Song Analyzer.\n\nWhat the Church sings shapes what it believes. WorshipLens exists on a simple conviction: to understand the songs we sing through a biblical lens, so leaders and songwriters can choose and write songs that faithfully reflect the truth of Scripture.\n\nYour access code for the Song Analyzer: ${GUEST_CODE}\nOpen it here: https://www.worshiplens.com/analyze\n\n- Ludwingk Rios\nWorship Leader, Musician, Editor\nworshiplens.com`
    : ''

  async function grant() {
    if (!req) return
    setWorking('grant'); setErr('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'access_grant', password: pw, name: req.name, email: req.email }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((d as any).error || `Failed (${r.status})`)
      setResult({ type: 'granted', emailed: (d as any).emailed, emailError: (d as any).emailError })
    } catch (e: any) {
      setErr(e.message || 'Failed to grant')
    } finally {
      setWorking(null)
    }
  }

  async function copyMsg() {
    try { await navigator.clipboard.writeText(welcomeText); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* ignore */ }
  }

  if (!unlocked) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: NAVY, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style>{styles}</style>
        <nav style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><LogoWhite height={44} /></Link>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>Admin</div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>Access Request</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>Enter the admin password.</p>
            </div>
            <input
              type="password" className="az-input" placeholder="Password"
              value={pwInput} onChange={e => setPwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verify(pwInput.trim())}
              style={{ marginBottom: 10, textAlign: 'center', fontSize: 16, letterSpacing: '0.1em' }}
            />
            {pwError && <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginBottom: 10 }}>Incorrect password.</div>}
            <button className="az-btn" onClick={() => verify(pwInput.trim())} style={{ background: BLUE, color: NAVY }}>Unlock</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: NAVY, color: '#fff', minHeight: '100vh' }}>
      <style>{styles}</style>
      <nav style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50, background: NAVY }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68, maxWidth: 640, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}><LogoWhite height={44} /></Link>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE, border: `0.5px solid ${BLUE}`, padding: '3px 10px', borderRadius: 20 }}>Access</span>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 80px' }}>
        {noToken && !req && (
          <div style={{ padding: '40px 24px', textAlign: 'center', border: '0.5px dashed rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Access requests arrive by email. Open the <b style={{ color: '#fff' }}>Grant access</b> link in the notification to review and grant a request.
          </div>
        )}

        {req && (
          <>
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>Access request</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em' }}>{req.name || 'No name given'}</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                <a href={`mailto:${req.email}`} style={{ color: BLUE, textDecoration: 'none' }}>{req.email}</a>
              </p>
            </div>

            {err && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#1a0505', border: '0.5px solid #f87171', borderRadius: 8, fontSize: 12, color: '#f87171' }}>{err}</div>}

            {result?.type === 'granted' && (
              <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 10, fontSize: 13, lineHeight: 1.6, background: '#052e16', border: '0.5px solid #22c55e', color: '#22c55e' }}>
                {result.emailed
                  ? `Welcome email sent to ${req.email} with the code.`
                  : `Marked granted, but the auto-email did not send${result.emailError ? ` (${result.emailError})` : ''}. Copy the message below and send it yourself.`}
              </div>
            )}
            {result?.type === 'declined' && (
              <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                Declined. Nothing was sent.
              </div>
            )}

            {!result && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 26 }}>
                <button className="az-btn" disabled={working !== null} onClick={grant} style={{ flex: '1 1 220px', background: '#052e16', border: '0.5px solid #22c55e', color: '#22c55e' }}>
                  {working === 'grant' ? 'Sending...' : 'Grant access & send code'}
                </button>
                <button className="az-btn" disabled={working !== null} onClick={() => setResult({ type: 'declined' })} style={{ flex: '1 1 140px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.7)' }}>
                  Decline
                </button>
              </div>
            )}

            {result?.type !== 'declined' && (
              <div style={{ border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 18px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Or send it yourself</div>
                  <button onClick={copyMsg} style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 600, color: copied ? '#4ade80' : BLUE, background: 'none', border: `0.5px solid ${copied ? '#4ade80' : 'rgba(0,181,255,0.4)'}`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                    {copied ? 'Copied' : 'Copy message'}
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{welcomeText}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
