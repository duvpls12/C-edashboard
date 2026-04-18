export const PAYMENT_LINKS: Record<string, { name: string; price: number }> = {
  plink_1TNbu2DL2JerfYFMaPKogSQ5: { name: 'The Tools', price: 59.99 },
  plink_1TNbxhDL2JerfYFMPzBVcfGZ: { name: 'The Tools + Preset', price: 75.98 },
  plink_1TNc6ODL2JerfYFMlg1eHgRg: { name: 'Preset Only', price: 19.99 },
  plink_1TNbuIDL2JerfYFM71CJYlAz: { name: 'The Tools & The Blueprint', price: 99.99 },
  plink_1TNbxmDL2JerfYFMdXx74Jfb: { name: 'The Tools & The Blueprint + Preset', price: 115.98 },
}

// Price breakdown per product
export const PRODUCT_BREAKDOWN: Record<string, { lut: number; preset: number; blueprint: number }> = {
  plink_1TNbu2DL2JerfYFMaPKogSQ5: { lut: 59.99, preset: 0, blueprint: 0 },
  plink_1TNbxhDL2JerfYFMPzBVcfGZ: { lut: 59.99, preset: 15.99, blueprint: 0 },
  plink_1TNc6ODL2JerfYFMlg1eHgRg: { lut: 0, preset: 19.99, blueprint: 0 },
  plink_1TNbuIDL2JerfYFM71CJYlAz: { lut: 59.99, preset: 0, blueprint: 40.00 },
  plink_1TNbxmDL2JerfYFMdXx74Jfb: { lut: 59.99, preset: 15.99, blueprint: 40.00 },
}

export const STRIPE_FEE_RATE = 0.03

export interface SaleLine {
  id: string
  date: string
  product: string
  paymentLinkId: string | null
  isUnknown: boolean
  gross: number
  stripeFee: number
  net: number
  david: number
  josh: number
  jacob: number
}

export interface ProductStats {
  paymentLinkId: string
  name: string
  units: number
  gross: number
  stripeFee: number
  net: number
  lutNet: number
  presetNet: number
  blueprintNet: number
}

export interface PayoutSummary {
  name: string
  total: number
  lutShare: number
  blueprintShare: number
  presetCommission: number
}

export interface DashboardData {
  lastSynced: string
  totalGross: number
  totalNet: number
  totalUnits: number
  totalStripeFees: number
  products: ProductStats[]
  payouts: { david: PayoutSummary; josh: PayoutSummary; jacob: PayoutSummary }
  salesLog: SaleLine[]
}
