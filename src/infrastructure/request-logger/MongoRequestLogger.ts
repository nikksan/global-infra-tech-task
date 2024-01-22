import { Config } from '@config/Config';
import RequestLogger, { Request } from './RequestLogger';
import { MongoClient } from 'mongodb';

export default class MongoRequestLogger implements RequestLogger {
  private mongoClient: MongoClient | null = null;
  private mongoClientPromise: Promise<MongoClient> | null = null;
  private collectionName = 'requests';

  constructor(
    private config: Config['mongo'],
  ) { }

  async append(request: Request): Promise<void> {
    const mongoClient = await this.getClient();
    await mongoClient
      .db(this.config.db)
      .collection(this.collectionName)
      .insertOne(request);
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
}
