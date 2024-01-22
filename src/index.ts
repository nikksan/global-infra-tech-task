import RESTServer from '@infrastructure/rest/RESTServer';
import container from './root';
import GRPCServer from '@infrastructure/grpc/GRPCServer';

(async () => {
  const restServer = container.resolve<RESTServer>('restServer');
  await restServer.start();

  const grpcServer = container.resolve<GRPCServer>('grpcServer');
  await grpcServer.start();
})();
