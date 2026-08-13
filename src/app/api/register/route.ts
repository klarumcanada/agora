import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase'
import { calculateValuation } from '@/lib/valuation'
import ConfirmSignup from '@/app/emails/ConfirmSignup'

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

  // seller — valuation
  const valuation_method = formData.get('valuation_method') as string | null
  const willing_to_stay = formData.get('willing_to_stay') === 'true'
  const life_revenue = formData.get('life_revenue') as string | null
  const disability_revenue = formData.get('disability_revenue') as string | null
  const ci_revenue = formData.get('ci_revenue') as string | null
  const health_revenue = formData.get('health_revenue') as string | null
  const seg_funds_revenue = formData.get('seg_funds_revenue') as string | null
  const total_policies_v = formData.get('total_policies') as string | null
  const active_policies_v = formData.get('active_policies') as string | null

  // seller — book details
  const aum = formData.get('aum') as string | null
  const client_count = formData.get('client_count') as string | null
  const years_in_business = formData.get('years_in_business') as string | null
  const carrier_affiliations = formData.get('carrier_affiliations') ? JSON.parse(formData.get('carrier_affiliations') as string) : null
  const products = formData.get('products') ? JSON.parse(formData.get('products') as string) : null
  const exit_timeline = formData.get('exit_timeline') as string | null
  const sale_portion_type = formData.get('sale_portion_type') as string | null
  const sale_portion_percentage = formData.get('sale_portion_percentage') as string | null
  const sale_portion_segment_type = formData.get('sale_portion_segment_type') as string | null
  const sale_portion_segment_detail = formData.get('sale_portion_segment_detail') as string | null

  // buyer
  const acquisition_budget = formData.get('acquisition_budget') as string | null
  const growth_stage = formData.get('growth_stage') as string | null
  const target_geography = formData.get('target_geography') ? JSON.parse(formData.get('target_geography') as string) : null
  const target_products = formData.get('target_products') ? JSON.parse(formData.get('target_products') as string) : null
  const acquisition_timeline = formData.get('acquisition_timeline') as string | null

  if (!name || !email || !password || !phone || !city || !province || !account_type || !role) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (account_type === 'corporation' && !entity_name) {
    return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Create auth user and generate a confirmation link/token.
  // admin.createUser never sends a confirmation email on its own — generateLink
  // both creates the (unconfirmed) user and hands back a hashed_token we send
  // ourselves via Resend below.
  const { data: linkData, error: authError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: { data: { name, account_type, role } },
  })

  if (authError || !linkData.user) {
    const msg = authError?.message ?? 'Failed to create account.'
    const status = msg.toLowerCase().includes('already') ? 409 : 400
    return NextResponse.json({ error: msg }, { status })
  }

  const userId = linkData.user.id

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

  // 4. Insert into agora_advisor_details (individual) or agora_corp_details (corporation)
  const detailsTable = account_type === 'corporation' ? 'agora_corp_details' : 'agora_advisor_details'

  const details =
    role === 'seller'
      ? {
          book_value: aum ? Number(aum) : null,
          client_count: client_count ? Number(client_count) : null,
          years_in_business: years_in_business ? Number(years_in_business) : null,
          carrier_affiliations,
          products,
          exit_timeline: exit_timeline || null,
          willing_to_stay,
          sale_portion_type: sale_portion_type || null,
          sale_portion_percentage: sale_portion_percentage ? Number(sale_portion_percentage) : null,
          sale_portion_segment_type: sale_portion_segment_type || null,
          sale_portion_segment_detail: sale_portion_segment_detail || null,
        }
      : {
          acquisition_budget_cad: acquisition_budget ? Number(acquisition_budget) : null,
          growth_stage: growth_stage || null,
          target_provinces: target_geography,
          target_products,
          acquisition_timeline: acquisition_timeline || null,
        }

  const detailsRow: Record<string, unknown> = { profile_id: userId, ...details }
  if (account_type === 'corporation') detailsRow.entity_name = entity_name

  const { error: detailsError } = await supabase
    .from(detailsTable)
    .insert(detailsRow)

  if (detailsError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: detailsError.message }, { status: 500 })
  }

  // 5. If calculator mode, save book revenue + valuation
  if (role === 'seller' && valuation_method === 'calculator') {
    const revenue = {
      life:             life_revenue ? Number(life_revenue) : 0,
      disability:       disability_revenue ? Number(disability_revenue) : 0,
      critical_illness: ci_revenue ? Number(ci_revenue) : 0,
      health:           health_revenue ? Number(health_revenue) : 0,
      seg_funds:        seg_funds_revenue ? Number(seg_funds_revenue) : 0,
    }

    const { data: revenueRow, error: revErr } = await supabase
      .from('agora_book_revenue')
      .insert({
        profile_id: userId,
        life_insurance:       revenue.life || null,
        disability_insurance: revenue.disability || null,
        critical_illness:     revenue.critical_illness || null,
        health_benefits:      revenue.health || null,
        seg_funds:            revenue.seg_funds || null,
        total_policies:  total_policies_v ? Number(total_policies_v) : null,
        active_policies: active_policies_v ? Number(active_policies_v) : null,
        willing_to_stay,
      })
      .select()
      .single()

    if (!revErr && revenueRow) {
      const { low_value, high_value } = calculateValuation(
        revenue,
        total_policies_v ? Number(total_policies_v) : null,
        active_policies_v ? Number(active_policies_v) : null,
        willing_to_stay
      )
      await supabase.from('agora_valuations').insert({
        profile_id: userId,
        book_revenue_id: revenueRow.id,
        low_value,
        high_value,
        source: 'self_reported',
      })
    }
  }

  // 6. Send the confirmation email ourselves via Resend.
  const hashedToken = linkData.properties?.hashed_token
  if (hashedToken) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/agora/auth/confirm?token_hash=${hashedToken}&type=signup`
      await resend.emails.send({
        from: 'Agora <notifications@klarum.ca>',
        to: email,
        subject: 'Confirm your email to finish setting up Agora',
        react: ConfirmSignup({ name, confirmUrl }),
      })
    } catch (emailErr) {
      console.error('Agora confirmation email send failed:', emailErr)
    }
  }

  return NextResponse.json({ ok: true })
}
