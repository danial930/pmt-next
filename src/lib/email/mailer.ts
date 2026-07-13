import 'server-only';
import nodemailer, { Transporter } from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const isProd = env.NODE_ENV === 'production';

//   _transporter = nodemailer.createTransport({
//   host: env.SMTP_HOST,
//   port: env.SMTP_PORT,
//   secure: false,   // must be false for port 587
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,  // fixes SSL validation in dev
//     minVersion: 'TLSv1.2',
//   },
//   requireTLS: true,            // force STARTTLS upgrade
//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
//   socketTimeout: 15000,
// });

 _transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,   // ← uses port 465 with immediate SSL, NOT port 587 + STARTTLS
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
      rejectUnauthorized: true,    // always verify certs in staging/prod
      minVersion: 'TLSv1.2',
    },
    requireTLS: true,
    pool: true,
    maxConnections: 5,
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