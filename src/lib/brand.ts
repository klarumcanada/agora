// Single source of truth for Agora's inline-style color tokens.
// Electric is Klarum's reserved accent — only use it for an explicit
// "Powered by Klarum" credit, never elsewhere in the product UI.
// danger/warning are desaturated placeholders pending a real answer from
// design (the brand toolkit doesn't define semantic error/warning colors).
export const BRAND = {
  midnight: '#0D1B3E',
  navy: '#1A3266',
  meadow: 'oklch(80% 0.28 145)',
  meadowText: 'oklch(50% 0.18 145)',
  ice: '#DBEAFE',
  chalk: '#F8F7F4',
  voltage: '#E8C547',
  electric: '#3B82F6',
  danger: '#9A5B52',
  warning: '#A98A4E',
} as const
