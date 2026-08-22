'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { NAVY, BLUE, LogoWhite } from '../../../lib/review-shared'

// Detail view for one access request. Reached from the notification email.
// Grant sends the branded welcome email (with the guest code) to the requester
// and marks the request granted; decline just marks it declined.
const PW_KEY = 'wl_admin_pw'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .az-input { width: 100%; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; font-size: 13px; font-family: 'Sora', sans-serif; color: #fff; outline: none; transition: border-color 0.2s; }
  .az-input::placeholder { color: rgba(255,255,255,0.25); }
  .az-input:focus { border-color: rgba(255,255,255,0.3); }
  .az-btn { width: 100%; padding: 13px; border: none; border-radius: 8px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .az-btn:disabled { opacity: 0.4; cursor: default; }
`

export default function AccessRequestDetailPage() {
  const params = useParams()
  const id = String((params as any)?.id || '')

  const [pw, setPw] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  const [rec, setRec] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [working, setWorking] = useState<'grant' | 'decline' | null>(null)
  const [result, setResult] = useState<{ type: 'granted' | 'declined'; emailed?: boolean; emailError?: string | null } | null>(null)

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
  }, [])

  async function load() {
    if (!id) { setErr('Missing request id.'); return }
    setLoading(true); setErr('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'access_get', password: pw, id }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((d as any).error || `Failed to load (${r.status})`)
      setRec((d as any).request)
      const st = (d as any).request?.status
      if (st === 'granted') setResult({ type: 'granted' })
      if (st === 'declined') setResult({ type: 'declined' })
    } catch (e: any) {
      setErr(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (unlocked) load() }, [unlocked]) // eslint-disable-line react-hooks/exhaustive-deps

  async function act(kind: 'grant' | 'decline') {
    setWorking(kind); setErr('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: kind === 'grant' ? 'access_grant' : 'access_decline', password: pw, id }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((d as any).error || `Action failed (${r.status})`)
      if (kind === 'grant') setResult({ type: 'granted', emailed: (d as any).emailed, emailError: (d as any).emailError })
      else setResult({ type: 'declined' })
    } catch (e: any) {
      setErr(e.message || 'Action failed')
    } finally {
      setWorking(null)
    }
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
          <Link href="/admin/access-requests" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>&larr; Requests</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 80px' }}>
        {loading && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Loading...</div>}
        {err && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#1a0505', border: '0.5px solid #f87171', borderRadius: 8, fontSize: 12, color: '#f87171' }}>{err}</div>}

        {rec && (
          <>
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>Access request</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em' }}>{rec.name || 'No name given'}</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                <a href={`mailto:${rec.email}`} style={{ color: BLUE, textDecoration: 'none' }}>{rec.email}</a>
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                Requested {rec.created_at ? new Date(rec.created_at).toLocaleString() : ''}
              </p>
            </div>

            {result && (
              <div style={{ marginBottom: 24, padding: '14px 16px', borderRadius: 10, fontSize: 13, lineHeight: 1.6,
                background: result.type === 'granted' ? '#052e16' : 'rgba(255,255,255,0.04)',
                border: `0.5px solid ${result.type === 'granted' ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                color: result.type === 'granted' ? '#22c55e' : 'rgba(255,255,255,0.6)' }}>
                {result.type === 'granted' ? (
                  <>
                    Access granted.{' '}
                    {result.emailed
                      ? 'The welcome email with the code was sent.'
                      : `The status was updated, but the welcome email did not send${result.emailError ? ` (${result.emailError})` : ''}. You may need to verify a sender domain in Resend, then re-grant.`}
                  </>
                ) : (
                  'This request was declined. No email was sent.'
                )}
              </div>
            )}

            {!result && (
              <div style={{ paddingTop: 4 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 18 }}>
                  Granting sends {rec.name || 'this person'} the branded welcome email with the access code and marks the request granted.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    className="az-btn"
                    disabled={working !== null}
                    onClick={() => act('grant')}
                    style={{ flex: '1 1 220px', background: '#052e16', border: '0.5px solid #22c55e', color: '#22c55e' }}
                  >
                    {working === 'grant' ? 'Granting...' : 'Grant access & send code'}
                  </button>
                  <button
                    className="az-btn"
                    disabled={working !== null}
                    onClick={() => act('decline')}
                    style={{ flex: '1 1 140px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    {working === 'decline' ? 'Working...' : 'Decline'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
