import { loadConfig } from '@config/index';
import MongoNewsRepository from '@infrastructure/repository/mongo/MongoNewsRepository';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import FindNewsByIdQuery from '@application/query/FindNewsByIdQuery';
import { generateRandomId } from '@tests/util/funcs';
import NewsFactory from '@tests/util/NewsFactory';

describe('FindNewsByIdQuery', () => {
  const config = loadConfig();
  const newsRepository = new MongoNewsRepository(
    config.mongo,
    new LoggerFactory(config.log),
  );
  const query = new FindNewsByIdQuery(
    newsRepository,
  );
  const newsFactory = new NewsFactory();

  afterEach(async () => {
    await newsRepository.deleteAll();
  });

  it('should return null when the news doesn\'t exist', async () => {
    expect(await query.run(generateRandomId())).toBeNull();
  });

  it('should return the entity as dto', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const dto = await query.run(news.getId());

    expect(dto).toEqual({
      id: news.getId(),
      title: news.getTitle(),
      shortDescription: news.getShortDescription(),
      text: news.getText(),
      date: news.getDate().toISOString(),
    });
  });
});
