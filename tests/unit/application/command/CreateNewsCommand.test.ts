import { loadConfig } from '@config/index';
import MongoNewsRepository from '@infrastructure/repository/mongo/MongoNewsRepository';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import CreateNewsCommand, { Input } from '@application/command/CreateNewsCommand';
import DomainValidationError from '@domain/errors/DomainValidationError';
import News from '@domain/model/News';
import { catchError } from '@tests/util/funcs';

describe('CreateNewsCommand', () => {
  const config = loadConfig();
  const newsRepository = new MongoNewsRepository(
    config.mongo,
    new LoggerFactory(config.log),
  );
  const command = new CreateNewsCommand(
    newsRepository,
    new LoggerFactory(config.log),
  );

  afterEach(async () => {
    await newsRepository.deleteAll();
  });

  it.each(['', '  ', 'aaa   ', 'aaa'])('should throw DomainValidationError when the title is too short - %s', async (title) => {
    const caughtError = await catchError(() => command.handle(createInput({ title })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('title');
    expect((caughtError as DomainValidationError).value).toEqual(title);
  });

  it.each(['ÛÛÛÛÛÛÛÛÛ', 'ŒŒŒŒŒ' ])('should throw DomainValidationError when the title contains special chars - %s', async (title) => {
    const caughtError = await catchError(() => command.handle(createInput({ title })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('title');
    expect((caughtError as DomainValidationError).value).toEqual(title);
  });

  it('should throw DomainValidationError when the title is too long', async () => {
    const tooLongTitle = new Array(129).fill('a').join('');
    const caughtError = await catchError(() => command.handle(createInput({ title: tooLongTitle })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('title');
    expect((caughtError as DomainValidationError).value).toEqual(tooLongTitle);
  });

  it.each(['', '  ', 'aaa   ', 'aaa'])('should throw DomainValidationError when the shortDescription is too short - %s', async (shortDescription) => {
    const caughtError = await catchError(() => command.handle(createInput({ shortDescription })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('shortDescription');
    expect((caughtError as DomainValidationError).value).toEqual(shortDescription);
  });

  it.each(['ïïïïïïïïïïï', '™™™™™™' ])('should throw DomainValidationError when the shortDescription contains special chars - %s', async (shortDescription) => {
    const caughtError = await catchError(() => command.handle(createInput({ shortDescription })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('shortDescription');
    expect((caughtError as DomainValidationError).value).toEqual(shortDescription);
  });

  it('should throw DomainValidationError when the shortDescription is too long', async () => {
    const tooLongShortDescription = new Array(257).fill('a').join('');
    const caughtError = await catchError(() => command.handle(createInput({ shortDescription: tooLongShortDescription })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('shortDescription');
    expect((caughtError as DomainValidationError).value).toEqual(tooLongShortDescription);
  });

  it.each(['', '  ', 'aaa   ', 'aaa'])('should throw DomainValidationError when the text is too short - %s', async (text) => {
    const caughtError = await catchError(() => command.handle(createInput({ text })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('text');
    expect((caughtError as DomainValidationError).value).toEqual(text);
  });

  it.each(['ïïïïïïïïïïï', '™™™™™™' ])('should throw DomainValidationError when the text contains special chars - %s', async (text) => {
    const caughtError = await catchError(() => command.handle(createInput({ text })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('text');
    expect((caughtError as DomainValidationError).value).toEqual(text);
  });

  it('should throw DomainValidationError when the text is too long', async () => {
    const tooLongText = new Array(2049).fill('a').join('');
    const caughtError = await catchError(() => command.handle(createInput({ text: tooLongText })));

    expect(caughtError).toBeInstanceOf(DomainValidationError);
    expect((caughtError as DomainValidationError).path).toEqual('text');
    expect((caughtError as DomainValidationError).value).toEqual(tooLongText);
  });

  it('should store the news in the repo', async () => {
    const input = createInput();
    const id = await command.handle(input);

    const savedNews = await newsRepository.findById(id);
    expect(savedNews).toBeInstanceOf(News);
    expect((savedNews as News).getTitle()).toEqual(input.title);
    expect((savedNews as News).getText()).toEqual(input.text);
    expect((savedNews as News).getShortDescription()).toEqual(input.shortDescription);
  });

  function createInput(override: Partial<Input> = {}): Input {
    const defaults = {
      title: 'Lorem',
      shortDescription: 'lorem ipsum',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
    };

    return { ...defaults, ...override };
  }
});
