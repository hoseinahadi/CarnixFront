import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.scss';
import { IconBrandLinkedin, IconBrandTelegram, IconBrandInstagram, IconPhone } from '@tabler/icons-react';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* بخش بالایی: لینک‌ها و توضیحات */}
        <div className={styles.topSection}>
          
          {/* ستون اول: درباره فروشگاه */}
          <div className={styles.aboutCol}>
            <h3 className={styles.brandName}>کارنیکس</h3>
            <p className={styles.description}>
              نمایندگی مستقیم محصولات ایساکو و فروش قطعات همه محصولات ایران خودرو با بهترین قیمت  
            </p>
            <div className={styles.enamad}>
              <Image 
                src="/images/enamad.png" 
                alt="نماد اعتماد الکترونیک" 
                width={75} 
                height={75} 
              />
            </div>
          </div>

          {/* گروه ستون‌های لینک برای موبایل */}
          <div className={styles.linksGroup}>
            {/* ستون دوم: دسته‌بندی‌ها */}
            <div className={styles.linksCol}>
              <h4 className={styles.listTitle}>دسته‌بندی‌ها</h4>
              <ul>
                <li><Link href="/category/lent">لنت</Link></li>
                <li><Link href="/category/gearbox">گیربکس</Link></li>
                <li><Link href="/category/engine">موتور</Link></li>
                <li><Link href="/category/body">بدنه</Link></li>
              </ul>
            </div>

            {/* ستون سوم: ماشین‌ها */}
            <div className={styles.linksCol}>
              <h4 className={styles.listTitle}>خودروها</h4>
              <ul>
                <li><Link href="/cars/206">پژو ۲۰۶</Link></li>
                <li><Link href="/cars/207">پژو ۲۰۷</Link></li>
                <li><Link href="/cars/runna">رانا</Link></li>
                <li><Link href="/cars/dena">دنا</Link></li>
              </ul>
            </div>

            {/* ستون چهارم: سایر بخش‌ها */}
            <div className={styles.linksCol}>
              <h4 className={styles.listTitle}>دسترسی سریع</h4>
              <ul>
                <li><Link href="/rules">قوانین و مقررات</Link></li>
                <li><Link href="/privacy">حریم خصوصی</Link></li>
                <li><Link href="/about">درباره ما</Link></li>
                <li><Link href="/faq">سوالات متداول</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* بخش پایینی: کپی رایت، تلفن و شبکه‌های اجتماعی */}
        <div className={styles.bottomSection}>
          <div className={styles.phoneBox}>
            <IconPhone size={20} />
            <span>تلفن پشتیبانی:</span>
            <a href="tel:02112345678" dir="ltr" className={styles.phoneNumber}>
              ۰۲۱ - ۱۲۳۴۵۶۷۸
            </a>
          </div>
          
          <div className={styles.socials}>
            <a href="#" aria-label="لینکدین">
              <IconBrandLinkedin size={22} />
            </a>
            <a href="#" aria-label="تلگرام">
              <IconBrandTelegram size={22} />
            </a>
            <a href="#" aria-label="اینستاگرام">
              <IconBrandInstagram size={22} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;