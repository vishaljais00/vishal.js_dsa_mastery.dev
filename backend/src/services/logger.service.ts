import fs from 'fs';
import path from 'path';

export class LoggerService {
  private static logDir = path.join(process.cwd(), 'logs');

  private static ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  public static logEmailError(type: string, recipient: string, error: any) {
    this.ensureLogDir();

    const timestamp = new Date().toISOString();
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';

    const logEntry = `[${timestamp}] ❌ [EMAIL_ERROR] Type: ${type} | To: ${recipient}\nError: ${errorMsg}\n${stack ? `Stack: ${stack}\n` : ''}${'-'.repeat(80)}\n`;

    // Write to console with red formatting
    console.error(`\x1b[31m[EmailLogger] ${timestamp} - Failed to send ${type} to ${recipient}: ${errorMsg}\x1b[0m`);

    // Write to persistent email-errors.log file
    const logFilePath = path.join(this.logDir, 'email-errors.log');
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) console.error('Failed to append to email-errors.log:', err);
    });
  }

  public static logInfo(category: string, message: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️ [${category}] ${message}`);
  }

  public static logSuccess(category: string, message: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ [${category}] ${message}`);
  }
}
