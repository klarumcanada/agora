import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    account_type, role,
    name, email, password, phone, city, province,
    // seller
    aum, client_count, years_in_business, carrier_mix, specializations, exit_timeline,
    // buyer
    acquisition_budget, growth_stage, target_geography, target_specializations, acquisition_timeline,
  } = body

  // Basic validation
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

  // 2. Insert into agora_profiles
  const { error: profileError } = await supabase
    .from('agora_profiles')
    .insert({
      id: userId,
      name,
      email,
      phone,
      city,
      province,
      account_type,
      role,
    })

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 3. Insert into agora_advisor_details
  const details =
    role === 'seller'
      ? { aum_cad: aum, client_count, years_in_business, product_mix: carrier_mix, specializations, exit_timeline }
      : { acquisition_budget_cad: acquisition_budget, growth_stage, target_geography, target_specializations, acquisition_timeline }

  const { error: detailsError } = await supabase
    .from('agora_advisor_details')
    .insert({ profile_id: userId, ...details })

  if (detailsError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: detailsError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
