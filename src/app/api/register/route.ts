import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const account_type = formData.get('account_type') as string | null
  const role = formData.get('role') as string | null
  const name = formData.get('name') as string | null
  const entity_name = formData.get('entity_name') as string | null
  const email = formData.get('email') as string | null
  const password = formData.get('password') as string | null
  const phone = formData.get('phone') as string | null
  const city = formData.get('city') as string | null
  const province = formData.get('province') as string | null
  const avatarFile = formData.get('avatar') as File | null

  // seller
  const aum = formData.get('aum') as string | null
  const client_count = formData.get('client_count') as string | null
  const years_in_business = formData.get('years_in_business') as string | null
  const carrier_mix = formData.get('carrier_mix') ? JSON.parse(formData.get('carrier_mix') as string) : null
  const specializations = formData.get('specializations') ? JSON.parse(formData.get('specializations') as string) : null
  const exit_timeline = formData.get('exit_timeline') as string | null

  // buyer
  const acquisition_budget = formData.get('acquisition_budget') as string | null
  const growth_stage = formData.get('growth_stage') as string | null
  const target_geography = formData.get('target_geography') ? JSON.parse(formData.get('target_geography') as string) : null
  const target_specializations = formData.get('target_specializations') ? JSON.parse(formData.get('target_specializations') as string) : null
  const acquisition_timeline = formData.get('acquisition_timeline') as string | null

  if (!name || !email || !password || !phone || !city || !province || !account_type || !role) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { name, account_type, role },
  })

  if (authError || !authData.user) {
    const msg = authError?.message ?? 'Failed to create account.'
    const status = msg.toLowerCase().includes('already') ? 409 : 400
    return NextResponse.json({ error: msg }, { status })
  }

  const userId = authData.user.id

  // 2. Upload avatar if provided
  let avatar_url: string | null = null
  if (avatarFile && avatarFile.size > 0) {
    const ext = (avatarFile.name.split('.').pop() ?? 'jpg').toLowerCase()
    const path = `${userId}/avatar.${ext}`
    const buffer = Buffer.from(await avatarFile.arrayBuffer())
    const { error: uploadError } = await supabase.storage
      .from('agora-uploads')
      .upload(path, buffer, { contentType: avatarFile.type, upsert: true })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('agora-uploads')
        .getPublicUrl(path)
      avatar_url = publicUrl
    }
  }

  // 3. Insert into agora_profiles
  const profileRow: Record<string, unknown> = {
    id: userId,
    name,
    email,
    phone,
    city,
    province,
    account_type,
    role,
    avatar_url,
  }
  if (entity_name) profileRow.entity_name = entity_name

  const { error: profileError } = await supabase
    .from('agora_profiles')
    .insert(profileRow)

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 4. Insert into agora_advisor_details
  const details =
    role === 'seller'
      ? {
          aum_cad: aum ? Number(aum) : null,
          client_count: client_count ? Number(client_count) : null,
          years_in_business: years_in_business ? Number(years_in_business) : null,
          product_mix: carrier_mix,
          specializations,
          exit_timeline: exit_timeline || null,
        }
      : {
          acquisition_budget_cad: acquisition_budget ? Number(acquisition_budget) : null,
          growth_stage: growth_stage || null,
          target_geography,
          target_specializations,
          acquisition_timeline: acquisition_timeline || null,
        }

  const { error: detailsError } = await supabase
    .from('agora_advisor_details')
    .insert({ profile_id: userId, ...details })

  if (detailsError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: detailsError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
