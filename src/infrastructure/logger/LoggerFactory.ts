import { Config } from '@config/Config';
import ConsoleLogger from './ConsoleLogger';
import { Logger } from './Logger';

export enum LogImplementation {
  Console = 'console'
}

class LoggerFactory {
  constructor(
    private config: Config['log'],
    private globalPrefix = '',
  ) { }

  create(prefix: string): Logger {
    switch (this.config.impl) {
      case LogImplementation.Console:
        return new ConsoleLogger(this.config.level, prefix, this.globalPrefix);
    }
  }
}

export default LoggerFactory;
