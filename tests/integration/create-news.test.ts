import RESTServer from '@infrastructure/rest/RESTServer';
import container from '../../src/root';
import ApiClient from './util/ApiClient';
import NewsRepository from '@domain/repository/NewsRepository';
import News from '@domain/model/News';
import { start as startGrpcServer, stop as stopGrpcServer } from './util/grpc';

describe('Create news', () => {
  const restServer = container.resolve<RESTServer>('restServer');
  const newsRepository = container.resolve<NewsRepository>('newsRepository');
  const apiClient = new ApiClient(restServer.startOnRandomPort());
  const endpoint = '/news';

  beforeAll(() => startGrpcServer());
  afterAll(() => stopGrpcServer());

  afterEach(() => newsRepository.deleteAll());

  it('should respond with 400[1000] when title is invalid', async () => {
    const response = await apiClient.post(endpoint, createInput({ title: 'aa' }));

    expect(response.statusCode).toEqual(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toEqual(1000);
    expect(response.body.error.meta.title).toBeDefined();
  });

  it('should respond with 400[1000] when shortDescription is invalid', async () => {
    const response = await apiClient.post(endpoint, createInput({ shortDescription: 'aa' }));

    expect(response.statusCode).toEqual(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toEqual(1000);
    expect(response.body.error.meta.shortDescription).toBeDefined();
  });

  it('should respond with 400[1000] when text is invalid', async () => {
    const response = await apiClient.post(endpoint, createInput({ text: 'aa' }));

    expect(response.statusCode).toEqual(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error.code).toEqual(1000);
    expect(response.body.error.meta.text).toBeDefined();
  });

  it('should respond with 200 when everything is ok', async () => {
    const response = await apiClient.post(endpoint, createInput());

    expect(response.statusCode).toEqual(200);
    expect(response.body.error).toBeNull();
    expect(await newsRepository.findById(response.body.data)).toBeInstanceOf(News);
  });

  type Input = {
    title: string,
    shortDescription: string,
    text: string,
  }

  function createInput(override: Partial<Input> = {}): Input {
    const defaults = {
      title: 'Lorem',
      shortDescription: 'lorem ipsum',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
    };

    return { ...defaults, ...override };
  }
});
