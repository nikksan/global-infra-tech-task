import { loadConfig } from '@config/index';
import MongoNewsRepository from '@infrastructure/repository/mongo/MongoNewsRepository';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import FindAndCountNewsByCriteriaQuery from '@application/query/FindAndCountNewsByCriteriaQuery';
import NewsFactory from '@tests/util/NewsFactory';

describe('FindAndCountNewsByCriteriaQuery', () => {
  const config = loadConfig();
  const newsRepository = new MongoNewsRepository(
    config.mongo,
    new LoggerFactory(config.log),
  );
  const query = new FindAndCountNewsByCriteriaQuery(
    newsRepository,
  );
  const newsFactory = new NewsFactory();

  afterEach(async () => {
    await newsRepository.deleteAll();
  });

  it('should return total', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const result = await query.run({
      page: 1,
      limit: 10,
    });

    expect(result.total).toEqual(1);
  });

  it('should return items as dtos', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const result = await query.run({
      page: 1,
      limit: 10,
    });

    expect(result.items[0]).toEqual({
      id: news.getId(),
      title: news.getTitle(),
      shortDescription: news.getShortDescription(),
      text: news.getText(),
      date: news.getDate().toISOString(),
    });
  });
});
