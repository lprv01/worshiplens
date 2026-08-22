'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { NAVY, BLUE, LogoWhite, scoreColor } from '../../../lib/review-shared'

// Detail view for one guest submission. Reached from the notification email.
// Shows the stored analysis and lyrics so the admin can post it to the public
// library or decline it. Admin-password gated.
const PW_KEY = 'wl_admin_pw'

const LENS_LABELS: [string, string][] = [
  ['scriptural_fidelity', 'Scriptural fidelity'],
  ['theological_clarity', 'Theological clarity'],
  ['congregational_singability', 'Singability'],
  ['poetic_lyrical_quality', 'Poetic quality'],
  ['defense_brief', 'Defense brief'],
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .az-input { width: 100%; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; font-size: 13px; font-family: 'Sora', sans-serif; color: #fff; outline: none; transition: border-color 0.2s; }
  .az-input::placeholder { color: rgba(255,255,255,0.25); }
  .az-input:focus { border-color: rgba(255,255,255,0.3); }
  .az-btn { width: 100%; padding: 13px; border: none; border-radius: 8px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .az-btn:disabled { opacity: 0.4; cursor: default; }
`

export default function SubmissionDetailPage() {
  const params = useParams()
  const id = String((params as any)?.id || '')

  const [pw, setPw] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  const [sub, setSub] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [working, setWorking] = useState<'approve' | 'decline' | null>(null)
  const [confirmPost, setConfirmPost] = useState(false)
  const [result, setResult] = useState<{ type: 'approved' | 'declined'; slug?: string } | null>(null)

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
    if (!id) { setErr('Missing submission id.'); return }
    setLoading(true); setErr('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submission_get', password: pw, id }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((d as any).error || `Failed to load (${r.status})`)
      setSub((d as any).submission)
      if ((d as any).submission?.status === 'approved') setResult({ type: 'approved' })
      if ((d as any).submission?.status === 'declined') setResult({ type: 'declined' })
    } catch (e: any) {
      setErr(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (unlocked) load() }, [unlocked]) // eslint-disable-line react-hooks/exhaustive-deps

  async function act(kind: 'approve' | 'decline') {
    setWorking(kind); setErr('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: kind === 'approve' ? 'submission_approve' : 'submission_decline', password: pw, id }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((d as any).error || `Action failed (${r.status})`)
      if (kind === 'approve') setResult({ type: 'approved', slug: (d as any).slug })
      else setResult({ type: 'declined' })
    } catch (e: any) {
      setErr(e.message || 'Action failed')
    } finally {
      setWorking(null); setConfirmPost(false)
    }
  }

  // ── Password gate ──
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
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>Review Submission</h1>
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

  const review = sub?.review || null
  const meta = review?.meta || {}
  const paragraphs: string[] = review?.full_analysis?.paragraphs || []

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: NAVY, color: '#fff', minHeight: '100vh' }}>
      <style>{styles}</style>
      <nav style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50, background: NAVY }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68, maxWidth: 820, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}><LogoWhite height={44} /></Link>
          <Link href="/admin/submissions" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Queue</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 80px' }}>
        {loading && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Loading...</div>}
        {err && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#1a0505', border: '0.5px solid #f87171', borderRadius: 8, fontSize: 12, color: '#f87171' }}>{err}</div>}

        {sub && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>Submission</div>
                <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em' }}>{sub.title || 'Untitled song'}</h1>
                <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>{sub.artist || meta.artist || 'Unknown'}</p>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
                  From {sub.submitter_name || 'anonymous'}{sub.submitter_email ? ` · ${sub.submitter_email}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.04em', color: scoreColor(sub.overall_score || 0) }}>
                  {typeof sub.overall_score === 'number' ? sub.overall_score.toFixed(1) : '--'}
                </div>
                {review?.recommendation && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{review.recommendation}</div>}
              </div>
            </div>

            {/* Result banner */}
            {result && (
              <div style={{ marginBottom: 24, padding: '14px 16px', borderRadius: 10, fontSize: 13, lineHeight: 1.6,
                background: result.type === 'approved' ? '#052e16' : 'rgba(255,255,255,0.04)',
                border: `0.5px solid ${result.type === 'approved' ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                color: result.type === 'approved' ? '#22c55e' : 'rgba(255,255,255,0.6)' }}>
                {result.type === 'approved' ? (
                  <>
                    Posted to the library.{' '}
                    {result.slug && <Link href={`/songs/${result.slug}`} style={{ color: '#22c55e', textDecoration: 'underline' }}>View it →</Link>}
                  </>
                ) : (
                  'This submission was declined. Nothing was posted to the library.'
                )}
              </div>
            )}

            {/* Verdict */}
            {review?.overall_verdict && (
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>{review.overall_verdict}</p>
            )}

            {/* Lens scores */}
            {review?.lenses && (
              <div style={{ marginBottom: 24 }}>
                {LENS_LABELS.map(([key, label]) => {
                  const l = review.lenses[key] || {}
                  const s = typeof l.score === 'number' ? l.score : 0
                  const excluded = l.excluded
                  return (
                    <div key={key} style={{ padding: '12px 0', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: excluded ? 'rgba(255,255,255,0.3)' : scoreColor(s) }}>
                          {excluded ? 'n/a' : s.toFixed(1)}
                        </span>
                      </div>
                      {l.summary && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginTop: 5 }}>{l.summary}</div>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full analysis */}
            {paragraphs.filter(Boolean).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Full analysis</div>
                {paragraphs.filter(Boolean).map((p, i) => (
                  <p key={i} style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>{p}</p>
                ))}
              </div>
            )}

            {/* Submitted lyrics */}
            {sub.lyrics && (
              <details style={{ marginBottom: 28, border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
                <summary style={{ cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: BLUE, userSelect: 'none' }}>Submitted lyrics</summary>
                <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.55)' }}>{sub.lyrics}</pre>
              </details>
            )}

            {/* Actions */}
            {!result && (
              <div style={{ paddingTop: 20, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {!confirmPost ? (
                    <button
                      className="az-btn"
                      disabled={working !== null || !review}
                      onClick={() => setConfirmPost(true)}
                      title={review ? undefined : 'This submission has no stored analysis to publish.'}
                      style={{ flex: '1 1 240px', background: '#052e16', border: '0.5px solid #22c55e', color: '#22c55e' }}
                    >
                      Approve &amp; Post to Library
                    </button>
                  ) : (
                    <button
                      className="az-btn"
                      disabled={working !== null}
                      onClick={() => act('approve')}
                      style={{ flex: '1 1 240px', background: '#22c55e', border: '0.5px solid #22c55e', color: NAVY }}
                    >
                      {working === 'approve' ? 'Posting...' : 'Confirm — post it now'}
                    </button>
                  )}
                  <button
                    className="az-btn"
                    disabled={working !== null}
                    onClick={() => act('decline')}
                    style={{ flex: '1 1 160px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    {working === 'decline' ? 'Working...' : 'Do not post'}
                  </button>
                </div>
                {confirmPost && (
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
                    This publishes the song to the public library.{' '}
                    <button onClick={() => setConfirmPost(false)} style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontFamily: "'Sora', sans-serif", fontSize: 11.5, padding: 0 }}>Cancel</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
