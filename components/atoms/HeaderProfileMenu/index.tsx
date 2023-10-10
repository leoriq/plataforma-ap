'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { User } from 'next-auth'

import styles from './HeaderProfileMenu.module.scss'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import useOnClickOut from '~/utils/useOnClickOut'

interface Props {
  user: User
}

export default function HeaderProfileMenu({ user }: Props) {
  const [isActive, setIsActive] = useState(false)
  const firstName = user.fullName?.split(' ')[0]

  const iconClass = [styles.icon, isActive ? styles.active : ''].join(' ')
  const menuClass = [styles.menu, isActive ? styles.active : ''].join(' ')

  const ref = useRef(null)
  useOnClickOut(ref, () => setIsActive(false))

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/login' })
  }, [])

  return (
    <div ref={ref} className={styles.container}>
      <button
        className={styles.profileContainer}
        onClick={() => setIsActive(!isActive)}
      >
        {!!user.profilePictureFileId && (
          <Image
            src={`/api/upload?id=${user.profilePictureFileId}`}
            alt="Profile Picture"
            width={40}
            height={40}
            className={styles.profilePicture}
          />
        )}

        <p>Hi, {firstName}!</p>

        <div className={iconClass}>
          <div className={styles.left} />
          <div className={styles.right} />
        </div>
      </button>

      <div className={menuClass}>
        <Link className={styles.menuItem} href="/profile">
          My Profile
        </Link>
        <button className={styles.menuItem} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
