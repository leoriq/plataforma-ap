import { type MouseEventHandler, forwardRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import LogoSVG from '~/public/logos/light-key.svg'

import styles from './HeaderMobile.module.scss'

interface Props {
  onClickMenu: MouseEventHandler<HTMLButtonElement>
  isOpen: boolean
}

const HeaderMobile = forwardRef<HTMLDivElement, Props>(function HeaderMobile(
  { onClickMenu, isOpen },
  ref
) {
  return (
    <div ref={ref} className={styles.header}>
      <button
        className={isOpen ? styles.open : undefined}
        onClick={onClickMenu}
      >
        <div />
        <div />
        <div />
      </button>
      <div className={styles.home}>
        <Link href="/" className={styles.home}>
          <Image src={LogoSVG as string} alt="Logo" height={32} />
          <h1>ENG4U</h1>
        </Link>
      </div>
    </div>
  )
})

export default HeaderMobile
