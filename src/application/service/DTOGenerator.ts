import { NewsDTO } from '@application/types';
import News from '@domain/model/News';

export default class DTOGenerator {
  generateFromNews(news: News): NewsDTO {
    return {
      id: news.getId(),
      title: news.getTitle(),
      shortDescription: news.getShortDescription(),
      text: news.getText(),
      date: news.getDate().toISOString(),
    };
  }

  generateManyFromNews(news: Array<News>): Array<NewsDTO> {
    return news.map((singleNews) => this.generateFromNews(singleNews));
  }
}
