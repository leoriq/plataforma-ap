import styles from './login.module.css'
import { type NextPage } from 'next'
import LoginForm from '~/app/login/components/LoginForm'

const Login: NextPage = () => {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>
            <LoginForm />
          </div>
        </div>
      </main>
    </>
  )
}

export default Login
