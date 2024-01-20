import EntityNotFoundError from '@application/errors/EntityNotFoundError';
import NewsRepository from '@domain/repository/NewsRepository';
import { Logger } from '@infrastructure/logger/Logger';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';

export type Input = {
  id: string,
  title?: string
  shortDescription?: string
  text?: string
}

export default class UpdateNewsCommand {
  private logger: Logger;

  constructor(
    private newsRepository: NewsRepository,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async handle(input: Input): Promise<void> {
    const news = await this.newsRepository.findById(input.id);
    if (!news) {
      throw new EntityNotFoundError(input.id);
    }

    if (input.title !== undefined) {
      news.changeTitle(input.title);
    }

    if (input.shortDescription !== undefined) {
      news.changeShortDescription(input.shortDescription);
    }

    if (input.text !== undefined) {
      news.changeText(input.text);
    }

    await this.newsRepository.save(news);

    const updatedProps = Object.keys(input).filter(key => key !== 'id');
    this.logger.info(`Updated ${updatedProps.join(', ')} of news #${news.getId()}`);
  }
}
