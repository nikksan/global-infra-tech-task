import { Config } from '@config/Config';
import News from '@domain/model/News';
import NewsRepository, { Criteria, CriteriaFilter, FilterRelation, Paginated, Sort, SortOrder } from '@domain/repository/NewsRepository';
import { Logger } from '@infrastructure/logger/Logger';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import { MongoClient, ObjectId, Document, WithId, SortDirection as MongoSortDirection } from 'mongodb';

export default class MongoNewsRepository implements NewsRepository {
  private mongoClient: MongoClient | null = null;
  private mongoClientPromise: Promise<MongoClient> | null = null;
  private collectionName = 'news';
  private logger: Logger;

  constructor(
    private config: Config['mongo'],
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async save(news: News): Promise<void> {
    const mongoClient = await this.getClient();
    await mongoClient
      .db(this.config.db)
      .collection(this.collectionName)
      .updateOne({
        _id: new ObjectId(news.getId()),
      }, {
        $set: this.mapEntityToDoc(news),
      }, {
        upsert: true,
      });
  }

  async delete(news: News): Promise<boolean> {
    const mongoClient = await this.getClient();
    const result = await mongoClient
      .db(this.config.db)
      .collection(this.collectionName)
      .deleteOne({ _id: new ObjectId(news.getId()) });

    return result.deletedCount === 1;
  }

  async findById(id: string): Promise<News | null> {
    const mongoClient = await this.getClient();
    const doc = await mongoClient
      .db(this.config.db)
      .collection(this.collectionName)
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return null;
    }

    try {
      return this.mapDocToEntity(doc);
    } catch (err) {
      this.logger.warn('Failed to map document to entity:', doc);
      return null;
    }
  }

  async findAndCountByCriteria(criteria: Criteria): Promise<Paginated<News>> {
    const mongoClient = await this.getClient();
    const mongoFilters = criteria.filter ? this.mapRepositoryFiltersToMongoFilters(criteria.filter) : {};
    const mongoSort = criteria.sort ? this.mapRepositorySortToMongoSort(criteria.sort) : {};

    const cursor = await mongoClient
      .db(this.config.db)
      .collection(this.collectionName)
      .find(mongoFilters)
      .sort(mongoSort);

    const docs = await cursor
      .skip((criteria.page - 1) * criteria.limit)
      .limit(criteria.limit)
      .toArray();

    const total = await mongoClient
      .db(this.config.db)
      .collection(this.collectionName).countDocuments(mongoFilters);

    const items: Array<News> = [];
    for (const doc of docs) {
      try {
        items.push(this.mapDocToEntity(doc));
      } catch (err) {
        this.logger.warn('Failed to map document to entity:', doc);
      }
    }

    return { total, items };
  }

  async deleteAll(): Promise<void> {
    const mongoClient = await this.getClient();
    await mongoClient
      .db(this.config.db)
      .collection(this.collectionName)
      .deleteMany({});
  }

  private async getClient(): Promise<MongoClient> {
    if (this.mongoClientPromise) {
      return this.mongoClientPromise;
    }

    if (this.mongoClient) {
      return this.mongoClient;
    }

    // eslint-disable-next-line no-async-promise-executor
    this.mongoClientPromise = new Promise(async (resolve, reject) => {
      const url = `mongodb://${this.config.user}:${this.config.pass}@${this.config.host}:${this.config.port}/${this.config.db}`;

      try {
        this.mongoClient = new MongoClient(url, {
          authSource: this.config.authSource,
        });
        await this.mongoClient.connect();
      } catch (err) {
        this.mongoClient = null;
        this.mongoClientPromise = null;
        return reject(err);
      }

      this.mongoClientPromise = null;
      resolve(this.mongoClient);
    });

    return this.mongoClientPromise;
  }

  private mapEntityToDoc(news: News) {
    return {
      title: news.getTitle(),
      shortDescription: news.getShortDescription(),
      date: news.getDate(),
      text: news.getText(),
    };
  }

  private mapDocToEntity(doc: WithId<Document>) {
    return new News({
      id: doc._id.toString(),
      title: doc.title,
      shortDescription: doc.shortDescription,
      date: doc.date,
      text: doc.text,
    });
  }

  private mapRepositoryFiltersToMongoFilters(filter: CriteriaFilter) {
    if (!filter.conditions.length) {
      return {};
    }

    return {
      [filter.relation === FilterRelation.And ? '$and' : '$or']: filter.conditions.map((condition) => {
        if (condition.column === 'date') {
          return {
            [condition.column]: {
              $gte: condition.value[0],
              $lte: condition.value[1],
            },
          };
        }

        return {
          [condition.column]: new RegExp(condition.value, 'i'),
        };
      }),
    };
  }

  private mapRepositorySortToMongoSort(sort: Array<Sort>) {
    if (!sort.length) {
      return {};
    }

    return sort.reduce((acc: { [key: string]: MongoSortDirection }, val) => {
      acc[val.column] = val.order === SortOrder.Asc ? 'asc' : 'desc';
      return acc;
    }, {});
  }
}
