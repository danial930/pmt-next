'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLogin } from '@/frontend/hooks/useAuth';
import { Input } from '@/frontend/components/ui/Input';
import { Button } from '@/frontend/components/ui/Button';
import { Alert } from '@/frontend/components/ui/Alert';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { mutate: login, isPending, error, isError } = useLogin();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const justRegistered = searchParams.get('registered') === 'true';
  const justReset = searchParams.get('reset') === 'true';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    login({ email: form.email, password: form.password });
  };

  const apiError = error as any;
  const errorMessage =
    apiError?.response?.data?.error?.message ?? 'Something went wrong. Please try again.';

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      {justRegistered && (
        <Alert type="success" className="mb-5">
          Account created! Check your email to verify your account, then sign in.
        </Alert>
      )}

      {justReset && (
        <Alert type="success" className="mb-5">
          Password reset successfully. You can now sign in with your new password.
        </Alert>
      )}

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
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          error={fieldErrors.email}
          required
          autoComplete="email"
          autoFocus
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            showToggle
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button fullWidth loading={isPending} onClick={handleSubmit} size="lg">
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
          Create one
        </Link>
      </p>
    </>
  );
}