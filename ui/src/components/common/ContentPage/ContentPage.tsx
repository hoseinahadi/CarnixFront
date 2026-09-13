import type { ReactNode } from 'react';
import styles from './ContentPage.module.scss';

export default function ContentPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return <main className={styles.page} dir="rtl"><article className={styles.card}><h1>{title}</h1><p className={styles.lead}>{lead}</p>{children}</article></main>;
}
