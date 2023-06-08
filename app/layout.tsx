import '~/styles/globals.css'
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
