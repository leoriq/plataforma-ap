import Link from 'next/link'
import Image from 'next/image'

import LogoSVG from '~/public/logos/light-key.svg'

import styles from './Header.module.scss'

export default function Header() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.home}>
        <Image src={LogoSVG as string} alt="Logo" height={48} />
        <h1>ENG4U</h1>
      </Link>
      <div className={styles.links}>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign Up</Link>
      </div>
    </nav>
  )
}
