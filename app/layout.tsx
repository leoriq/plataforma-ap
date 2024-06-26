import '~/styles/globals.scss'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import { Roboto_Slab } from 'next/font/google'
import { Montserrat } from 'next/font/google'

const roboto_slab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--roboto-slab',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--montserrat',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={`${montserrat.variable} ${roboto_slab.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>

        <meta name="mobile-web-app-capable" content="yes"></meta>
      </head>
      <body>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
