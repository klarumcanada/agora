import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import MessageNotification from '@/app/emails/MessageNotification'

async function makeClients() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return { supabase, admin }
}

export async function GET() {
  const { supabase, admin } = await makeClients()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conversations, error } = await admin
    .from('agora_conversations')
    .select('id, initiator_id, recipient_id, created_at')
    .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!conversations || conversations.length === 0) return NextResponse.json([])

  const convIds = conversations.map(c => c.id)
  const { data: messages } = await admin
    .from('agora_messages')
    .select('id, conversation_id, sender_id, body, created_at, read_at')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: true })

  const otherIds = [...new Set(conversations.map(c => c.initiator_id === user.id ? c.recipient_id : c.initiator_id))]
  const { data: profiles } = await admin
    .from('agora_profiles')
    .select('id, name')
    .in('id', otherIds)

  const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.name]))

  const threads = conversations.map(conv => {
    const msgs = (messages ?? []).filter(m => m.conversation_id === conv.id)
    const latest = msgs[msgs.length - 1]
    const otherId = conv.initiator_id === user.id ? conv.recipient_id : conv.initiator_id
    const is_unread = msgs.some(m => m.sender_id !== user.id && !m.read_at)

    return {
      id: conv.id,
      other: { id: otherId, name: nameMap[otherId] ?? 'Unknown' },
      last_body: latest?.body ?? '',
      last_activity: latest?.created_at ?? conv.created_at,
      message_count: msgs.length,
      is_unread,
    }
  })

  threads.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())

  return NextResponse.json(threads)
}

export async function POST(request: NextRequest) {
  const { supabase, admin } = await makeClients()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to_id, body, conversation_id } = await request.json()
  if (!body?.trim() || (!conversation_id && !to_id)) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  type Conversation = { id: string; initiator_id: string; recipient_id: string }
  let conversation: Conversation | null = null

  if (conversation_id) {
    const { data } = await admin
      .from('agora_conversations')
      .select('id, initiator_id, recipient_id')
      .eq('id', conversation_id)
      .single()
    if (!data || (data.initiator_id !== user.id && data.recipient_id !== user.id)) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    conversation = data
  } else {
    const { data: existing } = await admin
      .from('agora_conversations')
      .select('id, initiator_id, recipient_id')
      .or(`and(initiator_id.eq.${user.id},recipient_id.eq.${to_id}),and(initiator_id.eq.${to_id},recipient_id.eq.${user.id})`)
      .is('listing_id', null)
      .maybeSingle()

    if (existing) {
      conversation = existing
    } else {
      const { data: created, error: convErr } = await admin
        .from('agora_conversations')
        .insert({ initiator_id: user.id, recipient_id: to_id })
        .select('id, initiator_id, recipient_id')
        .single()
      if (convErr) return NextResponse.json({ error: convErr.message }, { status: 400 })
      conversation = created
    }
  }

  const { data: message, error } = await admin
    .from('agora_messages')
    .insert({ conversation_id: conversation.id, sender_id: user.id, body })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const recipientId = conversation.initiator_id === user.id ? conversation.recipient_id : conversation.initiator_id

  const [{ data: sender }, { data: recipientEmail }] = await Promise.all([
    admin.from('agora_profiles').select('name').eq('id', user.id).single(),
    admin.rpc('get_user_email', { user_id: recipientId }),
  ])

  if (recipientEmail) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Agora <notifications@klarum.ca>',
        to: recipientEmail,
        subject: `${sender?.name ?? 'Someone'} sent you a message on Agora`,
        react: MessageNotification({
          fromName: sender?.name ?? 'An Agora user',
          body,
          inboxUrl: `${process.env.NEXT_PUBLIC_APP_URL}/agora/inbox/${conversation.id}`,
        }),
      })
    } catch (emailErr) {
      console.error('Agora email send failed:', emailErr)
    }
  }

  return NextResponse.json({ success: true, message, conversation_id: conversation.id })
}
