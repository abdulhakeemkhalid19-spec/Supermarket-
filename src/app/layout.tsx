import type { Metadata } from 'next'
import 'import type { Metadata } from 'next'
import './globals.css'
import WhatsAppButton from '@/components/WhatsAppButton'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'FreshMart - Your Premium Online Supermarket',
  description: 'Shop groceries, perfumes, electronics and more at FreshMart',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{background: '#0a0a0a', color: '#f5f5f5', minHeight: '100vh'}}>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  )
}/globals.css'
import WhatsAppButton from '@/components/WhatsAppButton'

export const metadata: Metadata = {
  title: 'FreshMart - Your Premium Online Supermarket',
  description: 'Shop groceries, perfumes, electronics and more at FreshMart',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{background: '#0a0a0a', color: '#f5f5f5', minHeight: '100vh'}}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  )
}
