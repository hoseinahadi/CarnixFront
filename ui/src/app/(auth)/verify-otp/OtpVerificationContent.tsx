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

/*
 * فقط Redirect داخلی سایت مجاز است.
 *
 * معتبر:
 * /cart?step=2
 * /profile
 *
 * نامعتبر:
 * https://example.com
 * //example.com
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

export default function OtpVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const phoneNumber =
    searchParams.get('phone')?.trim() ?? '';

  /*
   * callbackUrl که از Login آمده:
   *
   * /verify-otp
   *   ?phone=0912...
   *   &callbackUrl=/cart?step=2
   */
  const callbackUrl =
    getSafeCallbackUrl(
      searchParams.get('callbackUrl'),
    );

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

  /*
   * لینک بازگشت به Login نیز callbackUrl
   * را حفظ می‌کند.
   */
  const loginUrl =
    `/login?callbackUrl=${encodeURIComponent(
      callbackUrl,
    )}`;

  useEffect(() => {
    if (!phoneNumber) {
      router.replace(loginUrl);
    }
  }, [
    phoneNumber,
    router,
    loginUrl,
  ]);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        setTimer(
          (previousTimer) =>
            Math.max(
              0,
              previousTimer - 1,
            ),
        );
      }, 1_000);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [timer]);

  const handleChange = (
    index: number,
    value: string,
  ) => {
    const normalizedValue =
      value
        .replace(/\D/g, '')
        .slice(-1);

    const nextOtp = [...otp];

    nextOtp[index] =
      normalizedValue;

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
    event:
      KeyboardEvent<HTMLInputElement>,
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
        sendOtpThunk({
          phoneNumber,
        }),
      ).unwrap();

      setOtp(
        Array.from(
          {
            length:
              OTP_LENGTH,
          },
          () => '',
        ),
      );

      setTimer(
        RESEND_SECONDS,
      );

      inputRefs.current[
        0
      ]?.focus();
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
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const code =
      otp.join('');

    if (
      code.length !==
      OTP_LENGTH
    ) {
      setLocalError(
        'کد تأیید را کامل وارد کنید.',
      );

      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      const result =
        await dispatch(
          verifyOtpThunk({
            phoneNumber,
            code,
          }),
        ).unwrap();

      /*
       * کاربر قبلاً ثبت‌نام شده است.
       *
       * دیگر همیشه به Home نمی‌رود.
       * اگر از Checkout آمده باشد،
       * به همان Checkout برمی‌گردد.
       */
      if (
        result.isRegistered
      ) {
        router.replace(
          callbackUrl,
        );

        return;
      }

      /*
       * کاربر جدید:
       *
       * phone + callbackUrl
       * هر دو به Register منتقل می‌شوند.
       */
      const registerParams =
        new URLSearchParams();

      registerParams.set(
        'phone',
        phoneNumber,
      );

      registerParams.set(
        'callbackUrl',
        callbackUrl,
      );

      router.replace(
        `/register?${registerParams.toString()}`,
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
    const minutes =
      Math.floor(
        value / 60,
      );

    const seconds =
      value % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(
        2,
        '0',
      )}`.replace(
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
    <div
      className={
        styles.authPage
      }
    >
      <div
        className={
          styles.authCard
        }
      >
        <div
          className={
            styles.header
          }
        >
          <h1
            className={
              styles.titleDesktop
            }
          >
            قطعه فروش
          </h1>

          <h1
            className={
              styles.titleMobile
            }
          >
            کارنیکس
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            تأیید شماره تماس
          </p>
        </div>

        <div
          className={
            styles.phoneInfo
          }
        >
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
              router.push(
                loginUrl,
              )
            }
            className={
              styles.editBtn
            }
            disabled={loading}
          >
            ویرایش شماره
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className={
            styles.form
          }
        >
          <div
            className={
              styles.otpContainer
            }
            dir="ltr"
          >
            {otp.map(
              (
                digit,
                index,
              ) => (
                <input
                  key={
                    index
                  }
                  ref={(
                    element,
                  ) => {
                    inputRefs.current[
                      index
                    ] =
                      element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={
                    index ===
                    0
                      ? 'one-time-code'
                      : 'off'
                  }
                  maxLength={
                    1
                  }
                  className={
                    styles.otpInput
                  }
                  value={
                    digit
                  }
                  onChange={(
                    event,
                  ) =>
                    handleChange(
                      index,
                      event
                        .target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) =>
                    handleKeyDown(
                      index,
                      event,
                    )
                  }
                  autoFocus={
                    index ===
                    0
                  }
                  disabled={
                    loading
                  }
                  aria-label={`رقم ${
                    index +
                    1
                  } کد تأیید`}
                />
              ),
            )}
          </div>

          {localError && (
            <div
              role="alert"
              className={
                styles.errorMessage
              }
              style={{
                marginTop:
                  '10px',
              }}
            >
              {localError}
            </div>
          )}

          <div
            className={
              styles.timer
            }
          >
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
                disabled={
                  loading
                }
              >
                ارسال مجدد کد
              </button>
            )}
          </div>

          <button
            type="submit"
            className={
              styles.submitBtn
            }
            disabled={
              otp.join('')
                .length <
                OTP_LENGTH ||
              loading
            }
          >
            {loading ? (
              <Loader2
                size={20}
                className={
                  styles.spinner
                }
              />
            ) : (
              'تأیید'
            )}
          </button>
        </form>

        <Link
          href={
            loginUrl
          }
        >
          بازگشت به ورود
        </Link>
      </div>
    </div>
  );
}