'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function SignOutHelper() {
  function signOutAndRedirect() {
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    signOutAndRedirect()
  }, [])

  return <></>
}
