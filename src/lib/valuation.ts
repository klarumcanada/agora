const MULTIPLIERS = {
  life:             { low: 2.0, high: 3.0 },
  disability:       { low: 1.5, high: 2.5 },
  critical_illness: { low: 1.5, high: 2.0 },
  health:           { low: 1.0, high: 1.5 },
  seg_funds:        { low: 1.5, high: 2.0 },
} as const

type ProductKey = keyof typeof MULTIPLIERS

export function calculateValuation(
  revenue: Partial<Record<ProductKey, number>>,
  totalPolicies: number | null,
  activePolicies: number | null,
  willingToStay: boolean
): { low_value: number; high_value: number } {
  let weightedLow = 0
  let weightedHigh = 0
  let totalRevenue = 0

  for (const [product, amount] of Object.entries(revenue)) {
    const rev = Number(amount ?? 0)
    if (rev <= 0) continue
    const mult = MULTIPLIERS[product as ProductKey]
    if (!mult) continue
    totalRevenue += rev
    weightedLow += rev * mult.low
    weightedHigh += rev * mult.high
  }

  if (totalRevenue === 0) return { low_value: 0, high_value: 0 }

  let lowValue = weightedLow
  let highValue = weightedHigh

  if (totalPolicies && activePolicies && totalPolicies > 0) {
    const ratio = activePolicies / totalPolicies
    if (ratio >= 0.9) { lowValue *= 1.05; highValue *= 1.05 }
    else if (ratio < 0.7) { lowValue *= 0.9; highValue *= 0.9 }
  }

  if (willingToStay) highValue *= 1.1

  return {
    low_value: Math.round(lowValue),
    high_value: Math.round(highValue),
  }
}
