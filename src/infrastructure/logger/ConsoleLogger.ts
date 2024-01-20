/* eslint-disable no-console */
import { LogLevel, Logger, getLogLevelSeverity } from './Logger';

export default class ConsoleLogger implements Logger {
  constructor(
    private logLevel: LogLevel,
    private prefix: string,
    private globalPrefix: string,
  ) { }

  debug(...args: Array<unknown>): void {
    if (!this.shouldLogBasedOnLevel(LogLevel.Debug)) {
      return;
    }

    console.debug(this.getMessageMeta(LogLevel.Debug), ...args);
  }

  error(...args: Array<unknown>): void {
    if (!this.shouldLogBasedOnLevel(LogLevel.Error)) {
      return;
    }

    console.error(this.getMessageMeta(LogLevel.Error), ...args);
  }

  info(...args: Array<unknown>): void {
    if (!this.shouldLogBasedOnLevel(LogLevel.Info)) {
      return;
    }

    console.info(this.getMessageMeta(LogLevel.Info), ...args);
  }

  warn(...args: Array<unknown>): void {
    if (!this.shouldLogBasedOnLevel(LogLevel.Warn)) {
      return;
    }

    console.warn(this.getMessageMeta(LogLevel.Warn), ...args);
  }

  private shouldLogBasedOnLevel(attemptedToLogLevel: LogLevel) {
    return getLogLevelSeverity(attemptedToLogLevel) >= getLogLevelSeverity(this.logLevel);
  }

  protected getMessageMeta(logLevel: LogLevel): string {
    return `(${this.getFormattedTime()}) ${this.globalPrefix ? `[${this.globalPrefix}]` : ''} [${this.prefix}] [${logLevel.toUpperCase()}]`;
  }

  protected getFormattedTime(): string {
    const date = new Date();

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    const msec = String(date.getMilliseconds()).padStart(3, '0');

    return `${date.getFullYear()}/${month}/${day} ${hour}:${min}:${sec}.${msec}`;
  }
}
