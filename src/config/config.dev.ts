import { LogImplementation } from '@infrastructure/logger/LoggerFactory';
import { Config } from './Config';
import { LogLevel } from '@infrastructure/logger/Logger';
import { parseEnum, parseNumber, parseString } from './env-parsers';
import { config as loadDotEnvConfig } from 'dotenv';

loadDotEnvConfig();

const config: Config = {
  log: {
    impl: parseEnum<LogImplementation>('LOG_IMPL', Object.values(LogImplementation), LogImplementation.Console),
    level: parseEnum<LogLevel>('LOG_LEVEL', Object.values(LogLevel), LogLevel.Debug),
  },
  rest: {
    port: parseNumber('REST_SERVER_PORT', 3000),
    enableDocs: true,
  },
  grpc: {
    port: parseNumber('GRPC_SERVER_PORT', 3001),
    host: parseString('GRPC_SERVER_HOST', 'localhost'),
  },
  mongo: {
    user: parseString('MONGO_USER'),
    pass: parseString('MONGO_PASS'),
    db: parseString('MONGO_DB'),
    host: parseString('MONGO_HOST'),
    port: parseNumber('MONGO_PORT', 27017),
    authSource: parseString('MONGO_AUTH_SOURCE', 'admin'),
  },
};

export default config;
