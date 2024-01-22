import container from './root';
import GRPCServer from '@infrastructure/grpc/GRPCServer';

(async () => {
  const grpcServer = container.resolve<GRPCServer>('grpcServer');
  await grpcServer.start();
})();
