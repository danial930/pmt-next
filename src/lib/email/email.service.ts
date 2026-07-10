import 'server-only';
import { sendMail } from './mailer';
import { renderTemplate } from './template-renderer';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

export class EmailService {
  private static formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    }).format(date);
  }

  /**
   * Sends account verification email after registration
   */
  async sendVerificationEmail(params: {
    to: string;
    firstName: string;
    verifyToken: string;
  }): Promise<void> {
    const verifyUrl = `${env.APP_URL}/verify-email?token=${params.verifyToken}`;

    const html = renderTemplate({
      template: 'verify-email',
      subject: 'Verify your email address',
      recipientEmail: params.to,
      data: {
        firstName: params.firstName,
        verifyUrl,
      },
    });

    await sendMail({
      to: params.to,
      subject: 'Verify your email address — UMS',
      html,
    });
  }

  /**
   * Sends welcome email after successful email verification
   */
  async sendWelcomeEmail(params: {
    to: string;
    firstName: string;
  }): Promise<void> {
    const html = renderTemplate({
      template: 'welcome',
      subject: 'Welcome to UMS!',
      recipientEmail: params.to,
      data: {
        firstName: params.firstName,
        email: params.to,
        loginUrl: `${env.APP_URL}/login`,
        verifiedAt: EmailService.formatDateTime(new Date()),
      },
    });

    await sendMail({
      to: params.to,
      subject: 'Welcome to UMS — account verified ✓',
      html,
    });
  }

  /**
   * Sends password reset link email
   */
  async sendPasswordResetEmail(params: {
    to: string;
    firstName: string;
    resetToken: string;
  }): Promise<void> {
    const resetUrl = `${env.APP_URL}/reset-password?token=${params.resetToken}`;

    const html = renderTemplate({
      template: 'reset-password',
      subject: 'Reset your password',
      recipientEmail: params.to,
      data: {
        firstName: params.firstName,
        resetUrl,
      },
    });

    await sendMail({
      to: params.to,
      subject: 'Reset your UMS password',
      html,
    });
  }

  /**
   * Security notification: password was changed
   */
  async sendPasswordChangedEmail(params: {
    to: string;
    firstName: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const html = renderTemplate({
      template: 'password-changed',
      subject: 'Your password was changed',
      recipientEmail: params.to,
      data: {
        firstName: params.firstName,
        changedAt: EmailService.formatDateTime(new Date()),
        ipAddress: params.ipAddress ?? 'Unknown',
        userAgent: params.userAgent ?? 'Unknown device',
        loginUrl: `${env.APP_URL}/login`,
        resetUrl: `${env.APP_URL}/forgot-password`,
      },
    });

    await sendMail({
      to: params.to,
      subject: 'Your UMS password was changed',
      html,
    });
  }

  /**
   * Security notification: account locked due to failed attempts
   */
  async sendAccountLockedEmail(params: {
    to: string;
    firstName: string;
    failedAttempts: number;
    lockedUntil: Date;
    ipAddress?: string;
  }): Promise<void> {
    const html = renderTemplate({
      template: 'account-locked',
      subject: 'Account temporarily locked',
      recipientEmail: params.to,
      data: {
        firstName: params.firstName,
        failedAttempts: params.failedAttempts,
        lockedAt: EmailService.formatDateTime(new Date()),
        unlocksAt: EmailService.formatDateTime(params.lockedUntil),
        ipAddress: params.ipAddress ?? 'Unknown',
        resetUrl: `${env.APP_URL}/forgot-password`,
      },
    });

    await sendMail({
      to: params.to,
      subject: 'Your UMS account has been temporarily locked',
      html,
    });
  }
}

// Singleton
export const emailService = new EmailService();