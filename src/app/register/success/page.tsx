import Link from 'next/link'
import AgoraWordmark from '@/components/AgoraWordmark'

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
      <AgoraWordmark href="/login" />

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
          Your account is set up. Check your email to confirm your address, then sign in to get started.
        </p>

        <Link
          href="/login"
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
          Go to sign in
        </Link>
      </div>
    </div>
  )
}
