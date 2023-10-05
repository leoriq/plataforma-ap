'use client'

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function SignOutHelper() {
  function signOutAndRedirect() {
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    signOutAndRedirect()
  }, [])

  return <></>
}
