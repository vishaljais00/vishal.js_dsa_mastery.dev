import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { LoggerService } from './logger.service';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    if (process.env['SMTP_HOST'] && process.env['SMTP_USER']) {
      const cleanPass = (process.env['SMTP_PASS'] || '').replace(/["'\s]/g, '');
      this.transporter = nodemailer.createTransport({
        host: process.env['SMTP_HOST'],
        port: Number(process.env['SMTP_PORT']) || 587,
        secure: Number(process.env['SMTP_PORT']) === 465,
        requireTLS: true,
        auth: {
          user: process.env['SMTP_USER'],
          pass: cleanPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      } catch {
        this.transporter = nodemailer.createTransport({
          jsonTransport: true
        });
      }
    }

    return this.transporter;
  }

  private static getTemplateContent(templateName: string, replacements: { [key: string]: string }): string {
    const primaryPath = path.join(__dirname, '..', 'templates', templateName);
    const fallbackPath = path.join(process.cwd(), 'src', 'templates', templateName);

    let html = '';
    if (fs.existsSync(primaryPath)) {
      html = fs.readFileSync(primaryPath, 'utf8');
    } else if (fs.existsSync(fallbackPath)) {
      html = fs.readFileSync(fallbackPath, 'utf8');
    } else {
      html = `<div>Welcome / Reset notification for ${replacements['username'] || 'User'}</div>`;
    }

    for (const [key, val] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }
    return html;
  }

  // 1. Welcome Email on User Registration
  public static async sendWelcomeEmail(toEmail: string, username: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      const htmlContent = this.getTemplateContent('welcome-email.html', { username, email: toEmail });
      
      const senderEmail = process.env['SMTP_USER'] || 'welcome@jsdsamastery.dev';
      const info = await transporter.sendMail({
        from: `"JS DSA Mastery" <${senderEmail}>`,
        to: toEmail,
        subject: `🚀 Welcome to 30-Day JS DSA Mastery, ${username}!`,
        html: htmlContent
      });
      LoggerService.logSuccess('EMAIL_SERVICE', `Welcome email sent to ${toEmail} (${info.messageId || 'sent'})`);
    } catch (err: any) {
      LoggerService.logEmailError('WELCOME_EMAIL', toEmail, err);
    }
  }

  // 2. Forgot Password OTP Email
  public static async sendPasswordResetOTP(toEmail: string, username: string, otpCode: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      const htmlContent = this.getTemplateContent('reset-otp-email.html', { username, otpCode });

      const senderEmail = process.env['SMTP_USER'] || 'security@jsdsamastery.dev';
      const info = await transporter.sendMail({
        from: `"JS DSA Security" <${senderEmail}>`,
        to: toEmail,
        subject: `🔑 Password Reset Code: ${otpCode}`,
        html: htmlContent
      });
      LoggerService.logSuccess('EMAIL_SERVICE', `Password reset OTP sent to ${toEmail} (${info.messageId || 'sent'})`);
    } catch (err: any) {
      LoggerService.logEmailError('RESET_OTP_EMAIL', toEmail, err);
    }
  }

  // 3. Password Reset Confirmation Email
  public static async sendPasswordResetConfirmation(toEmail: string, username: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      const htmlContent = this.getTemplateContent('reset-confirmation-email.html', { username });

      const senderEmail = process.env['SMTP_USER'] || 'security@jsdsamastery.dev';
      const info = await transporter.sendMail({
        from: `"JS DSA Security" <${senderEmail}>`,
        to: toEmail,
        subject: `✅ Password Reset Successful - JS DSA Mastery`,
        html: htmlContent
      });
      LoggerService.logSuccess('EMAIL_SERVICE', `Password reset confirmation email sent to ${toEmail} (${info.messageId || 'sent'})`);
    } catch (err: any) {
      LoggerService.logEmailError('RESET_CONFIRMATION_EMAIL', toEmail, err);
    }
  }
}
