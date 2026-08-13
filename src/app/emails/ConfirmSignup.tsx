import {
  Html, Head, Body, Container, Section, Text, Button, Preview
} from '@react-email/components'

interface ConfirmSignupProps {
  name: string
  confirmUrl: string
}

export default function ConfirmSignup({ name, confirmUrl }: ConfirmSignupProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your email to finish setting up Agora</Preview>
      <Body style={{ backgroundColor: '#F0EDE7', fontFamily: 'DM Sans, sans-serif', margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto' }}>

          {/* Logo bar */}
          <Section style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', color: '#0D1B3E', margin: 0 }}>
              agora
            </Text>
          </Section>

          {/* Card */}
          <Section style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #E2E6F0',
            padding: '36px 40px',
          }}>
            <Text style={{ fontSize: '20px', fontStyle: 'italic', fontWeight: 400, color: '#0D1B3E', margin: '0 0 8px 0', fontFamily: 'Georgia, serif' }}>
              Confirm your email
            </Text>

            <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: '0 0 28px 0' }}>
              Hi {name}, welcome to Agora. Confirm your email address to finish setting up your account and sign in.
            </Text>

            <Button
              href={confirmUrl}
              style={{
                backgroundColor: '#4ADE80',
                color: '#0D1B3E',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Confirm email address →
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{ marginTop: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
              You&#39;re receiving this because you registered on Agora. If this wasn&#39;t you, you can ignore this email.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
