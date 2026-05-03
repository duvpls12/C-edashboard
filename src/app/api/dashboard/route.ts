import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { buildDashboardData } from '@/lib/calculations'
import { PAYMENT_LINKS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 })
  }

  const stripe = new Stripe(key, { apiVersion: '2024-06-20' })

  const rawPayments: {
    id: string
    created: number
    amount: number
    metadata: Record<string, string>
    payment_link: string | null
  }[] = []

  for (const plinkId of Object.keys(PAYMENT_LINKS)) {
    let hasMore = true
    let startingAfter: string | undefined = undefined

    while (hasMore) {
      const params: Stripe.Checkout.SessionListParams = {
        payment_link: plinkId,
        limit: 100,
      }
      if (startingAfter) params.starting_after = startingAfter

      const page = await stripe.checkout.sessions.list(params)

      for (const session of page.data) {
        if (session.payment_status === 'paid' && session.amount_total) {
          rawPayments.push({
            id: session.id,
            created: session.created,
            amount: session.amount_total,
            metadata: (session.metadata ?? {}) as Record<string, string>,
            payment_link: plinkId,
          })
        }
      }

      hasMore = page.has_more
      if (page.data.length > 0) {
        startingAfter = page.data[page.data.length - 1].id
      } else {
        hasMore = false
      }
    }
  }

  const data = buildDashboardData(rawPayments)
  return NextResponse.json(data)
}
