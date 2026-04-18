import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'C&E Sales Dashboard',
  description: 'Internal sales dashboard for David Eby and Josh Cohen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
