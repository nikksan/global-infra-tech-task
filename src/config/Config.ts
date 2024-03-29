import { LogLevel } from '@infrastructure/logger/Logger';
import { LogImplementation } from '@infrastructure/logger/LoggerFactory';

export interface Config {
  log: {
    impl: LogImplementation;
    level: LogLevel;
  };
  rest: {
    port: number;
    enableDocs: boolean,
  };
  grpc: {
    port: number,
    host: string,
  },
  mongo: {
    user: string,
    pass: string,
    db: string,
    host: string,
    port: number,
    authSource: string,
  },
}
