/* eslint-disable semi */

export type Request = {
    date: Date,
    endpoint: string,
    method: string,
    headers: Record<string, string>,
    body?: Record<string, unknown>,
    query: string,
    statusCode: number,
    response: Record<string, unknown>,
    processTime: number,
};

export default interface RequestLogger {
    append(request: Request): Promise<void>;
}
