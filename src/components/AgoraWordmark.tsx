import Link from 'next/link'
import { BRAND } from '@/lib/brand'

export default function AgoraWordmark({ href = '/marketplace' }: { href?: string }) {
  return (
    <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
      <svg width="30" height="30" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M33 44 C33 20 67 20 67 44" fill="none" stroke="#F8F7F4" strokeWidth="7" />
        <path d="M20 44 H80 L70 84 H30 Z" fill="none" stroke="#F8F7F4" strokeWidth="7" strokeLinejoin="round" />
        <circle cx="70" cy="74" r="19" fill={BRAND.meadow} />
        <text x="70" y="82" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="24" fill={BRAND.midnight} textAnchor="middle">A</text>
      </svg>
      <span style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: '22px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
        agora
      </span>
    </Link>
  )
}
