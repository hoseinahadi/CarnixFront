'use client';

import {
  type FormEvent,
  useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { useAppDispatch } from '@/store/hooks';
import {
  sendOtpThunk,
} from '@/store/feature/auth/authThunks';

import styles from './Login.module.scss';

const getRejectedMessage = (
  error: unknown,
  fallbackMessage: string,
): string =>
  typeof error === 'string' && error.trim()
    ? error
    : fallbackMessage;

/*
 * فقط Redirect داخلی سایت مجاز است.
 *
 * مثال معتبر:
 * /cart?step=2
 *
 * مواردی مثل:
 * https://example.com
 * //example.com
 *
 * پذیرفته نمی‌شوند تا Open Redirect نداشته باشیم.
 */
const getSafeCallbackUrl = (
  callbackUrl: string | null,
): string => {
  if (!callbackUrl) {
    return '/';
  }

  const normalized =
    callbackUrl.trim();

  if (
    !normalized.startsWith('/') ||
    normalized.startsWith('//')
  ) {
    return '/';
  }

  return normalized;
};

export default function Login() {
  const [phoneNumber, setPhoneNumber] =
    useState('');

  const [localError, setLocalError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedPhoneNumber =
      phoneNumber.trim();

    if (
      !/^09[0-9]{9}$/.test(
        normalizedPhoneNumber,
      )
    ) {
      setLocalError(
        'شماره موبایل معتبر نیست.',
      );

      return;
    }

    setLocalError('');
    setLoading(true);

    try {
      await dispatch(
        sendOtpThunk({
          phoneNumber:
            normalizedPhoneNumber,
        }),
      ).unwrap();

      /*
       * callbackUrl را از URL فعلی Login می‌گیریم.
       *
       * مثال:
       *
       * /login?callbackUrl=/cart?step=2
       *
       * و به صفحه OTP منتقل می‌کنیم.
       */
      const currentSearchParams =
        new URLSearchParams(
          window.location.search,
        );

      const callbackUrl =
        getSafeCallbackUrl(
          currentSearchParams.get(
            'callbackUrl',
          ),
        );

      const verifyParams =
        new URLSearchParams();

      verifyParams.set(
        'phone',
        normalizedPhoneNumber,
      );

      verifyParams.set(
        'callbackUrl',
        callbackUrl,
      );

      router.push(
        `/verify-otp?${verifyParams.toString()}`,
      );
    } catch (error: unknown) {
      setLocalError(
        getRejectedMessage(
          error,
          'ارسال کد تأیید انجام نشد.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <h1
            className={
              styles.logoTitleDesktop
            }
          >
            قطعه فروش
          </h1>

          <h1
            className={
              styles.logoTitleMobile
            }
          >
            کارنیکس
          </h1>

          <p className={styles.subtitle}>
            ورود به سایت
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <p
            className={
              styles.instructionText
            }
          >
            لطفاً شماره موبایل خود را وارد کنید
          </p>

          <div
            className={
              styles.formGroup
            }
          >
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              className={styles.input}
              value={phoneNumber}
              onChange={(event) => {
                setPhoneNumber(
                  event.target.value,
                );

                if (localError) {
                  setLocalError('');
                }
              }}
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              dir="ltr"
              required
              autoFocus
              disabled={loading}
              maxLength={11}
            />
          </div>

          {localError && (
            <div
              role="alert"
              className={
                styles.errorMessage
              }
            >
              {localError}
            </div>
          )}

          <button
            type="submit"
            className={
              styles.submitButton
            }
            disabled={loading}
          >
            {loading ? (
              <Loader2
                size={20}
                className={
                  styles.spinner
                }
              />
            ) : (
              'ادامه'
            )}
          </button>
        </form>

        <div
          className={
            styles.termsFooter
          }
        >
          ورود به منزله پذیرش{' '}
          <Link
            href="/terms"
            className={
              styles.boldLink
            }
          >
            قوانین و مقررات
          </Link>{' '}
          است.
        </div>
      </div>
    </div>
  );
}