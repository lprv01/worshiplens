'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NAVY, BLUE, LogoWhite, scoreColor } from '../../lib/review-shared'

// Hidden admin queue of guest song submissions awaiting approval. Reached from
// the notification email or directly. Password-gated with the admin password.
const PW_KEY = 'wl_admin_pw'

type Row = {
  id: string
  title: string
  artist: string | null
  overall_score: number | null
  submitter_name: string | null
  submitter_email: string | null
  status: string
  created_at: string
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .az-input { width: 100%; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; font-size: 13px; font-family: 'Sora', sans-serif; color: #fff; outline: none; transition: border-color 0.2s; }
  .az-input::placeholder { color: rgba(255,255,255,0.25); }
  .az-input:focus { border-color: rgba(255,255,255,0.3); }
  .az-btn { width: 100%; padding: 13px; border: none; border-radius: 8px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .sub-row { display: grid; grid-template-columns: 44px 1fr auto; gap: 14px; align-items: center; padding: 16px 18px; border: 0.5px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.02); text-decoration: none; transition: border-color 0.15s, background 0.15s; margin-bottom: 10px; }
  .sub-row:hover { border-color: rgba(0,181,255,0.4); background: rgba(0,181,255,0.04); }
`

export default function SubmissionsQueuePage() {
  const [pw, setPw] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showAll, setShowAll] = useState(false)

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
    setLoading(true); setErr('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submission_list', password: pw, status: showAll ? 'all' : 'pending' }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((d as any).error || `Failed to load (${r.status})`)
      setRows(Array.isArray((d as any).rows) ? (d as any).rows : [])
    } catch (e: any) {
      setErr(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (unlocked) load() }, [unlocked, showAll]) // eslint-disable-line react-hooks/exhaustive-deps

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
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>Submission Queue</h1>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68, maxWidth: 900, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}><LogoWhite height={44} /></Link>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE, border: `0.5px solid ${BLUE}`, padding: '3px 10px', borderRadius: 20 }}>Queue</span>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>Admin</div>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em' }}>Submission Queue</h1>
            <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Songs guests submitted for approval. Open one to review the analysis and post it or decline.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowAll(false)}
              style={{ padding: '7px 14px', borderRadius: 20, fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `0.5px solid ${!showAll ? BLUE : 'rgba(255,255,255,0.15)'}`, background: !showAll ? 'rgba(0,181,255,0.1)' : 'none', color: !showAll ? BLUE : 'rgba(255,255,255,0.5)' }}
            >Pending</button>
            <button
              onClick={() => setShowAll(true)}
              style={{ padding: '7px 14px', borderRadius: 20, fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `0.5px solid ${showAll ? BLUE : 'rgba(255,255,255,0.15)'}`, background: showAll ? 'rgba(0,181,255,0.1)' : 'none', color: showAll ? BLUE : 'rgba(255,255,255,0.5)' }}
            >All</button>
          </div>
        </div>

        {loading && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Loading...</div>}
        {err && <div style={{ padding: '10px 14px', background: '#1a0505', border: '0.5px solid #f87171', borderRadius: 8, fontSize: 12, color: '#f87171' }}>{err}</div>}

        {!loading && !err && rows.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center', border: '0.5px dashed rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {showAll ? 'No submissions yet.' : 'No pending submissions. You are all caught up.'}
          </div>
        )}

        {!loading && rows.map(r => (
          <Link key={r.id} href={`/admin/submissions/${r.id}`} className="sub-row">
            <div style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', color: scoreColor(r.overall_score || 0) }}>
              {typeof r.overall_score === 'number' ? r.overall_score.toFixed(1) : '--'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled song'}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {r.artist || 'Unknown'}
                {r.submitter_email ? ` · ${r.submitter_email}` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
                color: r.status === 'pending' ? BLUE : r.status === 'approved' ? '#22c55e' : 'rgba(255,255,255,0.4)',
                background: r.status === 'pending' ? 'rgba(0,181,255,0.12)' : r.status === 'approved' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
              }}>{r.status}</span>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>
                {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
