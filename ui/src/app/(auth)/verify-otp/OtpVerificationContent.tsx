'use client';

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { useAppDispatch } from '@/store/hooks';
import {
  sendOtpThunk,
  verifyOtpThunk,
} from '@/store/feature/auth/authThunks';

import styles from './OtpVerification.module.scss';

const OTP_LENGTH = 5;
const RESEND_SECONDS = 92;

const getRejectedMessage = (
  error: unknown,
  fallbackMessage: string,
): string =>
  typeof error === 'string' && error.trim()
    ? error
    : fallbackMessage;

export default function OtpVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const phoneNumber =
    searchParams.get('phone')?.trim() ?? '';

  const [otp, setOtp] = useState<string[]>(
    Array.from(
      { length: OTP_LENGTH },
      () => '',
    ),
  );

  const [timer, setTimer] = useState(
    RESEND_SECONDS,
  );

  const [loading, setLoading] =
    useState(false);

  const [localError, setLocalError] =
    useState('');

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);

  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/login');
    }
  }, [phoneNumber, router]);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => {
        setTimer((previousTimer) =>
          previousTimer > 0
            ? previousTimer - 1
            : 0,
        );
      },
      1_000,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleChange = (
    index: number,
    value: string,
  ) => {
    const normalizedValue = value
      .replace(/\D/g, '')
      .slice(-1);

    const nextOtp = [...otp];
    nextOtp[index] = normalizedValue;
    setOtp(nextOtp);
    setLocalError('');

    if (
      normalizedValue &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === 'Backspace' &&
      otp[index] === '' &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  const handleResend = async () => {
    if (
      loading ||
      timer > 0 ||
      !phoneNumber
    ) {
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      await dispatch(
        sendOtpThunk({ phoneNumber }),
      ).unwrap();

      setOtp(
        Array.from(
          { length: OTP_LENGTH },
          () => '',
        ),
      );
      setTimer(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      setLocalError(
        getRejectedMessage(
          error,
          'ارسال مجدد کد انجام نشد.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      setLocalError(
        'کد تأیید را کامل وارد کنید.',
      );
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      const result = await dispatch(
        verifyOtpThunk({
          phoneNumber,
          code,
        }),
      ).unwrap();

      if (result.isRegistered) {
        router.replace('/');
        return;
      }

      router.replace(
        `/register?phone=${encodeURIComponent(
          phoneNumber,
        )}`,
      );
    } catch (error: unknown) {
      setLocalError(
        getRejectedMessage(
          error,
          'کد تأیید اشتباه است.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (
    value: number,
  ): string => {
    const minutes = Math.floor(
      value / 60,
    );
    const seconds = value % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`.replace(
      /\d/g,
      (digit) =>
        '۰۱۲۳۴۵۶۷۸۹'[
          Number(digit)
        ],
    );
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1
            className={styles.titleDesktop}
          >
            قطعه فروش
          </h1>

          <h1
            className={styles.titleMobile}
          >
            کارنیکس
          </h1>

          <p className={styles.subtitle}>
            تأیید شماره تماس
          </p>
        </div>

        <div className={styles.phoneInfo}>
          <span>
            کد تأیید به شماره{' '}
            <span dir="ltr">
              {phoneNumber}
            </span>{' '}
            ارسال شد
          </span>

          <button
            type="button"
            onClick={() =>
              router.push('/login')
            }
            className={styles.editBtn}
          >
            ویرایش شماره
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div
            className={styles.otpContainer}
            dir="ltr"
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] =
                    element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={
                  index === 0
                    ? 'one-time-code'
                    : 'off'
                }
                maxLength={1}
                className={styles.otpInput}
                value={digit}
                onChange={(event) =>
                  handleChange(
                    index,
                    event.target.value,
                  )
                }
                onKeyDown={(event) =>
                  handleKeyDown(
                    index,
                    event,
                  )
                }
                autoFocus={index === 0}
                disabled={loading}
                aria-label={`رقم ${
                  index + 1
                } کد تأیید`}
              />
            ))}
          </div>

          {localError && (
            <div
              role="alert"
              className={
                styles.errorMessage
              }
              style={{ marginTop: '10px' }}
            >
              {localError}
            </div>
          )}

          <div className={styles.timer}>
            {timer > 0 ? (
              `ارسال مجدد کد ${formatTime(
                timer,
              )}`
            ) : (
              <button
                type="button"
                className={
                  styles.resendBtn
                }
                onClick={() => {
                  void handleResend();
                }}
                disabled={loading}
              >
                ارسال مجدد کد
              </button>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={
              otp.join('').length <
                OTP_LENGTH || loading
            }
          >
            {loading ? (
              <Loader2
                size={20}
                className={styles.spinner}
              />
            ) : (
              'تأیید'
            )}
          </button>
        </form>

        <Link href="/login">
          بازگشت به ورود
        </Link>
      </div>
    </div>
  );
}
