'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { User } from 'next-auth'

import styles from './SidebarProfileMenu.module.scss'

interface Props {
  user: User
}

export default function SidebarProfileMenu({ user }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const firstName = user.fullName?.split(' ')[0]

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/login' })
  }, [])

  const containerClass = [
    styles.container,
    isExpanded ? styles.expanded : undefined,
  ].join(' ')

  const imageUrl = useMemo(() => {
    if (user.profilePictureFileId) {
      return `/api/upload?id=${user.profilePictureFileId}`
    }

    return '/avatar-light.png'
  }, [user.profilePictureFileId])

  return (
    <div className={containerClass}>
      <button
        className={styles.userContainer}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt="Profile Picture"
            fill
            sizes="3rem"
            className={styles.profilePicture}
          />
        </div>

        <p>Hi, {firstName}!</p>
      </button>

      <div className={styles.menu}>
        <Link className={styles.menuItem} href="/auth/profile">
          My Profile
        </Link>
        <button className={styles.menuItem} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
