import { NextRequest, NextResponse } from 'next/server'
import { calculateValuation } from '@/lib/valuation'

export async function POST(req: NextRequest) {
  const { revenue, total_policies, active_policies, willing_to_stay } = await req.json()

  if (!revenue || typeof revenue !== 'object') {
    return NextResponse.json({ error: 'Revenue data is required.' }, { status: 400 })
  }

  const totalRevenue = Object.values(revenue as Record<string, number>).reduce(
    (sum, v) => sum + (Number(v) > 0 ? Number(v) : 0),
    0
  )
  if (totalRevenue === 0) {
    return NextResponse.json({ error: 'Enter revenue in at least one product line.' }, { status: 400 })
  }

  const { low_value, high_value } = calculateValuation(
    revenue,
    total_policies ?? null,
    active_policies ?? null,
    Boolean(willing_to_stay)
  )

  return NextResponse.json({ low_value, high_value, source: 'self_reported' })
}
