'use client'

import Link from 'next/link'
import Image from 'next/image'

import LogoSVG from '~/public/logos/light-key.svg'

import styles from './Header.module.scss'
import { User } from 'next-auth'
import { useSelectedLayoutSegment } from 'next/navigation'
import HeaderProfileMenu from '../../atoms/HeaderProfileMenu'

interface Props {
  user: User
  links?: {
    href: string
    title: string
  }[]
}

export default function Header({ user, links }: Props) {
  const currentSelected = useSelectedLayoutSegment()

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.home}>
        <Image src={LogoSVG as string} alt="Logo" height={40} />
        <h1>ENG4U</h1>
      </Link>
      <div className={styles.links}>
        {links?.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            className={
              link.href === currentSelected ? styles.active : undefined
            }
          >
            {link.title}
          </Link>
        ))}
      </div>

      <HeaderProfileMenu user={user} />
    </nav>
  )
}
