type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: any) {
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: any) {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, context?: any) {
    console.error(this.formatMessage("error", message, context));
  }

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new Logger();

export class AppError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string = "INTERNAL_ERROR", statusCode: number = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
