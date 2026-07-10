// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMailer } from '@/lib/email/mailer';

export const GET = async () => {
  const [dbOk, brevoOk] = await Promise.all([
    prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    verifyMailer(),
  ]);

  const healthy = dbOk && brevoOk;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks: {
        database: dbOk ? 'ok' : 'error',
        brevo: brevoOk ? 'ok' : 'error',
      },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
};