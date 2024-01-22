import GRPCClient from '@infrastructure/grpc/GRPCClient';
import { Logger } from '@infrastructure/logger/Logger';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import { Next, ParameterizedContext } from 'koa';

export default class RESTRequestTrackingController {
  private logger: Logger;

  constructor(
    private grpcClient: GRPCClient,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  trackRequest = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const startTime = new Date();
    await next();
    const processTime = Date.now() - startTime.getTime();

    try {
      await this.grpcClient.callUnary('trackRequest', {
        date: startTime.toISOString(),
        endpoint: ctx.path,
        method: ctx.method,
        headers: JSON.stringify(ctx.request.headers),
        body: ['POST', 'PATCH', 'PUT'].includes(ctx.method) ? JSON.stringify(ctx.request.body) : undefined,
        query: ctx.request.querystring,
        statusCode: ctx.status,
        response: JSON.stringify(ctx.body),
        processTime,
      });
    } catch (err) {
      this.logger.warn('Failed to track request:', err);
    }
  };
}
