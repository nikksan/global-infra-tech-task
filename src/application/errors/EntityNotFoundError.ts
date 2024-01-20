export default class EntityNotFoundError extends Error {
  constructor(id: string) {
    super(`Entity #${id} was not found`);
  }
}
