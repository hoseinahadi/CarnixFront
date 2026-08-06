// src/app/(auth)/verify-otp/page.tsx
import { Suspense } from 'react';
import OtpVerificationContent from './OtpVerificationContent';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <OtpVerificationContent />
    </Suspense>
  );
}