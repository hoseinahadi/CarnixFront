'use client'; // اضافه شدن این خط برای Next.js (App Router) الزامی است

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // استفاده از روتر نکست
import Link from 'next/link'; // استفاده از کامپوننت لینک نکست

// Thunk مربوط به لاگین را import کنید (مسیر را بر اساس پروژه خود تنظیم کنید)
import { loginThunk } from '@/store/feature/auth/authThunks'; 

// تایپ‌های مربوط به Redux Store
import { RootState, AppDispatch } from '@/store'; 

// استایل‌های ماژولار
import styles from './Login.module.scss';

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // نمونه‌سازی روتر نکست

  // خواندن وضعیت احراز هویت، لودینگ و خطا از استور Redux
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // استیت‌های محلی برای مدیریت مقادیر فرم
  const [userName, setuserName] = useState(''); // ایمیل یا شماره موبایل
  const [password, setPassword] = useState('');

  // اگر کاربر قبلاً لاگین کرده باشد، به داشبورد (یا صفحه اصلی) هدایت می‌شود
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/'); // استفاده از متد push در روتر نکست
    }
  }, [isAuthenticated, router]);

  // مدیریت ارسال فرم
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userName || !password) {
      return;
    }
    
    // فراخوانی thunk برای انجام عملیات لاگین
    dispatch(loginThunk({ userName, password }));
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <h2 className={styles.title}>ورود به حساب کاربری</h2>
        <p className={styles.subtitle}>برای دسترسی به پنل خود، وارد شوید.</p>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* نمایش خطای بازگشتی از API */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="userName" className={styles.label}>
              ایمیل یا شماره موبایل
            </label>
            <input
              type="text"
              id="userName"
              className={styles.input}
              value={userName}
              onChange={(e) => setuserName(e.target.value)}
              placeholder="example@email.com"
              required
              disabled={loading}
              dir="ltr" // برای تایپ راحت‌تر ایمیل و شماره
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              رمز عبور
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              dir="ltr"
            />
          </div>

          <div className={styles.linksContainer}>
            {/* در نکست از href به جای to استفاده می‌شود */}
            <Link href="/forgot-password" className={styles.link}>
              فراموشی رمز عبور
            </Link>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <div className={styles.registerPrompt}>
          حساب کاربری ندارید؟{' '}
          <Link href="/register" className={styles.link}>
            ثبت‌نام کنید
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
