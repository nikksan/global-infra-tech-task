import DTOGenerator from "@application/service/DTOGenerator";
import { NewsDTO } from "@application/types";
import NewsRepository, { Criteria, Paginated } from "@domain/repository/NewsRepository";

export default class FindAndCountNewsByCriteriaQuery {
    private dtoGenerator = new DTOGenerator();
    constructor(
        private newsRepository: NewsRepository,
    ) {}

    async run(criteria: Criteria): Promise<Paginated<NewsDTO>> {
        const { total, items } = await this.newsRepository.findAndCountByCriteria(criteria);

        return {
            total,
            items: this.dtoGenerator.generateManyFromNews(items),
        };
    }
}
