import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FreshMart - Your Online Supermarket',
  description: 'Shop groceries, perfumes, electronics and more at FreshMart',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
