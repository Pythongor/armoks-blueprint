import { Cards } from "./Cards/Cards";
import { Description } from "./Description/Description";
import { Footer } from "./Footer/Footer";
import { Header } from "./Header/Header";
import styles from "./page.module.scss";

export function StartPage() {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <Header />
        <Description />
        <Cards />
        <Footer />
      </div>
    </div>
  );
}
