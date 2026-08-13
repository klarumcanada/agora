'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AgoraNav from '@/components/AgoraNav'
import { BRAND } from '@/lib/brand'

type RawMessage = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const isToday = d.toDateString() === new Date().toDateString()
  return isToday
    ? d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function initials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  return parts[0]?.[0]?.toUpperCase() ?? '?'
}

export default function AgoraThreadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [messages, setMessages] = useState<RawMessage[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [other, setOther] = useState<{ id: string; name: string } | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const [res] = await Promise.all([
        fetch(`/agora/api/inbox/${id}`, { cache: 'no-store' }),
        fetch(`/agora/api/messages/${id}/read`, { method: 'POST' }),
      ])

      if (res.status === 401) { router.push('/login'); return }
      if (!res.ok) { setNotFound(true); setLoading(false); return }

      const data = await res.json()
      setMessages(data.messages ?? [])
      setOther(data.other ?? null)
      setUserId(data.userId ?? null)
      setLoading(false)
    }

    load()
  }, [id, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendReply() {
    if (!replyBody.trim()) return
    setSending(true)
    setSendError(null)

    const res = await fetch('/agora/api/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: id, body: replyBody }),
    })
    const data = await res.json()
    setSending(false)

    if (!data.success) {
      setSendError(data.error ?? 'Failed to send.')
      return
    }

    setMessages(prev => [...prev, data.message])
    setReplyBody('')
  }

  if (loading) return (
    <div style={{ background: BRAND.chalk, minHeight: '100vh' }}>
      <AgoraNav />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#9CA3AF' }}>Loading…</p>
      </div>
    </div>
  )

  if (notFound || !other) return (
    <div style={{ background: BRAND.chalk, minHeight: '100vh' }}>
      <AgoraNav />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#9CA3AF' }}>Conversation not found.</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: BRAND.chalk, minHeight: '100vh', paddingBottom: '8rem' }}>
      <AgoraNav />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        <Link href="/inbox" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#9CA3AF', textDecoration: 'none', display: 'inline-block', marginBottom: '1.25rem' }}>
          ← Inbox
        </Link>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: '24px', color: BRAND.midnight, margin: 0 }}>
            {other.name}
          </h1>
        </div>

        {/* Message bubbles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
          {messages.length === 0 && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#9CA3AF' }}>No messages yet.</p>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === userId
            const senderName = isMe ? 'You' : other.name

            return (
              <div
                key={msg.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}
              >
                <div style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-end',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  maxWidth: '82%',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: isMe ? BRAND.meadow : '#E2E6F0',
                    color: BRAND.midnight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {initials(senderName)}
                  </div>

                  <div>
                    <div style={{
                      background: isMe ? BRAND.ice : 'white',
                      border: isMe ? '1px solid oklch(50% 0.18 145 / 0.27)' : '1px solid #E2E6F0',
                      borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      padding: '12px 16px',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                      color: BRAND.midnight, lineHeight: 1.65,
                    }}>
                      {msg.body}
                    </div>
                    <div style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#9CA3AF',
                      marginTop: '4px', textAlign: isMe ? 'right' : 'left',
                    }}>
                      {senderName} · {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: BRAND.chalk, borderTop: '1px solid #E2E6F0',
          padding: '1rem',
        }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{
              background: 'white', borderRadius: '12px', border: '1px solid #E2E6F0',
              padding: '12px 14px',
            }}>
              <textarea
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply() }}
                placeholder="Write a reply…"
                rows={2}
                style={{
                  width: '100%', border: 'none', outline: 'none', resize: 'none',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: BRAND.midnight,
                  lineHeight: 1.65, background: 'transparent', boxSizing: 'border-box',
                }}
              />
              {sendError && (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: BRAND.danger, margin: '4px 0 6px' }}>
                  {sendError}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#D1D5DB' }}>⌘↵ to send</span>
                <button
                  onClick={sendReply}
                  disabled={sending || !replyBody.trim()}
                  style={{
                    background: replyBody.trim() ? BRAND.meadow : '#E5E7EB',
                    color: replyBody.trim() ? BRAND.midnight : '#9CA3AF',
                    border: 'none', borderRadius: '8px', padding: '8px 18px',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
                    cursor: replyBody.trim() ? 'pointer' : 'default',
                  }}
                >
                  {sending ? 'Sending…' : 'Send →'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
