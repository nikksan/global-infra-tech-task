import { loadConfig } from '@config/index';
import MongoNewsRepository from '@infrastructure/repository/mongo/MongoNewsRepository';
import { SortOrder } from '@domain/repository/NewsRepository';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import NewsFactory from '@tests/util/NewsFactory';

describe('MongoNewsRepository', () => {
  const config = loadConfig();
  const newsRepository = new MongoNewsRepository(
    config.mongo,
    new LoggerFactory(config.log),
  );

  const newsFactory = new NewsFactory();

  afterEach(async () => {
    await newsRepository.deleteAll();
  });

  it('should create an entity', async () => {
    const news = newsFactory.create();

    await newsRepository.save(news);

    expect(await newsRepository.findById(news.getId())).toEqual(news);
  });

  it('should update an entity', async () => {
    const news = newsFactory.create({
        text: 'old text'
    });

    await newsRepository.save(news);

    news.changeText('new text');
    await newsRepository.save(news);

    expect((await newsRepository.findById(news.getId()))?.getText()).toEqual('new text');
  });

  it('should delete entity', async () => {
    const news1 = newsFactory.create();
    const news2 = newsFactory.create();
    const news3 = newsFactory.create();
    await newsRepository.save(news1);
    await newsRepository.save(news2);
    await newsRepository.save(news3);

    await newsRepository.delete(news2);

    expect(await newsRepository.findById(news2.getId())).toBeNull();
  });

  it('should paginate items [page=1, limit=5]', async () => {
    for (let i = 1; i <= 10; i++) {
      await newsRepository.save(newsFactory.create({ id: padId(i) }));
    }

    expect((await newsRepository.findAndCountByCriteria({
      limit: 5,
      page: 1,
    })).items.map((item) => item.getId())).toEqual([
      padId(1),
      padId(2),
      padId(3),
      padId(4),
      padId(5),
    ]);
  });

  it('should paginate items [page=2, limit=5]', async () => {
    for (let i = 1; i <= 10; i++) {
      await newsRepository.save(newsFactory.create({ id: padId(i) }));
    }

    expect((await newsRepository.findAndCountByCriteria({
      limit: 5,
      page: 2,
    })).items.map((item) => item.getId())).toEqual([
      padId(6),
      padId(7),
      padId(8),
      padId(9),
      padId(10),
    ]);
  });

  it('should paginate items [page=3, limit=5]', async () => {
    for (let i = 1; i <= 10; i++) {
      await newsRepository.save(newsFactory.create({ id: padId(i) }));
    }

    expect((await newsRepository.findAndCountByCriteria({
      limit: 5,
      page: 3,
    })).items.map((item) => item.getId())).toEqual([]);
  });

  it('should paginate items [page=2, limit=3]', async () => {
    for (let i = 1; i <= 10; i++) {
      await newsRepository.save(newsFactory.create({ id: padId(i) }));
    }

    expect((await newsRepository.findAndCountByCriteria({
      limit: 3,
      page: 2,
    })).items.map((item) => item.getId())).toEqual([
      padId(4),
      padId(5),
      padId(6),
    ]);
  });

  it('should sort the items by title [asc]', async () => {
    await newsRepository.save(newsFactory.create({ title: 'cccc' }));
    await newsRepository.save(newsFactory.create({ title: 'bbbb' }));
    await newsRepository.save(newsFactory.create({ title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ title: 'eeee' }));
    await newsRepository.save(newsFactory.create({ title: 'dddd' }));

    expect((await newsRepository.findAndCountByCriteria({
      page: 1,
      limit: 2,
      sort: [
        { column: 'title', order: SortOrder.Asc },
      ],
    })).items.map((item) => item.getTitle())).toEqual([
      'aaaa',
      'bbbb',
    ]);
  });

  it('should sort the items by title [desc]', async () => {
    await newsRepository.save(newsFactory.create({ title: 'cccc' }));
    await newsRepository.save(newsFactory.create({ title: 'bbbb' }));
    await newsRepository.save(newsFactory.create({ title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ title: 'dddd' }));
    await newsRepository.save(newsFactory.create({ title: 'eeee' }));

    expect((await newsRepository.findAndCountByCriteria({
      page: 1,
      limit: 2,
      sort: [
        { column: 'title', order: SortOrder.Desc },
      ],
    })).items.map((item) => item.getTitle())).toEqual([
      'eeee',
      'dddd',
    ]);
  });

  it('should sort the items by date [asc]', async () => {
    await newsRepository.save(newsFactory.create({ date: new Date('2020.01.01') }));
    await newsRepository.save(newsFactory.create({ date: new Date('2019.01.01') }));
    await newsRepository.save(newsFactory.create({ date: new Date('2021.01.01') }));

    expect((await newsRepository.findAndCountByCriteria({
      page: 1,
      limit: 10,
      sort: [
        { column: 'date', order: SortOrder.Asc },
      ],
    })).items.map((item) => item.getDate())).toEqual([
      new Date('2019.01.01'),
      new Date('2020.01.01'),
      new Date('2021.01.01'),
    ]);
  });

  it('should sort the items by title[asc] + date [desc]', async () => {
    await newsRepository.save(newsFactory.create({ title: 'aaaa', date: new Date('2020.01.01') }));
    await newsRepository.save(newsFactory.create({ title: 'aaaa', date: new Date('2019.01.01') }));
    await newsRepository.save(newsFactory.create({ title: 'aaaa', date: new Date('2021.01.01') }));
    await newsRepository.save(newsFactory.create({ title: 'bbbb', date: new Date('2022.01.01') }));

    expect((await newsRepository.findAndCountByCriteria({
      page: 1,
      limit: 10,
      sort: [
        { column: 'title', order: SortOrder.Asc },
        { column: 'date', order: SortOrder.Desc },
      ],
    })).items.map((item) => item.getDate())).toEqual([
      new Date('2021.01.01'),
      new Date('2020.01.01'),
      new Date('2019.01.01'),
      new Date('2022.01.01'),
    ]);
  });

  it('should sort the items by title and date [asc]', async () => {
    await newsRepository.save(newsFactory.create({ date: new Date('2020.01.01') }));
    await newsRepository.save(newsFactory.create({ date: new Date('2019.01.01') }));
    await newsRepository.save(newsFactory.create({ date: new Date('2021.01.01') }));

    expect((await newsRepository.findAndCountByCriteria({
      page: 1,
      limit: 10,
      sort: [
        { column: 'date', order: SortOrder.Desc },
      ],
    })).items.map((item) => item.getDate())).toEqual([
      new Date('2021.01.01'),
      new Date('2020.01.01'),
      new Date('2019.01.01'),
    ]);
  });

  function padId(id: number) {
    return String(id).padStart(24, '0');
  }
});
