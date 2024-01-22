import RESTServer from '@infrastructure/rest/RESTServer';
import container from './root';

(async () => {
  const restServer = container.resolve<RESTServer>('restServer');
  await restServer.start();
})();
