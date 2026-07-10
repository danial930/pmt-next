'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authService } from '@/frontend/services/auth.service';
import { Spinner } from '@/frontend/components/ui/Spinner';
import { Alert } from '@/frontend/components/ui/Alert';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing verification token.');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err?.response?.data?.error?.message ?? 'Verification failed. The link may have expired.',
        );
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <>
          <Spinner size="lg" className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Verifying your email…</h2>
          <p className="text-sm text-gray-500 mt-2">This will only take a moment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 text-3xl mb-4">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900">Email verified!</h2>
          <p className="text-sm text-gray-500 mt-2">
            Your account is now active. You can sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to sign in
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <Alert type="error" title="Verification failed" className="text-left mb-6">
            {errorMessage}
          </Alert>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Request a new verification link
          </Link>
        </>
      )}
    </div>
  );
}