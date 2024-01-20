import { Config } from './Config';
export const isTesting = process.env.NODE_ENV === 'test';
export const isStaging = process.env.NODE_ENV === 'staging';
export const isProduction = process.env.NODE_ENV === 'production';

export function loadConfig(): Config {
  let configPath: string;
  if (isTesting) {
    configPath = './config.test';
  } else if (isStaging) {
    configPath = './config.stage';
  } else if (isProduction) {
    configPath = './config.prod';
  } else {
    configPath = './config.dev';
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(configPath).default;
}
