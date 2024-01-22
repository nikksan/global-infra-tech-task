import RESTServer from '@infrastructure/rest/RESTServer';
import container from '../../src/root';
import ApiClient from './util/ApiClient';
import NewsRepository from '@domain/repository/NewsRepository';
import NewsFactory from '@tests/util/NewsFactory';
import { start as startGrpcServer, stop as stopGrpcServer } from './util/grpc';

describe('Find and count news by criteria', () => {
  const restServer = container.resolve<RESTServer>('restServer');
  const apiClient = new ApiClient(restServer.startOnRandomPort());
  const newsRepository = container.resolve<NewsRepository>('newsRepository');
  const newsFactory = new NewsFactory();
  const endpoint = '/news';

  beforeAll(() => startGrpcServer());
  afterAll(() => stopGrpcServer());

  afterEach(() => newsRepository.deleteAll());

  it.each([-1, 'asd', 0])('should respond with 400[1000] when page is invalid (%s)', async (page) => {
    const response = await apiClient.get(endpoint, { page, limit: 10 });

    expect(response.statusCode).toEqual(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toEqual(1000);
    expect(response.body.error.meta.page).toBeDefined();
  });

  it.each([-1, 'asd', 0, 1001])('should respond with 400[1000] when limit is invalid (%s)', async (limit) => {
    const response = await apiClient.get(endpoint, { limit, page: 1 });

    expect(response.statusCode).toEqual(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toEqual(1000);
    expect(response.body.error.meta.limit).toBeDefined();
  });

  it.each(['asd', 'text.ASC', 'text|asc', 'title|asc', 'title'])('should respond with 400[1000] when sort is invalid (%s)', async (sort) => {
    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'sort[]': sort,
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toEqual(1000);
    expect(response.body.error.meta['sort[0]']).toBeDefined();
  });

  it.each(['title-asd', 'date=2010.01.01:2010.01.01'])('should respond with 400[1000] when filterConditions is invalid (%s)', async (filterConditions) => {
    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'filterConditions[]': filterConditions,
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toEqual(1000);
    expect(response.body.error.meta['filterConditions[0]']).toBeDefined();
  });

  it('should paginate items properly (page=1, limit=3, total=10)', async () => {
    for (let i = 1; i <= 10; i++) {
      await newsRepository.save(newsFactory.create({ id: padId(i) }));
    }

    const response = await apiClient.get(endpoint, { page: 1, limit: 3 });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(10);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(1),
      padId(2),
      padId(3),
    ]);
  });

  it('should paginate items properly (page=2, limit=5, total=10)', async () => {
    for (let i = 1; i <= 10; i++) {
      await newsRepository.save(newsFactory.create({ id: padId(i) }));
    }

    const response = await apiClient.get(endpoint, { page: 2, limit: 5 });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(10);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(6),
      padId(7),
      padId(8),
      padId(9),
      padId(10),
    ]);
  });

  it('should paginate items properly (page=2, limit=3, total=0)', async () => {
    const response = await apiClient.get(endpoint, { page: 2, limit: 5 });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(0);
    expect(response.body.data.items).toEqual([]);
  });

  it('should sort items properly (date asc)', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), date: new Date('2020.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(2), date: new Date('2022.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(3), date: new Date('2021.01.01') }));

    const response = await apiClient.get(endpoint, { page: 1, limit: 10, 'sort[]': 'date.asc' });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(3);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(1),
      padId(3),
      padId(2),
    ]);
  });

  it('should sort items properly (date desc)', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), date: new Date('2020.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(2), date: new Date('2022.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(3), date: new Date('2021.01.01') }));

    const response = await apiClient.get(endpoint, { page: 1, limit: 10, 'sort[]': 'date.desc' });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(3);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(2),
      padId(3),
      padId(1),
    ]);
  });

  it('should sort items properly (title asc)', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ id: padId(2), title: 'cccc' }));
    await newsRepository.save(newsFactory.create({ id: padId(3), title: 'bbbb' }));

    const response = await apiClient.get(endpoint, { page: 1, limit: 10, 'sort[]': 'title.asc' });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(3);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(1),
      padId(3),
      padId(2),
    ]);
  });

  it('should sort items properly (title desc)', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ id: padId(2), title: 'cccc' }));
    await newsRepository.save(newsFactory.create({ id: padId(3), title: 'bbbb' }));

    const response = await apiClient.get(endpoint, { page: 1, limit: 10, 'sort[]': 'title.desc' });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(3);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(2),
      padId(3),
      padId(1),
    ]);
  });

  it('should sort items properly (date desc, title desc)', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), date: new Date('2022.01.01'), title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ id: padId(2), date: new Date('2022.01.01'), title: 'cccc' }));
    await newsRepository.save(newsFactory.create({ id: padId(3), date: new Date('2021.01.01'), title: 'bbbb' }));

    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'sort[]': ['date.desc', 'title.desc'],
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(3);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(2),
      padId(1),
      padId(3),
    ]);
  });

  it('should filter items properly (title)', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ id: padId(2), title: 'cccc' }));
    await newsRepository.save(newsFactory.create({ id: padId(3), title: 'bbbb' }));

    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'filterConditions[]': ['title=aa'],
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(1);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([padId(1)]);
  });

  it('should filter items properly (date)', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), date: new Date('2021.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(2), date: new Date('2022.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(3), date: new Date('2023.01.01') }));

    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'filterConditions[]': ['date=2020-03-03:2022-03-03'],
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(2);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(1),
      padId(2),
    ]);
  });

  it('should filter items properly (date + title [implicit AND])', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), date: new Date('2021.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(2), date: new Date('2022.01.01'), title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ id: padId(3), date: new Date('2023.01.01'), title: 'bbbb' }));

    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'filterConditions[]': ['date=2020-03-03:2022-03-03', 'title=aa'],
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(1);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(2),
    ]);
  });

  it('should filter items properly (date + title [explicit AND])', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), date: new Date('2021.01.01') }));
    await newsRepository.save(newsFactory.create({ id: padId(2), date: new Date('2022.01.01'), title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ id: padId(3), date: new Date('2023.01.01'), title: 'bbbb' }));

    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'filterConditions[]': ['date=2020-03-03:2022-03-03', 'title=aa'],
      filterRelation: 'and',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(1);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(2),
    ]);
  });

  it('should filter items properly (date + title [explicit OR])', async () => {
    await newsRepository.save(newsFactory.create({ id: padId(1), date: new Date('2021.01.01'), title: 'aaaa' }));
    await newsRepository.save(newsFactory.create({ id: padId(2), date: new Date('2022.01.01'), title: 'bbbb' }));
    await newsRepository.save(newsFactory.create({ id: padId(3), date: new Date('2023.01.01'), title: 'cccc' }));

    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
      'filterConditions[]': ['date=2020-03-03:2021-03-03', 'title=cc'],
      filterRelation: 'or',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(2);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      padId(1),
      padId(3),
    ]);
  });

  it('should return items in the expected format', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const response = await apiClient.get(endpoint, {
      page: 1,
      limit: 10,
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toEqual(1);
    expect(response.body.data.items[0]).toEqual({
      id: news.getId(),
      title: news.getTitle(),
      shortDescription: news.getShortDescription(),
      text: news.getText(),
      date: news.getDate().toISOString(),
    });
  });

  function padId(id: number) {
    return String(id).padStart(24, '0');
  }
});
