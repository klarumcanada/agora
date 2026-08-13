'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useRef, useState } from 'react'

export default function AgoraNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  const supabase = typeof window === 'undefined'
    ? (null as unknown as ReturnType<typeof createBrowserClient>)
    : createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    if (settingsOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [settingsOpen])

  async function handleSignOut() {
    setSettingsOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/marketplace', label: 'Marketplace', active: pathname.startsWith('/agora/marketplace') },
    { href: '/profile',     label: 'My Profile',  active: pathname.startsWith('/agora/profile') },
  ]

  return (
    <nav className="mga-nav">
      <div className="mga-nav-left">
        <Link href="/marketplace" className="mga-logo">
          <div className="mga-logo-parent">
            <svg width="22" height="22" viewBox="0 0 100 100" aria-hidden="true">
              <path d="M33 44 C33 20 67 20 67 44" fill="none" stroke="#F8F7F4" strokeWidth="7" />
              <path d="M20 44 H80 L70 84 H30 Z" fill="none" stroke="#F8F7F4" strokeWidth="7" strokeLinejoin="round" />
              <circle cx="70" cy="74" r="19" fill="oklch(80% 0.28 145)" />
              <text x="70" y="82" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="24" fill="#0D1B3E" textAnchor="middle">A</text>
            </svg>
            <span className="mga-logo-wordmark">agora</span>
          </div>
        </Link>
      </div>

      <div className="mga-nav-right">
        <div className="mga-nav-links">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`mga-nav-link${link.active ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div ref={settingsRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setSettingsOpen(o => !o)}
            className="mga-nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 7px', display: 'flex', alignItems: 'center' }}
            aria-label="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          {settingsOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: 'white', border: '1px solid #E2E6F0', borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(13,27,62,0.12)', minWidth: '148px',
              zIndex: 100, overflow: 'hidden',
            }}>
              <button
                onClick={handleSignOut}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '11px 16px', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px', fontWeight: 400, color: '#0D1B3E',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                Sign out
              </button>
              <div style={{
                padding: '9px 16px', borderTop: '1px solid #F3F4F6',
                fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#9CA3AF',
              }}>
                Powered by klarum<span style={{ color: '#3B82F6' }}>.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
