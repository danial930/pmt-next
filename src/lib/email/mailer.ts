import 'server-only';
import nodemailer, { Transporter } from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const isProd = env.NODE_ENV === 'production';

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,

    // false = STARTTLS on port 587 (starts plain, upgrades to encrypted)
    // true  = immediate SSL on port 465
    // We use 587 + STARTTLS as the standard across all environments
    secure: env.SMTP_SECURE,

    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },

    tls: {
      // true in production: reject fake/invalid/expired SSL certificates
      // false in development: ignore cert issues caused by local proxies or antivirus
      rejectUnauthorized: isProd,

      // Never negotiate below TLS 1.2 in any environment
      minVersion: 'TLSv1.2',
    },

    // Never silently fall back to plaintext if STARTTLS upgrade fails
    // Without this, nodemailer sends credentials unencrypted if TLS negotiation fails
    requireTLS: true,

    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return _transporter;
}

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail(params: SendMailParams): Promise<void> {
  const transporter = getTransporter();
  const to = Array.isArray(params.to) ? params.to.join(', ') : params.to;

  try {
    const info = await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
      to,
      subject: params.subject,
      html: params.html,
      text: params.text ?? stripHtml(params.html),
      ...(params.replyTo && { replyTo: params.replyTo }),
    });

    logger.info(
      { messageId: info.messageId, to, subject: params.subject },
      'Email sent',
    );
  } catch (err: any) {
    logger.error(
      { err: err.message, code: err.code, to, subject: params.subject },
      'Failed to send email',
    );
    throw err;
  }
}

export async function verifyMailer(): Promise<boolean> {
  try {
    await getTransporter().verify();
    logger.info('SMTP connection verified');
    return true;
  } catch (err: any) {
    logger.error({ err: err.message }, 'SMTP connection failed');
    return false;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}