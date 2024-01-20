import News from '@domain/model/News';
import NewsRepository from '@domain/repository/NewsRepository';
import { Logger } from '@infrastructure/logger/Logger';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';

export type Input = {
  title: string
  shortDescription: string
  text: string
}

export default class CreateNewsCommand {
  private logger: Logger;

  constructor(
    private newsRepository: NewsRepository,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async handle(input: Input): Promise<string> {
    const news = new News(input);
    await this.newsRepository.save(news);

    this.logger.info(`Created news #${news.getId()} ${news.getTitle()}`);
    return news.getId();
  }
}
