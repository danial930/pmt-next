'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/frontend/hooks/useAuth';
import { Input } from '@/frontend/components/ui/Input';
import { Button } from '@/frontend/components/ui/Button';
import { Alert } from '@/frontend/components/ui/Alert';

const PASSWORD_RULES = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const { mutate: register, isPending, isError, error } = useRegister();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (PASSWORD_RULES.some((r) => !r.test(form.password)))
      errs.password = 'Password does not meet all requirements';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    register({
      email: form.email,
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    });
  };

  const apiError = error as any;
  const errorMessage =
    apiError?.response?.data?.error?.message ?? 'Registration failed. Please try again.';

  const allRulesMet = PASSWORD_RULES.every((r) => r.test(form.password));

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Create an account</h2>
        <p className="text-sm text-gray-500 mt-1">Get started with UMS today</p>
      </div>

      {isError && (
        <Alert type="error" className="mb-5">
          {errorMessage}
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Jane"
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            error={fieldErrors.firstName}
            required
            autoFocus
          />
          <Input
            label="Last name"
            placeholder="Doe"
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            error={fieldErrors.lastName}
            required
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          error={fieldErrors.email}
          required
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            onFocus={() => setShowPasswordHints(true)}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
            showToggle
          />

          {/* Password strength hints */}
          {showPasswordHints && form.password && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {PASSWORD_RULES.map((rule) => {
                const met = rule.test(form.password);
                return (
                  <span
                    key={rule.label}
                    className={`text-xs flex items-center gap-1 transition-colors ${
                      met ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <span>{met ? '✓' : '○'}</span>
                    {rule.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
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
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
          Sign in
        </Link>
      </p>
    </>
  );
}