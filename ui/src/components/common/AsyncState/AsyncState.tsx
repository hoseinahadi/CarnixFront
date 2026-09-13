import Link from 'next/link';
import styles from './AsyncState.module.scss';

type Props = {
  status: 'loading' | 'error' | 'empty';
  title: string;
  description?: string;
  onRetry?: () => void;
  actionHref?: string;
  actionLabel?: string;
};

export default function AsyncState({ status, title, description, onRetry, actionHref, actionLabel }: Props) {
  return (
    <section className={`${styles.root} ${styles[status]}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite" aria-busy={status === 'loading'}>
      {status === 'loading' && <span className={styles.spinner} aria-hidden="true" />}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <div className={styles.actions}>
        {onRetry && <button type="button" onClick={onRetry}>تلاش مجدد</button>}
        {actionHref && actionLabel && <Link href={actionHref}>{actionLabel}</Link>}
      </div>
    </section>
  );
}
