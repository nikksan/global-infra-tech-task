import { randomBytes } from 'node:crypto';

export default class IdGenerator {
  static generate(): string {
    return randomBytes(12).toString('hex');
  }
}
