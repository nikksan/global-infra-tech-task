import {
  Server, loadPackageDefinition, ServerCredentials,
  GrpcObject, UntypedServiceImplementation, ServiceDefinition,
} from '@grpc/grpc-js';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js/build/src/server-call';
import { loadSync } from '@grpc/proto-loader';
import GRPCRequestTrackingController from './GRPCRequestTrackingController';
import { Config } from '@config/Config';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import { Logger } from '@infrastructure/logger/Logger';
import assert from 'assert';

type Handler = (req: unknown) => Promise<unknown>;

export default class GRPCServer {
  private serviceName = 'RequestTracker';
  private unaryRoutes = new Map<string, Handler>();
  private logger: Logger;
  private server: Server | null = null;

  constructor(
    private config: Config['grpc'],
    private grpcRequestTrackingController: GRPCRequestTrackingController,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
    this.unaryRoutes.set('trackRequest', this.grpcRequestTrackingController.trackRequest);
  }

  async start(): Promise<void> {
    this.server = new Server();
    const serviceDefinition = this.constructServiceDefinition();
    const serviceImplementation = this.constructServiceImplementation();
    this.server.addService(serviceDefinition, serviceImplementation);

    return new Promise<void>((resolve, reject) => {
      (this.server as Server).bindAsync(`localhost:${this.config.port}`, ServerCredentials.createInsecure(), (error) => {
        if (error) {
          return reject(error);
        }

        (this.server as Server).start();
        this.logger.info(`Listening on ${this.config.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    assert(this.server);

    this.server.forceShutdown();
  }

  private constructServiceDefinition() {
    const protoDefinition = loadPackageDefinition(loadSync(__dirname + '/service.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }));

    return (protoDefinition[this.serviceName] as GrpcObject).service as ServiceDefinition<unknown>;
  }

  private constructServiceImplementation() {
    const serviceImplementation: UntypedServiceImplementation = {};

    for (const [method, handler] of this.unaryRoutes) {
      serviceImplementation[method] = this.createHandler(handler);
    }

    return serviceImplementation;
  }

  private createHandler(handler: Handler) {
    return async (call: ServerUnaryCall<unknown, unknown>, callback: sendUnaryData<unknown>) => {
      try {
        const output = await handler(call.request);
        callback(null, output);
      } catch (err) {
        callback({
          name: (err as Error).constructor.name,
          message: (err as Error).message,
        });
      }
    };
  }
}
