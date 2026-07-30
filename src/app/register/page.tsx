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
type ValuationMethod = 'calculator' | 'manual'

function fmtCurrency(n: number) {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `$${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`
  }
  return `$${Math.round(n / 1_000)}K`
}

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
          width: '100%', padding: '11px 14px', fontSize: '14px',
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          borderRadius: open ? '8px 8px 0 0' : '8px',
          border: open ? `1.5px solid ${BRAND.electric}` : '1px solid #E2E6F0',
          background: 'white', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'border-color .15s', boxSizing: 'border-box',
        }}
      >
        <span style={{ color: selected.length === 0 ? '#94A3B8' : BRAND.midnight }}>{triggerLabel}</span>
        <span style={{ fontSize: '10px', color: '#94A3B8' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white', border: `1.5px solid ${BRAND.electric}`,
          borderTop: 'none', borderRadius: '0 0 8px 8px',
          zIndex: 50, maxHeight: '220px', overflowY: 'auto',
        }}>
          {options.map(opt => {
            const active = selected.includes(opt)
            return (
              <button
                key={opt} type="button" onClick={() => onToggle(opt)}
                style={{
                  width: '100%', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: active ? '#EFF6FF' : 'white',
                  border: 'none', borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer', textAlign: 'left', transition: 'background .1s',
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
              borderRadius: '20px', background: BRAND.ice, color: BRAND.navy,
              border: `1px solid ${BRAND.electric}`, fontWeight: 500,
            }}>
              {s}
              <button
                type="button" onClick={() => onToggle(s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 5px', color: BRAND.electric, fontSize: '14px', lineHeight: 1 }}
              >×</button>
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
            key={t} type="button" onClick={() => onSelect(active ? '' : t)}
            style={{
              padding: '8px 14px', fontSize: '13px',
              fontFamily: 'var(--font-sans), DM Sans, sans-serif',
              borderRadius: '8px',
              border: active ? `2px solid ${BRAND.electric}` : '1px solid #E2E6F0',
              background: active ? BRAND.ice : 'white',
              color: active ? BRAND.navy : '#64748B',
              cursor: 'pointer', fontWeight: active ? 500 : 400, transition: 'all .15s',
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 20px' }}>
      <div style={{ flex: 1, height: '1px', background: '#E2E6F0' }} />
      <span style={{
        fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#94A3B8',
        fontFamily: 'var(--font-sans), DM Sans, sans-serif', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#E2E6F0' }} />
    </div>
  )
}

// ── Radio option ───────────────────────────────────────────────────

function RadioOption({ name, value, label, description, checked, onChange }: {
  name: string; value: string; label: string; description: string
  checked: boolean; onChange: () => void
}) {
  return (
    <label style={{ display: 'flex', gap: '12px', padding: '12px 0', cursor: 'pointer' }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <div style={{
        marginTop: '2px', flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%',
        border: checked ? `2px solid ${BRAND.electric}` : '1.5px solid #CBD5E1',
        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color .15s',
      }}>
        {checked && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: BRAND.electric }} />}
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: checked ? 500 : 400, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, marginBottom: '3px' }}>
          {label}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 300, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#94A3B8', lineHeight: 1.45 }}>
          {description}
        </div>
      </div>
    </label>
  )
}

// ── Revenue field (calculator) ─────────────────────────────────────

function RevenueField({ label, description, value, onChange }: {
  label: string; description: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'var(--font-sans), DM Sans, sans-serif', marginBottom: '8px', lineHeight: 1.45 }}>
        {description}
      </div>
      <TextInput value={value} onChange={onChange} type="number" placeholder="0" prefix="$" />
    </div>
  )
}

// ── Checkbox ───────────────────────────────────────────────────────

function Checkbox({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }} />
      <div style={{
        flexShrink: 0, marginTop: '2px', width: '18px', height: '18px', borderRadius: '4px',
        border: checked ? `2px solid ${BRAND.electric}` : '1.5px solid #CBD5E1',
        background: checked ? BRAND.electric : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: '14px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, lineHeight: 1.5 }}>
        {label}
      </span>
    </label>
  )
}

// ── Avatar upload ──────────────────────────────────────────────────

function AvatarUpload({ preview, onChange, isCorporation }: {
  preview: string | null
  onChange: (file: File, preview: string) => void
  isCorporation: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [hovering, setHovering] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) onChange(file, ev.target.result as string) }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          flexShrink: 0, width: '72px', height: '72px', borderRadius: '50%',
          border: preview ? 'none' : `2px dashed ${hovering ? BRAND.electric : '#CBD5E1'}`,
          background: preview ? 'transparent' : (hovering ? BRAND.ice : '#F8FAFC'),
          cursor: 'pointer', padding: 0, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color .15s, background .15s', position: 'relative',
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            {hovering && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M12.5 2.5l3 3L5 16H2v-3L12.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 5v12M5 11h12" stroke={hovering ? BRAND.electric : '#94A3B8'} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <div>
        <button
          type="button" onClick={() => inputRef.current?.click()}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.electric, cursor: 'pointer', display: 'block', marginBottom: '4px' }}
        >
          {preview
            ? (isCorporation ? 'Change logo' : 'Change photo')
            : (isCorporation ? 'Upload logo' : 'Upload photo')}
        </button>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#94A3B8' }}>
          JPG or PNG, max 5 MB
        </span>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
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
      <span style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '22px', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>
        klarum
      </span>
    </Link>
  )
}

