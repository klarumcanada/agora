'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import AgoraWordmark from '@/components/AgoraWordmark'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = typeof window === 'undefined'
    ? (null as unknown as ReturnType<typeof createBrowserClient>)
    : createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'confirmation_failed'
      ? 'That confirmation link is invalid or has expired. Please try signing in, or register again.'
      : null
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setSubmitting(false)
      if (signInError.message.toLowerCase().includes('not confirmed')) {
        setError("Please confirm your email before signing in — check your inbox for the confirmation link we sent when you registered.")
      } else {
        setError('Incorrect email or password.')
      }
      return
    }

    router.push('/marketplace')
  }

  return (
    <div style={{
      minHeight: '100vh', background: BRAND.midnight,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
    }}>
      <AgoraWordmark />

      <div style={{
        width: '100%', maxWidth: '400px', background: '#fff',
        borderRadius: '16px', padding: '40px 40px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif), Georgia, serif', fontStyle: 'italic', fontWeight: 400,
          fontSize: '26px', color: BRAND.midnight, letterSpacing: '-0.01em', marginBottom: '24px',
        }}>
          Sign in
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={{
                width: '100%', padding: '11px 14px', fontSize: '14px',
                fontFamily: 'var(--font-sans), DM Sans, sans-serif', borderRadius: '8px',
                border: '1px solid #E2E6F0', outline: 'none', boxSizing: 'border-box',
                color: BRAND.midnight,
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                width: '100%', padding: '11px 14px', fontSize: '14px',
                fontFamily: 'var(--font-sans), DM Sans, sans-serif', borderRadius: '8px',
                border: '1px solid #E2E6F0', outline: 'none', boxSizing: 'border-box',
                color: BRAND.midnight,
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: BRAND.danger, marginBottom: '18px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', lineHeight: 1.5 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '13px', fontSize: '15px', fontWeight: 700,
              fontFamily: 'var(--font-sans), DM Sans, sans-serif', borderRadius: '8px', border: 'none',
              background: submitting ? '#E5E7EB' : BRAND.meadow,
              color: submitting ? '#9CA3AF' : BRAND.midnight,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#94A3B8' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: BRAND.meadowText, textDecoration: 'none', fontWeight: 500 }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
