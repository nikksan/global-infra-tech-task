export const parseString = (field: string, defaultValue?: string): string => {
  const value = process.env[field];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new TypeError(`Passing ${field} from env is required!`);
  }

  return value;
};

export const parseNumber = (field: string, defaultValue?: number): number => {
  const value = process.env[field];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new TypeError(`Passing ${field} from env is required!`);
  }

  const valueAsNumber = Number(value);
  if (isNaN(valueAsNumber)) {
    throw new TypeError(`Failed to parse ${field} with value ${value} as number!`);
  }

  return valueAsNumber;
};

export const parseEnum = <T>(field: string, allowedValues: Array<string>, defaultValue?: T): T => {
  const value = process.env[field];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new TypeError(`Passing ${field} from env is required!`);
  }

  if (!allowedValues.includes(value)) {
    throw new TypeError(`Failed to parse ${field} with value ${value}, must be one of ${allowedValues}!`);
  }

  return value as T;
};

export const parseBoolean = (field: string, defaultValue?: boolean): boolean => {
  const value = process.env[field];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new TypeError(`Passing ${field} from env is required!`);
  }

  if (!['true', 'false'].includes(value)) {
    throw new TypeError(`Failed to parse ${field} with value ${value} as boolean!`);
  }

  return value === 'true';
};
