import EntityNotFoundError from '@application/errors/EntityNotFoundError';
import NewsRepository from '@domain/repository/NewsRepository';
import { Logger } from '@infrastructure/logger/Logger';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';

export default class DeleteNewsCommand {
  private logger: Logger;

  constructor(
    private newsRepository: NewsRepository,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async handle(id: string): Promise<void> {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw new EntityNotFoundError(id);
    }

    await this.newsRepository.delete(news);

    this.logger.info(`Deleted news #${id}`);
  }
}
