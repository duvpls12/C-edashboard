import {
  PAYMENT_LINKS,
  PRODUCT_BREAKDOWN,
  STRIPE_FEE_RATE,
  type SaleLine,
  type ProductStats,
  type DashboardData,
} from './types'

interface RawPayment {
  id: string
  created: number
  amount: number // cents
  metadata: Record<string, string>
  payment_link: string | null
}

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

interface Splits {
  stripeFee: number
  net: number
  lutNet: number
  presetNet: number
  blueprintNet: number
  david: number
  josh: number
  jacob: number
}

function computeSplits(gross: number, plinkId: string | null): Splits {
  const stripeFee = r2(gross * STRIPE_FEE_RATE)
  const net = r2(gross - stripeFee)

  if (!plinkId || !PRODUCT_BREAKDOWN[plinkId]) {
    return { stripeFee, net, lutNet: 0, presetNet: 0, blueprintNet: 0, david: 0, josh: 0, jacob: 0 }
  }

  const bd = PRODUCT_BREAKDOWN[plinkId]

  // Proportional allocation of net to each revenue type
  const rawLut = r2((bd.lut / gross) * net)
  const rawPreset = r2((bd.preset / gross) * net)
  const rawBlueprint = r2((bd.blueprint / gross) * net)

  // Absorb any cent rounding remainder into LUT (the largest component)
  const lutNet = r2(net - rawPreset - rawBlueprint)
  const presetNet = rawPreset
  const blueprintNet = rawBlueprint

  // LUT 50/50 David / Josh
  const davidLut = r2(lutNet / 2)
  const joshLut = r2(lutNet - davidLut)

  // Blueprint 50/50 David / Josh
  const davidBlueprint = r2(blueprintNet / 2)
  const joshBlueprint = r2(blueprintNet - davidBlueprint)

  // Preset: Jacob 80%, David 10%, Josh 10%
  const jacobPreset = r2(presetNet * 0.8)
  const davidPreset = r2(presetNet * 0.1)
  const joshPreset = r2(presetNet - jacobPreset - davidPreset)

  return {
    stripeFee,
    net,
    lutNet,
    presetNet,
    blueprintNet,
    david: r2(davidLut + davidBlueprint + davidPreset),
    josh: r2(joshLut + joshBlueprint + joshPreset),
    jacob: jacobPreset,
  }
}

export function buildDashboardData(payments: RawPayment[]): DashboardData {
  const salesLog: SaleLine[] = []

  const productMap: Record<string, ProductStats> = {}
  for (const plinkId of Object.keys(PAYMENT_LINKS)) {
    productMap[plinkId] = {
      paymentLinkId: plinkId,
      name: PAYMENT_LINKS[plinkId].name,
      units: 0,
      gross: 0,
      stripeFee: 0,
      net: 0,
      lutNet: 0,
      presetNet: 0,
      blueprintNet: 0,
    }
  }

  let totalGross = 0
  let totalNet = 0
  let totalUnits = 0
  let totalStripeFees = 0

  let davidTotal = 0
  let davidLutTotal = 0
  let davidBlueprintTotal = 0
  let davidPresetTotal = 0

  let joshTotal = 0
  let joshLutTotal = 0
  let joshBlueprintTotal = 0
  let joshPresetTotal = 0

  let jacobTotal = 0
  let jacobPresetTotal = 0

  for (const p of payments) {
    const gross = r2(p.amount / 100)
    const plinkId = p.payment_link
    const isUnknown = !plinkId || !PAYMENT_LINKS[plinkId]
    const productName = isUnknown ? 'Unknown' : PAYMENT_LINKS[plinkId!].name
    const splits = computeSplits(gross, isUnknown ? null : plinkId)

    salesLog.push({
      id: p.id,
      date: new Date(p.created * 1000).toISOString().split('T')[0],
      product: productName,
      paymentLinkId: plinkId ?? null,
      isUnknown,
      gross,
      stripeFee: splits.stripeFee,
      net: splits.net,
      david: splits.david,
      josh: splits.josh,
      jacob: splits.jacob,
    })

    totalGross = r2(totalGross + gross)
    totalNet = r2(totalNet + splits.net)
    totalUnits += 1
    totalStripeFees = r2(totalStripeFees + splits.stripeFee)

    if (!isUnknown && plinkId) {
      const ps = productMap[plinkId]
      ps.units += 1
      ps.gross = r2(ps.gross + gross)
      ps.stripeFee = r2(ps.stripeFee + splits.stripeFee)
      ps.net = r2(ps.net + splits.net)
      ps.lutNet = r2(ps.lutNet + splits.lutNet)
      ps.presetNet = r2(ps.presetNet + splits.presetNet)
      ps.blueprintNet = r2(ps.blueprintNet + splits.blueprintNet)
    }

    const bd = !isUnknown && plinkId ? PRODUCT_BREAKDOWN[plinkId] : null
    const lutNet = splits.lutNet
    const presetNet = splits.presetNet
    const blueprintNet = splits.blueprintNet

    const davidLut = bd ? r2(lutNet / 2) : 0
    const joshLut = bd ? r2(lutNet - davidLut) : 0
    const davidBlueprint = bd ? r2(blueprintNet / 2) : 0
    const joshBlueprint = bd ? r2(blueprintNet - davidBlueprint) : 0
    const jacobPreset = bd ? r2(presetNet * 0.8) : 0
    const davidPreset = bd ? r2(presetNet * 0.1) : 0
    const joshPreset = bd ? r2(presetNet - jacobPreset - davidPreset) : 0

    davidTotal = r2(davidTotal + splits.david)
    davidLutTotal = r2(davidLutTotal + davidLut)
    davidBlueprintTotal = r2(davidBlueprintTotal + davidBlueprint)
    davidPresetTotal = r2(davidPresetTotal + davidPreset)

    joshTotal = r2(joshTotal + splits.josh)
    joshLutTotal = r2(joshLutTotal + joshLut)
    joshBlueprintTotal = r2(joshBlueprintTotal + joshBlueprint)
    joshPresetTotal = r2(joshPresetTotal + joshPreset)

    jacobTotal = r2(jacobTotal + splits.jacob)
    jacobPresetTotal = r2(jacobPresetTotal + jacobPreset)
  }

  salesLog.sort((a, b) => b.date.localeCompare(a.date))

  return {
    lastSynced: new Date().toISOString(),
    totalGross,
    totalNet,
    totalUnits,
    totalStripeFees,
    products: Object.values(productMap),
    payouts: {
      david: { name: 'David Eby', total: davidTotal, lutShare: davidLutTotal, blueprintShare: davidBlueprintTotal, presetCommission: davidPresetTotal },
      josh: { name: 'Josh Cohen', total: joshTotal, lutShare: joshLutTotal, blueprintShare: joshBlueprintTotal, presetCommission: joshPresetTotal },
      jacob: { name: 'Jacob', total: jacobTotal, lutShare: 0, blueprintShare: 0, presetCommission: jacobPresetTotal },
    },
    salesLog,
  }
}
