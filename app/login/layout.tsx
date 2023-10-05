import Image from 'next/image'

import styles from './login-layout.module.scss'

import LogoSVG from '~/public/logos/light-key.svg'

export default function Login({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.main}>
      <div className={styles.welcome}>
        <Image src={LogoSVG as string} alt="Abrindo Portas" height={100} />
        <h1>Welcome to ENG4U!</h1>
      </div>

      <div className={styles.form}>{children}</div>
    </main>
  )
}