// ── Step indicator ─────────────────────────────────────────────────

function StepIndicator({ step, role }: { step: 1 | 2 | 3; role?: Role | null }) {
  const heading =
    step === 1 ? 'Create your account'
    : step === 2 ? 'Your profile'
    : role === 'seller' ? 'Your book'
    : 'Your acquisition goals'

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'var(--font-sans), DM Sans, sans-serif', marginBottom: '10px' }}>
        Step {step} of 3
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '26px', fontWeight: 600, color: BRAND.midnight, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
        {heading}
      </h1>
    </div>
  )
}

// ── Back button ────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#94A3B8', cursor: 'pointer' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [q2Visible, setQ2Visible] = useState(false)

  useEffect(() => {
    if (accountType !== null && !q2Visible) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setQ2Visible(true)))
      return () => cancelAnimationFrame(id)
    }
  }, [accountType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2 — profile
  const [name, setName] = useState('')
  const [entityName, setEntityName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')

  // Step 3 — seller valuation
  const [valuationMethod, setValuationMethod] = useState<ValuationMethod | null>(null)
  const [lifeRevenue, setLifeRevenue] = useState('')
  const [disabilityRevenue, setDisabilityRevenue] = useState('')
  const [ciRevenue, setCiRevenue] = useState('')
  const [healthRevenue, setHealthRevenue] = useState('')
  const [segFundsRevenue, setSegFundsRevenue] = useState('')
  const [totalPolicies, setTotalPolicies] = useState('')
  const [activePolicies, setActivePolicies] = useState('')
  const [willingToStay, setWillingToStay] = useState(false)
  const [valuationRange, setValuationRange] = useState<{ low: number; high: number } | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)

  // Step 3 — seller book details
  const [aum, setAum] = useState('')
  const [clientCount, setClientCount] = useState('')
  const [yearsInBusiness, setYearsInBusiness] = useState('')
  const [carrierMix, setCarrierMix] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [exitTimeline, setExitTimeline] = useState('')

  // Step 3 — buyer
  const [acquisitionBudget, setAcquisitionBudget] = useState('')
  const [growthStage, setGrowthStage] = useState('')
  const [targetGeography, setTargetGeography] = useState<string[]>([])
  const [targetSpecializations, setTargetSpecializations] = useState<string[]>([])
  const [acquisitionTimeline, setAcquisitionTimeline] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleItem(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  const canContinueStep1 = accountType !== null && role !== null

  const step2Valid = Boolean(
    name.trim() && email.trim() && password.length >= 8 &&
    phone.trim() && city.trim() && province &&
    (accountType !== 'corporation' || entityName.trim())
  )

  const hasRevenue = Boolean(
    Number(lifeRevenue) > 0 || Number(disabilityRevenue) > 0 ||
    Number(ciRevenue) > 0 || Number(healthRevenue) > 0 || Number(segFundsRevenue) > 0
  )

  const policiesValid = !activePolicies || !totalPolicies ||
    Number(activePolicies) <= Number(totalPolicies)

  async function handleCalculate() {
    if (!hasRevenue) { setCalcError('Enter revenue in at least one product line.'); return }
    if (!policiesValid) { setCalcError('Active policies cannot exceed total policies.'); return }

    setCalculating(true)
    setCalcError(null)
    setValuationRange(null)

    const revenue: Record<string, number> = {}
    if (Number(lifeRevenue) > 0) revenue.life = Number(lifeRevenue)
    if (Number(disabilityRevenue) > 0) revenue.disability = Number(disabilityRevenue)
    if (Number(ciRevenue) > 0) revenue.critical_illness = Number(ciRevenue)
    if (Number(healthRevenue) > 0) revenue.health = Number(healthRevenue)
    if (Number(segFundsRevenue) > 0) revenue.seg_funds = Number(segFundsRevenue)

    const res = await fetch('/agora/api/agora-valuations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        revenue,
        total_policies: totalPolicies ? Number(totalPolicies) : null,
        active_policies: activePolicies ? Number(activePolicies) : null,
        willing_to_stay: willingToStay,
      }),
    })

    const data = await res.json()
    setCalculating(false)

    if (!res.ok) { setCalcError(data.error ?? 'Calculation failed.'); return }
    setValuationRange({ low: data.low_value, high: data.high_value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accountType || !role) return
    setError(null)
    setSubmitting(true)

    const fd = new FormData()
    fd.append('account_type', accountType)
    fd.append('role', role)
    fd.append('name', name.trim())
    fd.append('email', email.trim())
    fd.append('password', password)
    fd.append('phone', phone.trim())
    fd.append('city', city.trim())
    fd.append('province', province)
    if (entityName.trim()) fd.append('entity_name', entityName.trim())
    if (avatarFile) fd.append('avatar', avatarFile)

    fd.append('willing_to_stay', String(willingToStay))

    if (role === 'seller') {
      if (valuationMethod) fd.append('valuation_method', valuationMethod)
      if (valuationMethod === 'calculator') {
        if (Number(lifeRevenue) > 0) fd.append('life_revenue', lifeRevenue)
        if (Number(disabilityRevenue) > 0) fd.append('disability_revenue', disabilityRevenue)
        if (Number(ciRevenue) > 0) fd.append('ci_revenue', ciRevenue)
        if (Number(healthRevenue) > 0) fd.append('health_revenue', healthRevenue)
        if (Number(segFundsRevenue) > 0) fd.append('seg_funds_revenue', segFundsRevenue)
        if (totalPolicies) fd.append('total_policies', totalPolicies)
        if (activePolicies) fd.append('active_policies', activePolicies)
      } else {
        if (aum) fd.append('aum', aum)
      }
      if (clientCount) fd.append('client_count', clientCount)
      if (yearsInBusiness) fd.append('years_in_business', yearsInBusiness)
      if (carrierMix.length) fd.append('carrier_mix', JSON.stringify(carrierMix))
      if (specializations.length) fd.append('specializations', JSON.stringify(specializations))
      if (exitTimeline) fd.append('exit_timeline', exitTimeline)
    } else {
      if (acquisitionBudget) fd.append('acquisition_budget', acquisitionBudget)
      if (growthStage) fd.append('growth_stage', growthStage)
      if (targetGeography.length) fd.append('target_geography', JSON.stringify(targetGeography))
      if (targetSpecializations.length) fd.append('target_specializations', JSON.stringify(targetSpecializations))
      if (acquisitionTimeline) fd.append('acquisition_timeline', acquisitionTimeline)
    }

    const res = await fetch('/agora/api/register', { method: 'POST', body: fd })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? 'Something went wrong. Please try again.'); return }
    router.push('/register/success')
  }

  return (
    <div style={{
      minHeight: '100vh', background: BRAND.midnight,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '48px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px',
    }}>
      <Logo />

      <div style={{
        width: '100%', maxWidth: '480px', background: '#fff',
        borderRadius: '16px', padding: '40px 48px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <StepIndicator step={1} role={role} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, marginBottom: '4px' }}>
                  How would you like to register?
                </div>
                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px' }}>
                  <RadioOption name="account_type" value="individual" label="Individual Advisor" description="For licensed advisors registering personally" checked={accountType === 'individual'} onChange={() => setAccountType('individual')} />
                  <div style={{ borderTop: '1px solid #F1F5F9' }}>
                    <RadioOption name="account_type" value="corporation" label="Corporation" description="For incorporated advisors and firms" checked={accountType === 'corporation'} onChange={() => setAccountType('corporation')} />
                  </div>
                </div>
              </div>

              {accountType !== null && (
                <div style={{ opacity: q2Visible ? 1 : 0, transform: q2Visible ? 'none' : 'translateY(8px)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, marginBottom: '4px' }}>
                    What are you looking to do?
                  </div>
                  <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px' }}>
                    <RadioOption name="role" value="seller" label="Sell a book of business" description="You're planning to exit or reduce your practice" checked={role === 'seller'} onChange={() => setRole('seller')} />
                    <div style={{ borderTop: '1px solid #F1F5F9' }}>
                      <RadioOption name="role" value="buyer" label="Buy a book of business" description="You're looking to grow by acquiring a book" checked={role === 'buyer'} onChange={() => setRole('buyer')} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button" disabled={!canContinueStep1} onClick={() => setStep(2)}
              style={{
                marginTop: '28px', width: '100%', padding: '13px', fontSize: '15px', fontWeight: 500,
                fontFamily: 'var(--font-sans), DM Sans, sans-serif', borderRadius: '8px', border: 'none',
                background: canContinueStep1 ? BRAND.electric : '#E5E7EB',
                color: canContinueStep1 ? '#fff' : '#9CA3AF',
                cursor: canContinueStep1 ? 'pointer' : 'not-allowed', transition: 'background .15s',
              }}
            >
              Continue
            </button>

            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#94A3B8' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: BRAND.electric, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <BackButton onClick={() => setStep(1)} />
            <StepIndicator step={2} role={role} />

            <AvatarUpload
              preview={avatarPreview}
              onChange={(file, preview) => { setAvatarFile(file); setAvatarPreview(preview) }}
              isCorporation={accountType === 'corporation'}
            />

            {accountType === 'corporation' && (
              <Field label="Entity name" required>
                <TextInput value={entityName} onChange={setEntityName} placeholder="Acme Advisory Corp." autoComplete="organization" />
              </Field>
            )}

            <Field label={accountType === 'corporation' ? 'Contact name' : 'Full name'} required>
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
                    {PROVINCES.map(p => <option key={p} value={p}>{PROVINCE_LABELS[p]}</option>)}
                  </SelectInput>
                </Field>
              </div>
            </div>

            <button
              type="button" disabled={!step2Valid} onClick={() => setStep(3)}
              style={{
                marginTop: '8px', width: '100%', padding: '13px', fontSize: '15px', fontWeight: 500,
                fontFamily: 'var(--font-sans), DM Sans, sans-serif', borderRadius: '8px', border: 'none',
                background: step2Valid ? BRAND.electric : '#E5E7EB',
                color: step2Valid ? '#fff' : '#9CA3AF',
                cursor: step2Valid ? 'pointer' : 'not-allowed', transition: 'background .15s',
              }}
            >
              Continue
            </button>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <BackButton onClick={() => setStep(2)} />
            <StepIndicator step={3} role={role} />

            {/* ── Seller fields ── */}
            {role === 'seller' && (
              <>
                {/* Valuation method */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: BRAND.midnight, marginBottom: '4px' }}>
                    How would you like to value your book?
                  </div>
                  <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px' }}>
                    <RadioOption
                      name="valuation_method" value="calculator"
                      label="Use our valuation calculator"
                      description="Estimate your book value from revenue across product lines."
                      checked={valuationMethod === 'calculator'}
                      onChange={() => { setValuationMethod('calculator'); setValuationRange(null); setCalcError(null) }}
                    />
                    <div style={{ borderTop: '1px solid #F1F5F9' }}>
                      <RadioOption
                        name="valuation_method" value="manual"
                        label="Enter my AUM manually"
                        description="Provide your total assets under management as a single figure."
                        checked={valuationMethod === 'manual'}
                        onChange={() => { setValuationMethod('manual'); setValuationRange(null); setCalcError(null) }}
                      />
                    </div>
                  </div>
                </div>

                {/* Calculator */}
                {valuationMethod === 'calculator' && (
                  <>
                    <SectionDivider label="Revenue by product type" />

                    <RevenueField label="Life Insurance" description="Permanent and term life policies with recurring renewal commissions." value={lifeRevenue} onChange={setLifeRevenue} />
                    <RevenueField label="Disability Insurance" description="Individual and group disability income protection policies." value={disabilityRevenue} onChange={setDisabilityRevenue} />
                    <RevenueField label="Critical Illness" description="Lump-sum benefit policies for critical health events." value={ciRevenue} onChange={setCiRevenue} />
                    <RevenueField label="Health & Benefits" description="Extended health, dental, and group benefits contracts." value={healthRevenue} onChange={setHealthRevenue} />
                    <RevenueField label="Segregated Funds" description="Segregated fund contracts with ongoing trailer commissions." value={segFundsRevenue} onChange={setSegFundsRevenue} />

                    <SectionDivider label="Policy counts" />

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <Field label="Total policies">
                          <TextInput value={totalPolicies} onChange={setTotalPolicies} type="number" placeholder="e.g. 320" />
                        </Field>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Field label="Active policies" hint={!policiesValid ? 'Must be ≤ total' : undefined}>
                          <TextInput value={activePolicies} onChange={setActivePolicies} type="number" placeholder="e.g. 290" />
                        </Field>
                      </div>
                    </div>

                    <SectionDivider label="Transition" />

                    <div style={{ marginBottom: '20px' }}>
                      <Checkbox
                        checked={willingToStay}
                        onChange={setWillingToStay}
                        label="I'm willing to stay on and support the transition after the sale"
                      />
                    </div>

                    {calcError && (
                      <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#EF4444', marginBottom: '12px' }}>
                        {calcError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleCalculate}
                      disabled={calculating}
                      style={{
                        width: '100%', padding: '12px', fontSize: '14px', fontWeight: 500,
                        fontFamily: 'var(--font-sans), DM Sans, sans-serif',
                        borderRadius: '8px', border: `1.5px solid ${BRAND.electric}`,
                        background: 'white', color: BRAND.electric,
                        cursor: calculating ? 'not-allowed' : 'pointer',
                        transition: 'background .15s, color .15s',
                        marginBottom: valuationRange ? '0' : '24px',
                      }}
                    >
                      {calculating ? 'Calculating…' : 'Calculate valuation'}
                    </button>

                    {valuationRange && (
                      <div style={{
                        margin: '16px 0 24px',
                        padding: '18px 20px',
                        borderRadius: '10px',
                        background: BRAND.ice,
                        border: '1px solid #BFDBFE',
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontFamily: 'var(--font-sans), DM Sans, sans-serif', marginBottom: '6px' }}>
                          Estimated value
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '24px', fontWeight: 600, color: BRAND.midnight, letterSpacing: '-0.01em' }}>
                          {fmtCurrency(valuationRange.low)} – {fmtCurrency(valuationRange.high)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-sans), DM Sans, sans-serif', marginTop: '6px', lineHeight: 1.5 }}>
                          This is a self-reported estimate based on the figures you entered.
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Manual AUM */}
                {valuationMethod === 'manual' && (
                  <>
                    <Field label="Estimated AUM (CAD)">
                      <TextInput value={aum} onChange={setAum} type="number" placeholder="e.g. 25000000" prefix="$" />
                    </Field>

                    <SectionDivider label="Transition" />
                    <div style={{ marginBottom: '20px' }}>
                      <Checkbox
                        checked={willingToStay}
                        onChange={setWillingToStay}
                        label="I'm willing to stay on and support the transition after the sale"
                      />
                    </div>
                  </>
                )}

                {/* Book details — always shown for sellers */}
                {valuationMethod !== null && (
                  <>
                    <SectionDivider label="Book details" />

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
                      <MultiSelect options={CARRIERS} selected={carrierMix} onToggle={v => toggleItem(carrierMix, setCarrierMix, v)} placeholder="Select carriers" />
                    </Field>

                    <Field label="Specializations">
                      <MultiSelect options={SPECIALTIES} selected={specializations} onToggle={v => toggleItem(specializations, setSpecializations, v)} placeholder="Select specializations" />
                    </Field>

                    <Field label="Exit timeline">
                      <TimelineChips selected={exitTimeline} onSelect={setExitTimeline} />
                    </Field>
                  </>
                )}
              </>
            )}

            {/* ── Buyer fields ── */}
            {role === 'buyer' && (
              <>
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
                  <MultiSelect options={PROVINCES} selected={targetGeography} onToggle={v => toggleItem(targetGeography, setTargetGeography, v)} placeholder="Select provinces" />
                </Field>

                <Field label="Target specializations">
                  <MultiSelect options={SPECIALTIES} selected={targetSpecializations} onToggle={v => toggleItem(targetSpecializations, setTargetSpecializations, v)} placeholder="Select specializations" />
                </Field>

                <Field label="Acquisition timeline">
                  <TimelineChips selected={acquisitionTimeline} onSelect={setAcquisitionTimeline} />
                </Field>
              </>
            )}

            {error && (
              <p style={{ fontSize: '13px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#EF4444', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={submitting}
              style={{
                marginTop: '8px', width: '100%', padding: '13px', fontSize: '15px', fontWeight: 500,
                fontFamily: 'var(--font-sans), DM Sans, sans-serif', borderRadius: '8px', border: 'none',
                background: submitting ? '#E5E7EB' : BRAND.electric,
                color: submitting ? '#9CA3AF' : '#fff',
                cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background .15s',
              }}
            >
              {submitting ? 'Creating profile…' : 'Create profile'}
            </button>

            <p style={{ marginTop: '16px', fontSize: '12px', fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#94A3B8', lineHeight: 1.6, textAlign: 'center' }}>
              By creating an account you agree to our{' '}
              <Link href="/terms" style={{ color: BRAND.electric, textDecoration: 'none' }}>terms of service</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: BRAND.electric, textDecoration: 'none' }}>privacy policy</Link>.
            </p>
          </form>
        )}

      </div>
    </div>
  )
}
