'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResetPassword } from '@/frontend/hooks/useAuth';
import { Input } from '@/frontend/components/ui/Input';
import { Button } from '@/frontend/components/ui/Button';
import { Alert } from '@/frontend/components/ui/Alert';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { mutate: resetPassword, isPending, isError, error } = useResetPassword();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.newPassword) errs.newPassword = 'Password is required';
    else if (form.newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.newPassword)) errs.newPassword = 'Must contain an uppercase letter';
    else if (!/[^A-Za-z0-9]/.test(form.newPassword)) errs.newPassword = 'Must contain a special character';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = () => {
    if (!token) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    resetPassword({ token, newPassword: form.newPassword });
  };

  const apiError = error as any;
  const errorMessage =
    apiError?.response?.data?.error?.message ?? 'Password reset failed. The link may have expired.';

  if (!token) {
    return (
      <Alert type="error">
        Invalid or missing reset token. Please{' '}
        <Link href="/forgot-password" className="font-semibold underline">
          request a new link
        </Link>.
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Set new password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      {isError && (
        <Alert type="error" className="mb-5">
          {errorMessage}
        </Alert>
      )}

      <div className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="••••••••"
          value={form.newPassword}
          onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
          error={fieldErrors.newPassword}
          required
          autoFocus
          autoComplete="new-password"
          hint="Min 8 characters, uppercase, number and special character"
          showToggle
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          error={fieldErrors.confirmPassword}
          required
          autoComplete="new-password"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          showToggle
        />

        <Button fullWidth loading={isPending} onClick={handleSubmit} size="lg">
          {isPending ? 'Resetting…' : 'Reset password'}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}