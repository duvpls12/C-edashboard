export interface Settlement {
  date: string
  time: string
  recipient: 'david' | 'josh' | 'jacob'
  amount: number
  note: string
}

export const SETTLEMENTS: Settlement[] = [
  {
    date: '2026-05-18',
    time: '1:33 PM EST',
    recipient: 'josh',
    amount: 1497.28,
    note: 'Invoiced and applied as credit against balance owed to David',
  },
  {
    date: '2026-05-18',
    time: '1:33 PM EST',
    recipient: 'jacob',
    amount: 186.14,
    note: 'Invoiced and applied as credit against balance owed to David',
  },
]

export function settledFor(recipient: 'david' | 'josh' | 'jacob'): number {
  return SETTLEMENTS.filter((s) => s.recipient === recipient).reduce((sum, s) => sum + s.amount, 0)
}
