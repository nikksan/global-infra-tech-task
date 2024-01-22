import GRPCServer from '@infrastructure/grpc/GRPCServer';
import container from '../../../src/root';

export const start = async (): Promise<void> => {
  const grpcServer = container.resolve<GRPCServer>('grpcServer');
  await grpcServer.start();
};

export const stop = async (): Promise<void> => {
  const grpcServer = container.resolve<GRPCServer>('grpcServer');
  await grpcServer.stop();
};
