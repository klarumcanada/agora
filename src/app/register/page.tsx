'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SPECIALTIES, CARRIERS, PROVINCES, PROVINCE_LABELS, TIMELINES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const BRAND = {
  midnight: '#0D1B3E',
  navy: '#1A3266',
  electric: '#3B82F6',
  ice: '#DBEAFE',
}

type AccountType = 'individual' | 'corporation'
type Role = 'seller' | 'buyer'

// ── Shared UI components ───────────────────────────────────────────

function Field({ label, hint, required, children }: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          color: BRAND.midnight,
          marginBottom: '7px',
          letterSpacing: '0.01em',
        }}>
          {label}
          {required && <span style={{ color: '#DC2626', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      {hint && (
        <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'var(--font-sans), DM Sans, sans-serif', marginBottom: '7px', marginTop: '-3px' }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', autoComplete, prefix }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoComplete?: string
  prefix?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '14px', color: '#94A3B8',
          fontFamily: 'var(--font-sans), DM Sans, sans-serif', pointerEvents: 'none',
        }}>
          {prefix}
        </span>
      )}
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
          padding: prefix ? '11px 12px 11px 26px' : '11px 12px',
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

function SelectInput({ value, onChange, children }: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
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
        appearance: 'auto',
        boxSizing: 'border-box',
        transition: 'border-color .15s',
      }}
    >
      {children}
    </select>
  )
}

function MultiSelect({ options, selected, onToggle, placeholder }: {
  options: readonly string[]
  selected: string[]
  onToggle: (v: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  const triggerLabel = selected.length === 0
    ? placeholder
    : selected.length === 1
    ? selected[0]
    : `${selected.length} selected`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '11px 14px',
          fontSize: '14px',
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          borderRadius: open ? '8px 8px 0 0' : '8px',
          border: open ? `1.5px solid ${BRAND.electric}` : '1px solid #E2E6F0',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'border-color .15s',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ color: selected.length === 0 ? '#94A3B8' : BRAND.midnight }}>{triggerLabel}</span>
        <span style={{ fontSize: '10px', color: '#94A3B8' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white',
          border: `1.5px solid ${BRAND.electric}`,
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          zIndex: 50,
          maxHeight: '220px',
          overflowY: 'auto',
        }}>
          {options.map(opt => {
            const active = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: active ? '#EFF6FF' : 'white',
                  border: 'none',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background .1s',
                }}
              >
                <span style={{
                  width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                  border: active ? `2px solid ${BRAND.electric}` : '1.5px solid #CBD5E1',
                  background: active ? BRAND.electric : 'white',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .1s',
                }}>
                  {active && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: '14px', color: BRAND.midnight, fontFamily: 'var(--font-sans), DM Sans, sans-serif' }}>
                  {opt}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {selected.map(s => (
            <span key={s} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px 10px', fontSize: '12px',
              fontFamily: 'var(--font-sans), DM Sans, sans-serif',
              borderRadius: '20px',
              background: BRAND.ice, color: BRAND.navy,
              border: `1px solid ${BRAND.electric}`, fontWeight: 500,
            }}>
              {s}
              <button
                type="button"
                onClick={() => onToggle(s)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0 0 0 5px', color: BRAND.electric, fontSize: '14px', lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function TimelineChips({ selected, onSelect }: {
  selected: string
  onSelect: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {TIMELINES.map(t => {
        const active = selected === t
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(active ? '' : t)}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans), DM Sans, sans-serif',
              borderRadius: '8px',
              border: active ? `2px solid ${BRAND.electric}` : '1px solid #E2E6F0',
              background: active ? BRAND.ice : 'white',
              color: active ? BRAND.navy : '#64748B',
              cursor: 'pointer',
              fontWeight: active ? 500 : 400,
              transition: 'all .15s',
            }}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '28px 0 24px',
    }}>
      <div style={{ flex: 1, height: '1px', background: '#E2E6F0' }} />
      <span style={{
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#94A3B8',
        fontFamily: 'var(--font-sans), DM Sans, sans-serif',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#E2E6F0' }} />
    </div>
  )
}

// ── Step 1 card select ─────────────────────────────────────────────

function RadioOption({ name, value, label, description, checked, onChange }: {
  name: string
  value: string
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label style={{ display: 'flex', gap: '12px', padding: '12px 0', cursor: 'pointer' }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <div style={{
        marginTop: '2px',
        flexShrink: 0,
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        border: checked ? `2px solid ${BRAND.electric}` : '1.5px solid #CBD5E1',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color .15s',
      }}>
        {checked && (
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: BRAND.electric,
          }} />
        )}
      </div>
      <div>
        <div style={{
          fontSize: '14px',
          fontWeight: checked ? 500 : 400,
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          color: BRAND.midnight,
          marginBottom: '3px',
          transition: 'font-weight .15s',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '13px',
          fontWeight: 300,
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          color: '#94A3B8',
          lineHeight: 1.45,
        }}>
          {description}
        </div>
      </div>
    </label>
  )
}

