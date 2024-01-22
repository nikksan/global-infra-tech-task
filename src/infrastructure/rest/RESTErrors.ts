export type RESTError = {
    status: number,
    code: number,
    message: string,
    meta?: Record<string, unknown>
}

export const RESTErrors = {
  VALIDATION: {
    status: 400,
    code: 1000,
    message: 'ValidationError',
  },
  NOT_FOUND: {
    status: 404,
    code: 1001,
    message: 'NotFoundError',
  },
  GENERAL: {
    status: 500,
    code: 1002,
    message: 'GeneralError',
  },
};
