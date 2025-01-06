import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Document Processing System',
  description: 'Process cadastre documents efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}