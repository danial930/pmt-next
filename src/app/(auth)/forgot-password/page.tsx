'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForgotPassword } from '@/frontend/hooks/useAuth';
import { Input } from '@/frontend/components/ui/Input';
import { Button } from '@/frontend/components/ui/Button';
import { Alert } from '@/frontend/components/ui/Alert';

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess, isError, error } = useForgotPassword();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = () => {
    if (!email) { setFieldError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setFieldError('Invalid email address'); return; }
    setFieldError('');
    forgotPassword(email);
  };

  const apiError = error as any;
  const errorMessage =
    apiError?.response?.data?.error?.message ?? 'Something went wrong. Please try again.';

  if (isSuccess) {
    return (
      <>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 text-2xl mb-4">
            ✉
          </div>
          <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
          <p className="text-sm text-gray-500 mt-2">
            If <span className="font-medium text-gray-700">{email}</span> is registered,
            you will receive a password reset link shortly.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-8 flex justify-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {isError && (
        <Alert type="error" className="mb-5">
          {errorMessage}
        </Alert>
      )}

      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError}
          required
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <Button fullWidth loading={isPending} onClick={handleSubmit} size="lg">
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remembered it?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
          Sign in
        </Link>
      </p>
    </>
  );
}