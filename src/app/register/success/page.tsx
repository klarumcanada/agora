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
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
        <svg width="38" height="26" viewBox="0 0 44 30" fill="none">
          <rect x="1" y="1" width="3.5" height="28" fill="white" />
          <path d="M4.5 15 L18 1" stroke="white" strokeWidth="3" strokeLinecap="square" />
          <path d="M4.5 15 L18 29" stroke="white" strokeWidth="3" strokeLinecap="square" />
          <line x1="18" y1="4" x2="34" y2="15" stroke="white" strokeWidth="0.75" opacity="0.4" />
          <line x1="18" y1="26" x2="34" y2="15" stroke="white" strokeWidth="0.75" opacity="0.4" />
          <circle cx="34" cy="15" r="7" fill="#3B82F6" />
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
          background: '#DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11l4.5 4.5 9-9" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#0D1B3E',
          letterSpacing: '-0.02em',
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
            fontWeight: 500,
            fontFamily: 'var(--font-sans), DM Sans, sans-serif',
            borderRadius: '8px',
            background: '#3B82F6',
            color: '#fff',
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
