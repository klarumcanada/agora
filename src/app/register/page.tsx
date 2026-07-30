'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BRAND = {
  midnight: '#0D1B3E',
  navy: '#1A3266',
  electric: '#3B82F6',
  ice: '#DBEAFE',
}

type AccountType = 'individual' | 'corporation'
type Role = 'seller' | 'buyer'

function Logo() {
  return (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
      <svg width="38" height="26" viewBox="0 0 44 30" fill="none">
        <rect x="1" y="1" width="3.5" height="28" fill="white" />
        <path d="M4.5 15 L18 1" stroke="white" strokeWidth="3" strokeLinecap="square" />
        <path d="M4.5 15 L18 29" stroke="white" strokeWidth="3" strokeLinecap="square" />
        <line x1="18" y1="4" x2="34" y2="15" stroke="white" strokeWidth="0.75" opacity="0.4" />
        <line x1="18" y1="26" x2="34" y2="15" stroke="white" strokeWidth="0.75" opacity="0.4" />
        <circle cx="34" cy="15" r="7" fill={BRAND.electric} />
      </svg>
      <span style={{
        fontFamily: 'var(--font-serif), Georgia, serif',
        fontSize: '22px',
        fontWeight: 600,
        color: 'white',
        letterSpacing: '-0.02em',
      }}>
        klarum
      </span>
    </Link>
  )
}

function SelectCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string
  subtitle: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: selected ? '15px' : '16px',
        background: selected ? BRAND.ice : '#fff',
        border: selected ? `2px solid ${BRAND.electric}` : '1px solid #E2E6F0',
        borderRadius: '10px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all .15s',
      }}
    >
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'var(--font-sans), DM Sans, sans-serif',
        color: selected ? BRAND.navy : BRAND.midnight,
        marginBottom: '4px',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '12px',
        fontWeight: 300,
        fontFamily: 'var(--font-sans), DM Sans, sans-serif',
        color: selected ? BRAND.navy : '#94A3B8',
        lineHeight: 1.45,
      }}>
        {subtitle}
      </div>
    </button>
  )
}

function QuestionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '13px',
      fontWeight: 500,
      fontFamily: 'var(--font-sans), DM Sans, sans-serif',
      color: BRAND.midnight,
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'var(--font-sans), DM Sans, sans-serif',
        color: BRAND.midnight,
        marginBottom: '6px',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '11px 12px',
          fontSize: '14px',
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          borderRadius: '8px',
          border: focused ? `1.5px solid ${BRAND.electric}` : '1px solid #E2E6F0',
          background: 'white',
          color: BRAND.midnight,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color .15s',
        }}
      />
    </div>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const canContinue = accountType !== null && role !== null

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password || !accountType || !role) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, account_type: accountType, role },
      },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: BRAND.midnight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <Logo />

      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#fff',
        borderRadius: '16px',
        padding: '40px 48px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#94A3B8',
                fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                marginBottom: '10px',
              }}>
                Step 1 of 2
              </div>
              <h1 style={{
                fontFamily: 'var(--font-serif), Georgia, serif',
                fontSize: '26px',
                fontWeight: 600,
                color: BRAND.midnight,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                Create your account
              </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Q1 */}
              <div>
                <QuestionLabel>How would you like to register?</QuestionLabel>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <SelectCard
                    title="Individual Advisor"
                    subtitle="For licensed advisors registering personally"
                    selected={accountType === 'individual'}
                    onClick={() => setAccountType('individual')}
                  />
                  <SelectCard
                    title="Corporation"
                    subtitle="For incorporated advisors and firms"
                    selected={accountType === 'corporation'}
                    onClick={() => setAccountType('corporation')}
                  />
                </div>
              </div>

              {/* Q2 */}
              <div>
                <QuestionLabel>What are you looking to do?</QuestionLabel>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <SelectCard
                    title="Sell a book of business"
                    subtitle="You're planning to exit or reduce your practice"
                    selected={role === 'seller'}
                    onClick={() => setRole('seller')}
                  />
                  <SelectCard
                    title="Buy a book of business"
                    subtitle="You're looking to grow by acquiring a book"
                    selected={role === 'buyer'}
                    onClick={() => setRole('buyer')}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep(2)}
              style={{
                marginTop: '28px',
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                fontWeight: 500,
                fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                borderRadius: '8px',
                border: 'none',
                background: canContinue ? BRAND.electric : '#E5E7EB',
                color: canContinue ? '#fff' : '#9CA3AF',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                transition: 'background .15s',
              }}
            >
              Continue
            </button>

            <p style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '13px',
              fontFamily: 'var(--font-sans), DM Sans, sans-serif',
              color: '#94A3B8',
            }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: BRAND.electric, textDecoration: 'none', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && !done && (
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginBottom: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>

            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#94A3B8',
                fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                marginBottom: '10px',
              }}>
                Step 2 of 2
              </div>
              <h1 style={{
                fontFamily: 'var(--font-serif), Georgia, serif',
                fontSize: '26px',
                fontWeight: 600,
                color: BRAND.midnight,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                Your details
              </h1>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InputField
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Jane Smith"
                autoComplete="name"
              />
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

              {error && (
                <p style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                  color: '#EF4444',
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !name || !email || !password}
                style={{
                  marginTop: '4px',
                  width: '100%',
                  padding: '13px',
                  fontSize: '15px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                  borderRadius: '8px',
                  border: 'none',
                  background: loading || !name || !email || !password ? '#E5E7EB' : BRAND.electric,
                  color: loading || !name || !email || !password ? '#9CA3AF' : '#fff',
                  cursor: loading || !name || !email || !password ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </>
        )}

        {/* ── DONE ── */}
        {done && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: BRAND.ice,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke={BRAND.electric} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif), Georgia, serif',
              fontSize: '22px',
              fontWeight: 600,
              color: BRAND.midnight,
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}>
              Check your email
            </h2>
            <p style={{
              fontSize: '14px',
              fontWeight: 300,
              fontFamily: 'var(--font-sans), DM Sans, sans-serif',
              color: '#64748B',
              lineHeight: 1.6,
            }}>
              We sent a confirmation link to <strong style={{ fontWeight: 500, color: BRAND.midnight }}>{email}</strong>. Click it to activate your account.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
