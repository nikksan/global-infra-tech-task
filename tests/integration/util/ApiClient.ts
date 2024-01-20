import request, { Response as SuperTestResponse } from 'supertest';
import { Server } from 'http';

type PlainObject = Record<string, unknown>;

export enum Headers {}

export type Response = SuperTestResponse;

export default class ApiClient {
  constructor(private server: Server) {}

  async get(endpoint: string, params: PlainObject = {}): Promise<Response> {
    return request(this.server)
      .get(endpoint)
      .query(params);
  }

  async post(endpoint: string, body: PlainObject = {}): Promise<Response> {
    return request(this.server)
      .post(endpoint)
      .send(body);
  }
}
