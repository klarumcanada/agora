export const PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
] as const

export const PROVINCE_LABELS: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba',
  NB: 'New Brunswick', NL: 'Newfoundland & Labrador', NS: 'Nova Scotia',
  NT: 'Northwest Territories', NU: 'Nunavut', ON: 'Ontario',
  PE: 'PEI', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
}

export const PRODUCTS = [
  'Life Insurance',
  'Disability Insurance',
  'Critical Illness',
  'Health & Benefits',
  'Segregated Funds',
] as const

export const CARRIER_AFFILIATIONS = [
  'Canada Life',
  'Sun Life',
  'Manulife',
  'iA Financial',
  'Desjardins',
  'Empire Life',
  'Equitable Life',
  'BMO Insurance',
  'RBC Insurance',
  'SSQ Insurance',
] as const

export const TIMELINES = [
  '0–6 months',
  '6–12 months',
  '1–2 years',
  'Flexible',
] as const
