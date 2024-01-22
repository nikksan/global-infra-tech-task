import { ParameterizedContext } from 'koa';
import { RESTError, RESTErrors } from './RESTErrors';
import { TypeGuardError } from 'typia';
import DomainValidationError from '@domain/errors/DomainValidationError';
import EntityNotFoundError from '@application/errors/EntityNotFoundError';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import { Logger } from '@infrastructure/logger/Logger';

export default abstract class RESTController {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  protected sendData(ctx: ParameterizedContext, data: unknown): void {
    ctx.body = { data, error: null };
    ctx.status = 200;
  }

  protected sendError(ctx: ParameterizedContext, error: RESTError): void {
    ctx.body = { data: null, error };
    ctx.status = error.status;
  }

  protected handleError(ctx: ParameterizedContext, err: Error): void {
    if (err instanceof TypeGuardError) {
      const path = (err.path as string).replace('$input.', '');
      const meta = { [path]: `Expected ${err.expected}, received: ${err.value}` };
      return this.sendError(ctx, { ...RESTErrors.VALIDATION, meta });
    }

    if (err instanceof DomainValidationError) {
      const meta = { [err.path]: `Expected ${err.expectation}, received: ${err.getHumanReadableValue()}` };
      return this.sendError(ctx, { ...RESTErrors.VALIDATION, meta });
    }

    if (err instanceof EntityNotFoundError) {
      return this.sendError(ctx, RESTErrors.NOT_FOUND);
    }

    this.logger.warn('Failed to map error:', err);
    this.sendError(ctx, RESTErrors.GENERAL);
  }
}
