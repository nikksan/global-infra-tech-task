import { loadSync } from '@grpc/proto-loader';
import { ServiceClientConstructor, credentials, loadPackageDefinition } from '@grpc/grpc-js';
import { ServiceClient } from '@grpc/grpc-js/build/src/make-client';
import { Config } from '@config/Config';

export default class GRPCClient {
  private client: ServiceClient | null = null;
  private serviceName = 'RequestTracker';

  constructor(private config: Config['grpc']) { }

  async callUnary<T = unknown>(method: string, data: unknown): Promise<T> {
    if (!this.client) {
      this.client = await this.createClient();
    }

    return new Promise<T>((resolve, reject) => {
      (this.client as ServiceClient)[method](data, (err: Error | null, response: T) => {
        if (err) {
          return reject(err);
        }

        resolve(response);
      });
    });
  }

  private async createClient() {
    const serviceDefinition = this.constructServiceDefinition();
    return new serviceDefinition(`${this.config.host}:${this.config.port}`, credentials.createInsecure());
  }

  private constructServiceDefinition() {
    const protoDefinition = loadPackageDefinition(loadSync(__dirname + '/service.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }));

    return protoDefinition[this.serviceName] as ServiceClientConstructor;
  }
}
