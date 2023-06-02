import styles from './coordinator.module.css'
import { type NextPage } from 'next'

const Login: NextPage = () => {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>Oi coord!</div>
        </div>
      </main>
    </>
  )
}

export default Login
