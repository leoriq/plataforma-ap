'use client'

import { SessionProvider } from 'next-auth/react'
import { ModalProvider } from '~/contexts/ModalContext'

interface Props {
  children: React.ReactNode
}

export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <ModalProvider>{children}</ModalProvider>
    </SessionProvider>
  )
}
