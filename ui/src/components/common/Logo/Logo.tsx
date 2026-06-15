// src/components/common/Logo/Logo.tsx

import Image from 'next/image';
import Link from 'next/link';
import logoImg from '@/assets/images/logo.png'; // مسیر عکس لوگو
import styles from './Logo.module.scss';
import { LogoProps } from '@/models/Logo/LogoProps';


export default function Logo({ className = '', width = 70, height = 60 }: LogoProps) {
  return (
    // لینک به صفحه اصلی
    <Link href="/" className={`${styles.logoLink} ${className}`}>
      <Image
        src={logoImg}
        alt="لوگوی فروشگاه قطعات خودرو"
        width={width}
        height={height}
        priority // لود سریع
        className={styles.logoImage}
      />
    </Link>
  );
}
