import { inspect } from 'node:util';

export default class DomainValidationError extends Error {
  constructor(
        public path: string,
        public value: unknown,
        public expectation: string,
  ) {
    super();
  }

  getHumanReadableValue(): string {
    return inspect(this.value);
  }
}
