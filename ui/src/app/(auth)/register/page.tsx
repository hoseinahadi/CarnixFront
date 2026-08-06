// src/app/(auth)/register/page.tsx
import { Suspense } from 'react';
import RegisterContent from './RegisterContent';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <RegisterContent />
    </Suspense>
  );
}