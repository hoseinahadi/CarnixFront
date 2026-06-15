import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.scss';
// اگر از react-icons استفاده میکنید کامنت زیر را باز کنید:
// import { FaLinkedinIn, FaTelegramPlane, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* بخش بالایی: لینک‌ها و توضیحات */}
        <div className={styles.topSection}>
          
          {/* ستون اول: درباره فروشگاه */}
          <div className={styles.aboutCol}>
            <h3 className={styles.brandName}>
                کارنیکس 
                
            </h3>
            <p className={styles.description}>
             نمایندگی مستقیم محصولات ایساکو و فروش قطعات همه محصولات ایران خودرو با بهترین قیمت  
            </p>
            <div className={styles.enamad}>
              {/* جایگذاری تصویر نماد اعتماد */}
              <Image 
                src="/images/enamad.png" // مسیر عکس نماد در پوشه public خود را بدهید
                alt="نماد اعتماد الکترونیک" 
                width={80} 
                height={80} 
              />
            </div>
          </div>

          {/* ستون دوم: دسته‌بندی‌ها */}
          <div className={styles.linksCol}>
            <h4 className={styles.listTitle}>دسته بندی ها</h4>
            <ul>
              <li><Link href="/category/lent">لنت</Link></li>
              <li><Link href="/category/gearbox">گیربکس</Link></li>
              <li><Link href="/category/engine">موتور</Link></li>
              <li><Link href="/category/body">بدنه</Link></li>
            </ul>
          </div>

          {/* ستون سوم: ماشین‌ها */}
          <div className={styles.linksCol}>
            <h4 className={styles.listTitle}>ماشین ها</h4>
            <ul>
              <li><Link href="/cars/206">پژو ۲۰۶</Link></li>
              <li><Link href="/cars/207">پژو ۲۰۷</Link></li>
              <li><Link href="/cars/runna">رانا</Link></li>
              <li><Link href="/cars/dena">دنا</Link></li>
            </ul>
          </div>

          {/* ستون چهارم: سایر بخش‌ها */}
          <div className={styles.linksCol}>
            <h4 className={styles.listTitle}>سایر بخش ها</h4>
            <ul>
              <li><Link href="/rules">قوانین و مقررات</Link></li>
              <li><Link href="/privacy">حریم خصوصی</Link></li>
              <li><Link href="/about">درباره ما</Link></li>
              <li><Link href="/faq">سوالات متداول</Link></li>
            </ul>
          </div>

        </div>

        {/* بخش پایینی: کپی رایت، تلفن و شبکه‌های اجتماعی */}
        <div className={styles.bottomSection}>
          <div className={styles.phone}>
           ۰۲۱-۱۲۳۴۵۶۷۸ تلفن پشتیبانی : 
          </div>
          
          <div className={styles.socials}>
            <a href="#" aria-label="لینکدین">
              {/* <FaLinkedinIn /> */}
              <span>In</span>
            </a>
            <a href="#" aria-label="تلگرام">
              {/* <FaTelegramPlane /> */}
              <span>TG</span>
            </a>
            <a href="#" aria-label="اینستاگرام">
              {/* <FaInstagram /> */}
              <span>IG</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
