import { loadConfig } from "@config/index";
import MongoNewsRepository from "@infrastructure/repository/mongo/MongoNewsRepository";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import DeleteNewsCommand from "@application/command/DeleteNewsCommand";
import { catchError, generateRandomId } from '@tests/util/funcs';
import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import NewsFactory from "@tests/util/NewsFactory";

describe('DeleteNewsCommand', () => {
  const config = loadConfig();
  const newsRepository = new MongoNewsRepository(
    config.mongo,
    new LoggerFactory(config.log),
  );
  const command = new DeleteNewsCommand(
    newsRepository,
    new LoggerFactory(config.log)
  );
  const newsFactory = new NewsFactory();

  afterEach(async () => {
    await newsRepository.deleteAll();
  });

  it('should throw EntityNotFoundError when the news doesn\'t exist', async () => {
    const caughtError = await catchError(() => command.handle(generateRandomId()));

    expect(caughtError).toBeInstanceOf(EntityNotFoundError);
  });

  it('should delete the entity', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    await command.handle(news.getId());

    expect(await newsRepository.findById(news.getId())).toBeNull();
  });
});
