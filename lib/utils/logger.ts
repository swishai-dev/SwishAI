type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private format(level: LogLevel, message: string, context?: any) {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message} ${context ? JSON.stringify(context) : ''}`;
  }

  info(message: string, context?: any) {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: any) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: any) {
    console.error(this.format('error', message, context));
  }

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.format('debug', message, context));
    }
  }
}

const logger = new Logger();
export default logger;
