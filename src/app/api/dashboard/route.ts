import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { buildDashboardData } from '@/lib/calculations'

export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 })
  }

  const stripe = new Stripe(key, { apiVersion: '2024-06-20' })

  const payments: Stripe.PaymentIntent[] = []
  let hasMore = true
  let startingAfter: string | undefined = undefined

  while (hasMore) {
    const params: Stripe.PaymentIntentListParams = {
      limit: 100,
    }
    if (startingAfter) params.starting_after = startingAfter

    const page = await stripe.paymentIntents.list(params)

    for (const pi of page.data) {
      if (pi.status === 'succeeded') {
        payments.push(pi)
      }
    }

    hasMore = page.has_more
    if (page.data.length > 0) {
      startingAfter = page.data[page.data.length - 1].id
    } else {
      hasMore = false
    }
  }

  const rawPayments = payments.map((pi) => ({
    id: pi.id,
    created: pi.created,
    amount: pi.amount,
    metadata: pi.metadata as Record<string, string>,
    payment_link: ((pi as unknown) as Record<string, unknown>).payment_link as string | null ?? null,
  }))

  const data = buildDashboardData(rawPayments)
  return NextResponse.json(data)
}
