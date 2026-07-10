// src/lib/email/startup-check.ts
import 'server-only';
import { verifyMailer } from './mailer';
import { logger } from '@/lib/logger';

export async function runStartupChecks(): Promise<void> {
  const smtpOk = await verifyMailer();
  if (!smtpOk) {
    logger.warn('⚠ SMTP connection failed — emails will not be sent');
  }
}