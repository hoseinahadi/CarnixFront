'use client';

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { Loader2 } from 'lucide-react';

import VehicleSelect from '@/features/vehicle/components/VehicleSelect';

import type {
  RegisterRequest,
} from '@/models/auth/RegisterRequest';

import { useAppDispatch } from '@/store/hooks';
import {
  registerThunk,
} from '@/store/feature/auth/authThunks';

import styles from './Register.module.scss';

interface RegisterFormState {
  firstName: string;
  lastName: string;
  email: string;
  car: string;
}

const getRejectedMessage = (
  error: unknown,
  fallbackMessage: string,
): string =>
  typeof error === 'string' && error.trim()
    ? error
    : fallbackMessage;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const phoneNumber =
    searchParams.get('phone')?.trim() ?? '';

  const [formData, setFormData] =
    useState<RegisterFormState>({
      firstName: '',
      lastName: '',
      email: '',
      car: '',
    });

  const [loading, setLoading] =
    useState(false);

  const [localError, setLocalError] =
    useState('');

  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/login');
    }
  }, [phoneNumber, router]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previousState) => ({
      ...previousState,
      [name]: value,
    }));

    if (localError) {
      setLocalError('');
    }
  };

  const handleCarChange = (
    car: string,
  ) => {
    setFormData((previousState) => ({
      ...previousState,
      car,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const firstName =
      formData.firstName.trim();
    const lastName =
      formData.lastName.trim();

    if (!firstName || !lastName) {
      setLocalError(
        'لطفاً نام و نام خانوادگی را وارد کنید.',
      );
      return;
    }

    setLoading(true);
    setLocalError('');

    const payload: RegisterRequest = {
      userName: phoneNumber,
      phoneNumber,
      name: firstName,
      family: lastName,
      email:
        formData.email.trim() || undefined,
      password: phoneNumber,
      confirmPassword: phoneNumber,
      roleName: 'User',
      car: formData.car || undefined,
    };

    try {
      const result = await dispatch(
        registerThunk(payload),
      ).unwrap();

      if (
        result.token ||
        result.accessToken
      ) {
        router.replace('/');
        return;
      }

      router.replace('/login');
    } catch (error: unknown) {
      setLocalError(
        getRejectedMessage(
          error,
          'ثبت‌نام انجام نشد.',
        ),
      );
    } finally {
      setLoading(false);
    }
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
            تکمیل اطلاعات
          </p>

          <p className={styles.mobileHint}>
            لطفاً اطلاعات کاربری خود را تکمیل کنید
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.row}>
            <input
              type="text"
              name="firstName"
              className={styles.input}
              placeholder="نام"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
              autoComplete="given-name"
            />

            <input
              type="text"
              name="lastName"
              className={styles.input}
              placeholder="نام خانوادگی"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
              autoComplete="family-name"
            />
          </div>

          <input
            type="email"
            name="email"
            className={styles.input}
            placeholder="ایمیل (اختیاری)"
            value={formData.email}
            onChange={handleChange}
            dir="ltr"
            disabled={loading}
            autoComplete="email"
          />

          <VehicleSelect
            value={formData.car}
            onChange={handleCarChange}
            placeholder="انتخاب خودرو (اختیاری)"
            disabled={loading}
          />

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
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <Loader2
                size={20}
                className={styles.spinner}
              />
            ) : (
              'تکمیل و ارسال'
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push('/')
            }
            className={styles.skipBtn}
            disabled={loading}
          >
            بعداً تکمیل می‌کنم
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterContent;
