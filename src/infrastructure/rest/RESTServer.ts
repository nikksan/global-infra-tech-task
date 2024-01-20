import { Config } from '@config/Config';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import RESTNewsController from './RESTNewsController';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import { Logger } from '@infrastructure/logger/Logger';
import { Server } from 'http';

export default class RESTServer {
  private app = new Koa();
  private router = new KoaRouter();
  private logger: Logger;

  constructor(
    private config: Config['restServer'],
    private restNewsController: RESTNewsController,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);

    this.app.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      console.log(`${ctx.method} ${ctx.url} - ${JSON.stringify(ctx.body)} ${ms} ms`);
    });

    this.router.post('/news', this.restNewsController.create);
    this.router.patch('/news/:id', this.restNewsController.update);
    this.router.delete('/news/:id', this.restNewsController.delete);
    this.router.get('/news/:id', this.restNewsController.findOne);
    this.router.get('/news', this.restNewsController.findMany);

    this.app.use(bodyParser());
    this.app.use(this.router.routes());
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.app
        .listen(this.config.port)
        .addListener('listening', () => {
          this.logger.info(`Listening on port ${this.config.port}`);
          resolve();
        })
        .addListener('error', reject);
    });
  }

  startOnRandomPort() {
    return this.app.listen();
  }
}