// ── Logo ───────────────────────────────────────────────────────────

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

// ── Step indicator ─────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
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
        Step {step} of 2
      </div>
      <h1 style={{
        fontFamily: 'var(--font-serif), Georgia, serif',
        fontSize: '26px',
        fontWeight: 600,
        color: BRAND.midnight,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        margin: 0,
      }}>
        {step === 1 ? 'Create your account' : 'Your profile'}
      </h1>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [q2Visible, setQ2Visible] = useState(false)

  useEffect(() => {
    if (accountType !== null && !q2Visible) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setQ2Visible(true))
      )
      return () => cancelAnimationFrame(id)
    }
  }, [accountType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2 — basic
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')

  // Step 2 — seller
  const [aum, setAum] = useState('')
  const [clientCount, setClientCount] = useState('')
  const [yearsInBusiness, setYearsInBusiness] = useState('')
  const [carrierMix, setCarrierMix] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [exitTimeline, setExitTimeline] = useState('')

  // Step 2 — buyer
  const [acquisitionBudget, setAcquisitionBudget] = useState('')
  const [growthStage, setGrowthStage] = useState('')
  const [targetGeography, setTargetGeography] = useState<string[]>([])
  const [targetSpecializations, setTargetSpecializations] = useState<string[]>([])
  const [acquisitionTimeline, setAcquisitionTimeline] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false) // briefly true while router navigates

  function toggleItem(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  const canContinue = accountType !== null && role !== null

  const step2Valid = name.trim() && email.trim() && password.length >= 8 && phone.trim() && city.trim() && province

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!step2Valid || !accountType || !role) return
    setError(null)
    setSubmitting(true)

    const payload = {
      account_type: accountType,
      role,
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      city: city.trim(),
      province,
      // seller
      aum: aum ? Number(aum) : null,
      client_count: clientCount ? Number(clientCount) : null,
      years_in_business: yearsInBusiness ? Number(yearsInBusiness) : null,
      carrier_mix: carrierMix.length ? carrierMix : null,
      specializations: specializations.length ? specializations : null,
      exit_timeline: exitTimeline || null,
      // buyer
      acquisition_budget: acquisitionBudget ? Number(acquisitionBudget) : null,
      growth_stage: growthStage || null,
      target_geography: targetGeography.length ? targetGeography : null,
      target_specializations: targetSpecializations.length ? targetSpecializations : null,
      acquisition_timeline: acquisitionTimeline || null,
    }

    const res = await fetch('/agora/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    setDone(true)
    router.push('/register/success')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: BRAND.midnight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '48px',
      paddingBottom: '64px',
      paddingLeft: '24px',
      paddingRight: '24px',
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
            <StepIndicator step={1} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <div style={{
                  fontSize: '13px', fontWeight: 500,
                  fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                  color: BRAND.midnight, marginBottom: '4px',
                }}>
                  How would you like to register?
                </div>
                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px' }}>
                  <RadioOption
                    name="account_type"
                    value="individual"
                    label="Individual Advisor"
                    description="For licensed advisors registering personally"
                    checked={accountType === 'individual'}
                    onChange={() => setAccountType('individual')}
                  />
                  <div style={{ borderTop: '1px solid #F1F5F9' }}>
                    <RadioOption
                      name="account_type"
                      value="corporation"
                      label="Corporation"
                      description="For incorporated advisors and firms"
                      checked={accountType === 'corporation'}
                      onChange={() => setAccountType('corporation')}
                    />
                  </div>
                </div>
              </div>

              {accountType !== null && (
                <div style={{
                  opacity: q2Visible ? 1 : 0,
                  transform: q2Visible ? 'none' : 'translateY(8px)',
                  transition: 'opacity 0.25s ease, transform 0.25s ease',
                }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 500,
                    fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                    color: BRAND.midnight, marginBottom: '4px',
                  }}>
                    What are you looking to do?
                  </div>
                  <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px' }}>
                    <RadioOption
                      name="role"
                      value="seller"
                      label="Sell a book of business"
                      description="You're planning to exit or reduce your practice"
                      checked={role === 'seller'}
                      onChange={() => setRole('seller')}
                    />
                    <div style={{ borderTop: '1px solid #F1F5F9' }}>
                      <RadioOption
                        name="role"
                        value="buyer"
                        label="Buy a book of business"
                        description="You're looking to grow by acquiring a book"
                        checked={role === 'buyer'}
                        onChange={() => setRole('buyer')}
                      />
                    </div>
                  </div>
                </div>
              )}
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
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none', padding: 0,
                marginBottom: '20px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px',
                fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                color: '#94A3B8', cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>

            <StepIndicator step={2} />

            {/* ── Basic profile ── */}
            <Field label="Full name" required>
              <TextInput value={name} onChange={setName} placeholder="Jane Smith" autoComplete="name" />
            </Field>

            <Field label="Email" required>
              <TextInput value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoComplete="email" />
            </Field>

            <Field label="Password" required hint="Minimum 8 characters">
              <TextInput value={password} onChange={setPassword} type="password" placeholder="••••••••" autoComplete="new-password" />
            </Field>

            <Field label="Phone" required>
              <TextInput value={phone} onChange={setPhone} type="tel" placeholder="6475551234" autoComplete="tel" />
            </Field>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <Field label="City" required>
                  <TextInput value={city} onChange={setCity} placeholder="Toronto" autoComplete="address-level2" />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Province" required>
                  <SelectInput value={province} onChange={setProvince}>
                    <option value="">Select…</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{PROVINCE_LABELS[p]}</option>
                    ))}
                  </SelectInput>
                </Field>
              </div>
            </div>

            {/* ── Seller fields ── */}
            {role === 'seller' && (
              <>
                <SectionDivider label="About your book" />

                <Field label="Estimated AUM (CAD)">
                  <TextInput value={aum} onChange={setAum} type="number" placeholder="e.g. 25000000" prefix="$" />
                </Field>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <Field label="Number of clients">
                      <TextInput value={clientCount} onChange={setClientCount} type="number" placeholder="e.g. 150" />
                    </Field>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Field label="Years in business">
                      <TextInput value={yearsInBusiness} onChange={setYearsInBusiness} type="number" placeholder="e.g. 18" />
                    </Field>
                  </div>
                </div>

                <Field label="Product / carrier mix">
                  <MultiSelect
                    options={CARRIERS}
                    selected={carrierMix}
                    onToggle={v => toggleItem(carrierMix, setCarrierMix, v)}
                    placeholder="Select carriers"
                  />
                </Field>

                <Field label="Specializations">
                  <MultiSelect
                    options={SPECIALTIES}
                    selected={specializations}
                    onToggle={v => toggleItem(specializations, setSpecializations, v)}
                    placeholder="Select specializations"
                  />
                </Field>

                <Field label="Exit timeline">
                  <TimelineChips selected={exitTimeline} onSelect={setExitTimeline} />
                </Field>
              </>
            )}

            {/* ── Buyer fields ── */}
            {role === 'buyer' && (
              <>
                <SectionDivider label="What you're looking for" />

                <Field label="Acquisition budget (CAD)">
                  <TextInput value={acquisitionBudget} onChange={setAcquisitionBudget} type="number" placeholder="e.g. 1000000" prefix="$" />
                </Field>

                <Field label="Growth stage">
                  <SelectInput value={growthStage} onChange={setGrowthStage}>
                    <option value="">Select…</option>
                    <option value="newer_advisor">Newer advisor</option>
                    <option value="established_advisor">Established advisor</option>
                  </SelectInput>
                </Field>

                <Field label="Target geography">
                  <MultiSelect
                    options={PROVINCES}
                    selected={targetGeography}
                    onToggle={v => toggleItem(targetGeography, setTargetGeography, v)}
                    placeholder="Select provinces"
                  />
                </Field>

                <Field label="Target specializations">
                  <MultiSelect
                    options={SPECIALTIES}
                    selected={targetSpecializations}
                    onToggle={v => toggleItem(targetSpecializations, setTargetSpecializations, v)}
                    placeholder="Select specializations"
                  />
                </Field>

                <Field label="Acquisition timeline">
                  <TimelineChips selected={acquisitionTimeline} onSelect={setAcquisitionTimeline} />
                </Field>
              </>
            )}

            {error && (
              <p style={{
                fontSize: '13px',
                fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                color: '#EF4444',
                marginBottom: '16px',
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !step2Valid}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                fontWeight: 500,
                fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                borderRadius: '8px',
                border: 'none',
                background: submitting || !step2Valid ? '#E5E7EB' : BRAND.electric,
                color: submitting || !step2Valid ? '#9CA3AF' : '#fff',
                cursor: submitting || !step2Valid ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
              }}
            >
              {submitting ? 'Creating profile…' : 'Create profile'}
            </button>

            <p style={{
              marginTop: '16px',
              fontSize: '12px',
              fontFamily: 'var(--font-sans), DM Sans, sans-serif',
              color: '#94A3B8',
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              By creating an account you agree to our{' '}
              <Link href="/terms" style={{ color: BRAND.electric, textDecoration: 'none' }}>terms of service</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: BRAND.electric, textDecoration: 'none' }}>privacy policy</Link>.
            </p>
          </form>
        )}

        {/* ── DONE ── */}
      </div>
    </div>
  )
}
