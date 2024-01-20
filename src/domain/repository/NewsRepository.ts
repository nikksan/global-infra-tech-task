import News from '@domain/model/News';

export enum SortOrder {
  Desc = 'desc',
  Asc = 'asc',
}

export type Sort = {
  column: 'date' | 'title',
  order: SortOrder,
}

export type FilterCondition = {
  column: 'date',
  value: [Date, Date]
} | {
  column: 'title',
  value: string
}

export enum FilterRelation {
  And = 'and',
  Or = 'or',
}

export type CriteriaFilter = {
  conditions: Array<FilterCondition>,
  relation: FilterRelation,
}

export type Criteria = {
  page: number,
  limit: number,
  sort?: Array<Sort>,
  filter?: CriteriaFilter,
}

export type Paginated<T> = { total: number, items: Array<T> };

interface NewsRepository {
  save(news: News): Promise<void>;
  delete(news: News): Promise<boolean>;
  findById(id: string): Promise<News | null>;
  findAndCountByCriteria(criteria: Criteria): Promise<Paginated<News>>;
  deleteAll(): Promise<void>;
}

export default NewsRepository;
