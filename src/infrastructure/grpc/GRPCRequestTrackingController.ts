import { assert } from 'typia';
import RequestLogger from '@infrastructure/request-logger/RequestLogger';

type ExpectedInput = {
  date: string,
  endpoint: string,
  method: string,
  headers: string,
  body?: string,
  query: string,
  statusCode: number,
  response: string,
  processTime: number,
};

export default class GRPCRequestTrackingController {
  constructor(
    private requestLogger: RequestLogger,
  ) {}

  trackRequest = async (input: unknown): Promise<void> => {
    const validatedInput = assert<ExpectedInput>(input);
    const request = this.hydrateRequest(validatedInput);
    await this.requestLogger.append(request);
  };

  private hydrateRequest(input: ExpectedInput) {
    return {
      ...input,
      date: new Date(input.date),
      headers: JSON.parse(input.headers),
      body: input.body ? JSON.parse(input.body) : undefined,
      response: JSON.parse(input.response),
    };
  }
}
