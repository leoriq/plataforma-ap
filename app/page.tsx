import styles from "./page.module.css";
import { type NextPage } from "next";
import LoginForm from "./components/LoginForm";

const Home: NextPage = () => {
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
  );
};

export default Home;
