// src/components/common/Logo/Logo.tsx

import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.scss';
import { LogoProps } from '@/models/Logo/LogoProps';


export default function Logo({ className = '', width = 70, height = 60 }: LogoProps) {
  return (
    <Link href="/" className={`${styles.logoLink} ${className}`} aria-label="خانه کارنیکس">
      <Image
        src="/brand/carnix-horizontal.svg"
        alt="لوگوی فروشگاه قطعات خودرو"
        width={width}
        height={height}
        className={styles.logoImage}
      />
    </Link>
  );
}
