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
  {
    date: '2026-05-28',
    time: '',
    recipient: 'jacob',
    amount: 27.92,
    note: 'Credit applied against balance owed to David for services',
  },
  {
    date: '2026-06-17',
    time: '',
    recipient: 'josh',
    amount: 168.34,
    note: 'Credit applied against balance owed to David — June invoice',
  },
]

export function settledFor(recipient: 'david' | 'josh' | 'jacob'): number {
  return SETTLEMENTS.filter((s) => s.recipient === recipient).reduce((sum, s) => sum + s.amount, 0)
}
