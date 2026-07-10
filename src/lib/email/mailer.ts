import 'server-only';
import nodemailer, { Transporter } from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

// ─── Singleton transporter ────────────────────────────────────────────────────

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    // Gmail requires this
    tls: {
      rejectUnauthorized: env.NODE_ENV === 'production',
    },
  });

  return _transporter;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

// ─── Send ─────────────────────────────────────────────────────────────────────

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

    // In development, log the Nodemailer preview URL if using Ethereal
    if (env.NODE_ENV === 'development' && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info({ previewUrl }, '📧 Preview email');
        console.log('\n📧 Email Preview URL:', previewUrl, '\n');
      }
    }
  } catch (err: any) {
    logger.error(
      { err: err.message, code: err.code, to, subject: params.subject },
      'Failed to send email',
    );
    throw err;
  }
}

// ─── Health check ─────────────────────────────────────────────────────────────

export async function verifyMailer(): Promise<boolean> {
  try {
    await getTransporter().verify();
    logger.info('SMTP connection verified ✓');
    return true;
  } catch (err: any) {
    logger.error({ err: err.message }, 'SMTP connection failed');
    return false;
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}