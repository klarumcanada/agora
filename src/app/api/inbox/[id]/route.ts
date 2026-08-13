import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, admin } = await makeClients()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conversation } = await admin
    .from('agora_conversations')
    .select('id, initiator_id, recipient_id')
    .eq('id', id)
    .single()

  if (!conversation || (conversation.initiator_id !== user.id && conversation.recipient_id !== user.id)) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const { data: messages, error } = await admin
    .from('agora_messages')
    .select('id, conversation_id, sender_id, body, created_at, read_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const otherId = conversation.initiator_id === user.id ? conversation.recipient_id : conversation.initiator_id
  const { data: otherProfile } = await admin
    .from('agora_profiles')
    .select('id, name')
    .eq('id', otherId)
    .single()

  return NextResponse.json({
    messages: messages ?? [],
    other: { id: otherId, name: otherProfile?.name ?? 'Unknown' },
    userId: user.id,
  })
}
