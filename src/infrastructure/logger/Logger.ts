export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

const logLevelSeverity = Object.freeze([
  LogLevel.Debug,
  LogLevel.Info,
  LogLevel.Warn,
  LogLevel.Error,
]);

export const getLogLevelSeverity = (logLevel: LogLevel): number => logLevelSeverity.indexOf(logLevel) + 1;

export interface Logger {
  debug(...args: Array<unknown>): void;
  info(...args: Array<unknown>): void;
  warn(...args: Array<unknown>): void;
  error(...args: Array<unknown>): void;
}
