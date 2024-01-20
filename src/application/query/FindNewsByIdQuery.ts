import DTOGenerator from "@application/service/DTOGenerator";
import { NewsDTO } from "@application/types";
import NewsRepository from "@domain/repository/NewsRepository";

export default class FindNewsByIdQuery {
    private dtoGenerator = new DTOGenerator();
    constructor(
        private newsRepository: NewsRepository,
    ) {}

    async run(id: string): Promise<NewsDTO | null> {
        const news = await this.newsRepository.findById(id);
        if (!news) {
            return null;
        }

        return this.dtoGenerator.generateFromNews(news);
    }
}
