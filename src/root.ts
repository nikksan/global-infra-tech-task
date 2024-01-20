import { InjectionMode, asClass, createContainer } from 'awilix';
import { loadConfig } from './config';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import RESTNewsController from '@infrastructure/rest/RESTNewsController';
import RESTServer from '@infrastructure/rest/RESTServer';
import MongoNewsRepository from '@infrastructure/repository/mongo/MongoNewsRepository';

const config = loadConfig();
const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
});

container.register({
    loggerFactory: asClass(LoggerFactory, {
        injector: () => ({
            config: config.log,
        }),
    }).singleton(),
});

container.register({
    restServer: asClass(RESTServer, {
        injector: () => ({
            config: config.restServer,
        }),
    }).singleton(),
});

container.register({
    restNewsController: asClass(RESTNewsController).singleton(),
});

container.register({
    newsRepository: asClass(MongoNewsRepository, {
        injector: () => ({
            config: config.mongo,
        })
    }).singleton(),
});

container.loadModules([
    __dirname + '/application/**/*.ts',
], {
    formatName: 'camelCase',
    resolverOptions: {
        injectionMode: InjectionMode.CLASSIC,
    },
})

export default container;
