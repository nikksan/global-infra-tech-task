import { loadConfig } from "@config/index";
import MongoNewsRepository from "@infrastructure/repository/mongo/MongoNewsRepository";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import UpdateNewsCommand, { Input } from "@application/command/UpdateNewsCommand";
import DomainValidationError from "@domain/errors/DomainValidationError";
import News from "@domain/model/News";
import { catchError, generateRandomId } from '@tests/util/funcs';
import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import NewsFactory from "@tests/util/NewsFactory";

describe('UpdateNewsCommand', () => {
  const config = loadConfig();
  const newsRepository = new MongoNewsRepository(
    config.mongo,
    new LoggerFactory(config.log),
  );
  const command = new UpdateNewsCommand(
    newsRepository,
    new LoggerFactory(config.log)
  );
  const newsFactory = new NewsFactory();

  afterEach(async () => {
    await newsRepository.deleteAll();
  });

  it('should throw EntityNotFoundError when the news doesn\'t exist', async () => {
    const caughtError = await catchError(() => command.handle({ id: generateRandomId() }));

    expect(caughtError).toBeInstanceOf(EntityNotFoundError);
  });

  it.each(['', '  ', 'aaa   ', 'aaa'])('should throw DomainValidationError when the title is too short - %s', async (title) => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const caughtError = await catchError(() => command.handle({ id: news.getId(), title }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('title');
    expect((caughtError as DomainValidationError).value).toEqual(title);
  });

  it.each(['ÛÛÛÛÛÛÛÛÛ', 'ŒŒŒŒŒ' ])('should throw DomainValidationError when the title contains special chars - %s', async (title) => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const caughtError = await catchError(() => command.handle({ id: news.getId(), title }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('title');
    expect((caughtError as DomainValidationError).value).toEqual(title);
  });

  it('should throw DomainValidationError when the title is too long', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const tooLongTitle = new Array(129).fill('a').join('');
    const caughtError = await catchError(() => command.handle({ id: news.getId(), title: tooLongTitle }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('title');
    expect((caughtError as DomainValidationError).value).toEqual(tooLongTitle);
  });

  it.each(['', '  ', 'aaa   ', 'aaa'])('should throw DomainValidationError when the shortDescription is too short - %s', async (shortDescription) => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const caughtError = await catchError(() => command.handle({ id: news.getId(), shortDescription }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('shortDescription');
    expect((caughtError as DomainValidationError).value).toEqual(shortDescription);
  });

  it.each(['ïïïïïïïïïïï', '™™™™™™' ])('should throw DomainValidationError when the shortDescription contains special chars - %s', async (shortDescription) => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const caughtError = await catchError(() => command.handle({ id: news.getId(), shortDescription }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('shortDescription');
    expect((caughtError as DomainValidationError).value).toEqual(shortDescription);
  });

  it('should throw DomainValidationError when the shortDescription is too long', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const tooLongShortDescription = new Array(257).fill('a').join('');
    const caughtError = await catchError(() => command.handle({ id: news.getId(), shortDescription: tooLongShortDescription }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('shortDescription');
    expect((caughtError as DomainValidationError).value).toEqual(tooLongShortDescription);
  });

  it.each(['', '  ', 'aaa   ', 'aaa'])('should throw DomainValidationError when the text is too short - %s', async (text) => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const caughtError = await catchError(() => command.handle({ id: news.getId(), text }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('text');
    expect((caughtError as DomainValidationError).value).toEqual(text);
  });

  it.each(['ïïïïïïïïïïï', '™™™™™™' ])('should throw DomainValidationError when the text contains special chars - %s', async (text) => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const caughtError = await catchError(() => command.handle({ id: news.getId(), text }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('text');
    expect((caughtError as DomainValidationError).value).toEqual(text);
  });

  it('should throw DomainValidationError when the text is too long', async () => {
    const news = newsFactory.create();
    await newsRepository.save(news);

    const tooLongText = new Array(2049).fill('a').join('');
    const caughtError = await catchError(() => command.handle({ id: news.getId(), text: tooLongText }));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('text');
    expect((caughtError as DomainValidationError).value).toEqual(tooLongText);
  });

  it('should update the news in the repo', async () => {
    const news = newsFactory.create({
      title: 'old title',
      shortDescription: 'old short desc',
      text: 'old text',
    });
    await newsRepository.save(news);

    const input = {
      id: news.getId(),
      title: 'new title',
      text: 'new text',
      shortDescription: 'new short desc',
    };
    await command.handle(input);

    const updatedNews = await newsRepository.findById(news.getId());
    expect(updatedNews).toBeInstanceOf(News);
    expect((updatedNews as News).getTitle()).toEqual(input.title);
    expect((updatedNews as News).getText()).toEqual(input.text);
    expect((updatedNews as News).getShortDescription()).toEqual(input.shortDescription);
  });
});
