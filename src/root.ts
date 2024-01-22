import { InjectionMode, asClass, asValue, createContainer } from 'awilix';
import { loadConfig } from './config';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import RESTNewsController from '@infrastructure/rest/RESTNewsController';
import RESTServer from '@infrastructure/rest/RESTServer';
import MongoNewsRepository from '@infrastructure/repository/mongo/MongoNewsRepository';
import GRPCServer from '@infrastructure/grpc/GRPCServer';
import GRPCRequestTrackingController from '@infrastructure/grpc/GRPCRequestTrackingController';
import GRPCClient from '@infrastructure/grpc/GRPCClient';
import RESTRequestTrackingController from '@infrastructure/rest/RESTRequestTrackingController';
import MongoRequestLogger from '@infrastructure/request-logger/MongoRequestLogger';

const config = loadConfig();
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  appRoot: asValue(__dirname + '/../'),
  loggerFactory: asClass(LoggerFactory, {
    injector: () => ({
      config: config.log,
    }),
  }).singleton(),
  newsRepository: asClass(MongoNewsRepository, {
    injector: () => ({
      config: config.mongo,
    }),
  }).singleton(),
  restNewsController: asClass(RESTNewsController).singleton(),
  restRequestTrackingController: asClass(RESTRequestTrackingController).singleton(),
  restServer: asClass(RESTServer, {
    injector: () => ({
      config: config.rest,
    }),
  }).singleton(),
  requestLogger: asClass(MongoRequestLogger, {
    injector: () => ({
      config: config.mongo,
    }),
  }).singleton(),
  grpcRequestTrackingController: asClass(GRPCRequestTrackingController).singleton(),
  grpcServer: asClass(GRPCServer, {
    injector: () => ({
      config: config.grpc,
    }),
  }).singleton(),
  grpcClient: asClass(GRPCClient, {
    injector: () => ({
      config: config.grpc,
    }),
  }).singleton(),
});

container.loadModules([
  __dirname + '/application/**/*.ts',
], {
  formatName: 'camelCase',
  resolverOptions: {
    injectionMode: InjectionMode.CLASSIC,
  },
});

export default container;
