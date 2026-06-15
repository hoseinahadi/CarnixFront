// src/app/(shop)/page.tsx
import Home from "@/views/home/Home";
import styles from './page.module.scss'

export default function ShopPage() {
  return (
    <div className={styles.container}>
      <Home/>
    </div>
  );
}
