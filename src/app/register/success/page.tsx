import Link from 'next/link'

export default function RegisterSuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B3E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <Link href="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
        <svg width="30" height="30" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M33 44 C33 20 67 20 67 44" fill="none" stroke="#F8F7F4" strokeWidth="7" />
          <path d="M20 44 H80 L70 84 H30 Z" fill="none" stroke="#F8F7F4" strokeWidth="7" strokeLinejoin="round" />
          <circle cx="70" cy="74" r="19" fill="oklch(80% 0.28 145)" />
          <text x="70" y="82" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="24" fill="#0D1B3E" textAnchor="middle">A</text>
        </svg>
        <span style={{
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '-0.01em',
        }}>
          agora
        </span>
      </Link>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#fff',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'oklch(80% 0.28 145)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11l4.5 4.5 9-9" stroke="#0D1B3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontStyle: 'italic',
          fontSize: '26px',
          fontWeight: 400,
          color: '#0D1B3E',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          marginBottom: '12px',
        }}>
          Profile created — welcome to Agora.
        </h1>

        <p style={{
          fontSize: '14px',
          fontWeight: 300,
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          color: '#64748B',
          lineHeight: 1.65,
          marginBottom: '32px',
        }}>
          Your account is set up. Check your email to confirm your address, then head to the marketplace.
        </p>

        <Link
          href="/marketplace"
          style={{
            display: 'block',
            width: '100%',
            padding: '13px',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: 'var(--font-sans), DM Sans, sans-serif',
            borderRadius: '8px',
            background: 'oklch(80% 0.28 145)',
            color: '#0D1B3E',
            textDecoration: 'none',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          Go to marketplace
        </Link>
      </div>
    </div>
  )
}
