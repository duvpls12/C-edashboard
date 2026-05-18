'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DashboardData, SaleLine, ProductStats, PayoutSummary } from '@/lib/types'
import { SETTLEMENTS, settledFor } from '@/lib/settlements'

function usd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #C9A84C',
        padding: '24px 28px',
        flex: '1 1 200px',
        minWidth: '200px',
      }}
    >
      <div style={{ color: '#888', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: '28px',
          fontWeight: 600,
          color: accent ? '#C9A84C' : '#ffffff',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function PayoutCard({ payout, recipientKey }: { payout: PayoutSummary; recipientKey: 'david' | 'josh' | 'jacob' }) {
  const settled = settledFor(recipientKey)
  const outstanding = Math.max(0, payout.total - settled)

  const earningsRows = [
    { label: 'LUT Share', value: payout.lutShare },
    { label: 'Blueprint Share', value: payout.blueprintShare },
    { label: 'Preset Commission', value: payout.presetCommission },
  ]

  return (
    <div style={{ background: '#111111', border: '1px solid #C9A84C', padding: '24px 28px', flex: '1 1 260px', minWidth: '260px' }}>
      <div style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
        Payout
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '18px' }}>
        {payout.name}
      </div>

      {/* Total Earned */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Total Earned</div>
        <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '26px', fontWeight: 600, color: '#C9A84C', lineHeight: 1 }}>
          {usd(payout.total)}
        </div>
      </div>

      {/* Earnings breakdown */}
      <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {earningsRows.map((r) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#555', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>{r.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '12px', color: r.value > 0 ? '#aaa' : '#2a2a2a' }}>
              {usd(r.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Settlement status */}
      {settled > 0 && (
        <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#4a7c59', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>Settled / Credited</span>
            <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '12px', color: '#4a9e6a' }}>
              -{usd(settled)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#888', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Outstanding</span>
            <span style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '13px', color: outstanding > 0 ? '#ffffff' : '#4a9e6a', fontWeight: 600 }}>
              {outstanding > 0 ? usd(outstanding) : 'Paid'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function SettlementHistory() {
  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#666',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    borderBottom: '1px solid #1E1E1E',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '11px 14px',
    borderBottom: '1px solid #0F0F0F',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '13px',
    color: '#fff',
  }

  const nameMap: Record<string, string> = { david: 'David Eby', josh: 'Josh Cohen', jacob: 'Jacob' }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111111', border: '1px solid #1E1E1E' }}>
        <thead>
          <tr>
            {['Date', 'Recipient', 'Amount', 'Note'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SETTLEMENTS.map((s, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                {s.date}
                <span style={{ color: '#444', marginLeft: '8px', fontSize: '11px' }}>{s.time}</span>
              </td>
              <td style={{ ...tdStyle, fontFamily: 'Inter, sans-serif', color: '#C9A84C' }}>{nameMap[s.recipient]}</td>
              <td style={{ ...tdStyle, color: '#4a9e6a' }}>{usd(s.amount)}</td>
              <td style={{ ...tdStyle, fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#888' }}>{s.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductTable({ products }: { products: ProductStats[] }) {
  const cols: { label: string; key: keyof ProductStats | 'stripeFeeCol' }[] = [
    { label: 'Product', key: 'name' },
    { label: 'Units', key: 'units' },
    { label: 'Gross', key: 'gross' },
    { label: 'Stripe Fee', key: 'stripeFee' },
    { label: 'Net', key: 'net' },
    { label: 'LUT Net', key: 'lutNet' },
    { label: 'Preset Net', key: 'presetNet' },
    { label: 'Blueprint Net', key: 'blueprintNet' },
  ]

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#666',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    borderBottom: '1px solid #1E1E1E',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '11px 14px',
    borderBottom: '1px solid #141414',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '13px',
    color: '#fff',
  }

  const nameStyle: React.CSSProperties = {
    ...tdStyle,
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111111', border: '1px solid #1E1E1E' }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} style={thStyle}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.paymentLinkId} style={{ transition: 'background 0.1s' }}>
              <td style={nameStyle}>{p.name}</td>
              <td style={tdStyle}>{p.units}</td>
              <td style={tdStyle}>{usd(p.gross)}</td>
              <td style={{ ...tdStyle, color: '#C9A84C' }}>{p.units > 0 ? usd(p.stripeFee) : '—'}</td>
              <td style={tdStyle}>{p.units > 0 ? usd(p.net) : '—'}</td>
              <td style={tdStyle}>{p.units > 0 ? usd(p.lutNet) : '—'}</td>
              <td style={tdStyle}>{p.units > 0 ? usd(p.presetNet) : '—'}</td>
              <td style={tdStyle}>{p.units > 0 ? usd(p.blueprintNet) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SalesLogTable({ sales }: { sales: SaleLine[] }) {
  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#666',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    borderBottom: '1px solid #1E1E1E',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderBottom: '1px solid #0F0F0F',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: '12px',
    color: '#fff',
  }

  const labelStyle: React.CSSProperties = {
    ...tdStyle,
    fontFamily: 'Inter, sans-serif',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111111', border: '1px solid #1E1E1E' }}>
        <thead>
          <tr>
            {['Date', 'Product', 'Gross', 'Stripe Fee', 'Net', 'David', 'Josh', 'Jacob'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#444', padding: '32px' }}>
                No sales data
              </td>
            </tr>
          )}
          {sales.map((s) => (
            <tr key={s.id}>
              <td style={labelStyle}>{s.date}</td>
              <td style={{ ...labelStyle, color: s.isUnknown ? '#C9A84C' : '#fff' }}>
                {s.product}
                {s.isUnknown && (
                  <span style={{ marginLeft: '6px', fontSize: '10px', color: '#C9A84C', border: '1px solid #C9A84C', padding: '1px 5px', verticalAlign: 'middle' }}>
                    UNKNOWN
                  </span>
                )}
              </td>
              <td style={tdStyle}>{usd(s.gross)}</td>
              <td style={{ ...tdStyle, color: '#C9A84C' }}>{usd(s.stripeFee)}</td>
              <td style={tdStyle}>{usd(s.net)}</td>
              <td style={tdStyle}>{s.david > 0 ? usd(s.david) : '—'}</td>
              <td style={tdStyle}>{s.josh > 0 ? usd(s.josh) : '—'}</td>
              <td style={tdStyle}>{s.jacob > 0 ? usd(s.jacob) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{ width: '3px', height: '18px', background: '#C9A84C' }} />
      <h2 style={{ margin: 0, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
        {children}
      </h2>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const json: DashboardData = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const btnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    padding: '8px 20px',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'Inter, sans-serif',
    opacity: loading ? 0.5 : 1,
    transition: 'background 0.15s, color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '0' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#ffffff', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>
            C&amp;E Sales Dashboard
          </h1>
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#444', fontFamily: 'Inter, sans-serif' }}>
            Internal · David Eby &amp; Josh Cohen
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {data && (
            <div style={{ fontSize: '11px', color: '#444', fontFamily: "'JetBrains Mono', monospace" }}>
              Synced {new Date(data.lastSynced).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <button
            style={btnStyle}
            onClick={fetchData}
            disabled={loading}
            onMouseEnter={(e) => { if (!loading) { (e.target as HTMLButtonElement).style.background = '#C9A84C'; (e.target as HTMLButtonElement).style.color = '#0A0A0A' } }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.color = '#C9A84C' }}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '44px' }}>
        {error && (
          <div style={{ background: '#1A0A0A', border: '1px solid #6B2020', padding: '16px 20px', color: '#ff6b6b', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Error: {error}
          </div>
        )}

        {loading && !data && (
          <div style={{ color: '#444', fontSize: '13px', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '80px 0' }}>
            Loading…
          </div>
        )}

        {data && (
          <>
            {/* Row 1: Summary Cards */}
            <div>
              <SectionLabel>Overview</SectionLabel>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <StatCard label="Total Gross" value={usd(data.totalGross)} accent />
                <StatCard label="Total Net" value={usd(data.totalNet)} />
                <StatCard label="Units Sold" value={String(data.totalUnits)} />
                <StatCard label="Total Stripe Fees" value={usd(data.totalStripeFees)} />
              </div>
            </div>

            {/* Product Table */}
            <div>
              <SectionLabel>Products</SectionLabel>
              <ProductTable products={data.products} />
            </div>

            {/* Payout Cards */}
            <div>
              <SectionLabel>Payouts</SectionLabel>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <PayoutCard payout={data.payouts.david} recipientKey="david" />
                <PayoutCard payout={data.payouts.josh} recipientKey="josh" />
                <PayoutCard payout={data.payouts.jacob} recipientKey="jacob" />
              </div>
            </div>

            {/* Settlement History */}
            <div>
              <SectionLabel>Settlement History</SectionLabel>
              <SettlementHistory />
            </div>

            {/* Sales Log */}
            <div>
              <SectionLabel>Sales Log</SectionLabel>
              <SalesLogTable sales={data.salesLog} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
