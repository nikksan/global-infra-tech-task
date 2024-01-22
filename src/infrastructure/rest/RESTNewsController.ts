import { ParameterizedContext } from 'koa';
import RESTController from './RESTController';
import CreateNewsCommand from '@application/command/CreateNewsCommand';
import UpdateNewsCommand from '@application/command/UpdateNewsCommand';
import DeleteNewsCommand from '@application/command/DeleteNewsCommand';
import FindNewsByIdQuery from '@application/query/FindNewsByIdQuery';
import FindAndCountNewsByCriteriaQuery from '@application/query/FindAndCountNewsByCriteriaQuery';
import { tags, assert } from 'typia';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import { RESTErrors } from './RESTErrors';
import { Criteria, FilterRelation, Sort } from '@domain/repository/NewsRepository';

type IdPattern = string & tags.Pattern<'^[0-9a-fA-F]{24}$'>;
type PagePattern = number & tags.Minimum<1>;
type LimitPattern = number & tags.Minimum<1> & tags.Maximum<1000>;
type SortPattern = string & tags.Pattern<'(date|title)\\.(asc|desc)'>;
type FilterConditionPattern = string & (
  tags.Pattern<'title=[A-Za-z0-9]'> |
  tags.Pattern<'date=\\d{4}-([0]\\d|1[0-2])-([0-2]\\d|3[01]):\\d{4}-([0]\\d|1[0-2])-([0-2]\\d|3[01])'>
);
type FilterRelationPattern = string & tags.Pattern<'(and|or)'>;

export default class RESTNewsController extends RESTController {
  constructor(
    private createNewsCommand: CreateNewsCommand,
    private updateNewsCommand: UpdateNewsCommand,
    private deleteNewsCommand: DeleteNewsCommand,
    private findNewsByIdQuery: FindNewsByIdQuery,
    private findAndCountNewsByCriteriaQuery: FindAndCountNewsByCriteriaQuery,
    loggerFactory: LoggerFactory,
  ) {
    super(loggerFactory);
  }

  create = async (ctx: ParameterizedContext): Promise<void> => {
    try {
      type ExpectedInput = {
        title: string
        shortDescription: string
        text: string
      };

      const validatedInput = assert<ExpectedInput>(ctx.request.body);
      const id = await this.createNewsCommand.handle(validatedInput);

      this.sendData(ctx, id);
    } catch (err) {
      this.handleError(ctx, err as Error);
    }
  };

  update = async (ctx: ParameterizedContext): Promise<void> => {
    try {
      type ExpectedInput = {
        id: IdPattern
        title?: string
        shortDescription?: string
        text?: string
      };

      const validatedInput = assert<ExpectedInput>({
        id: ctx.params.id,
        ...(ctx.request.body || {}),
      });

      await this.updateNewsCommand.handle(validatedInput);

      this.sendData(ctx, null);
    } catch (err) {
      this.handleError(ctx, err as Error);
    }
  };

  delete = async (ctx: ParameterizedContext): Promise<void> => {
    try {
      const validatedInput = assert<IdPattern>(ctx.params.id);

      await this.deleteNewsCommand.handle(validatedInput);

      this.sendData(ctx, null);
    } catch (err) {
      this.handleError(ctx, err as Error);
    }
  };

  findOne = async (ctx: ParameterizedContext): Promise<void> => {
    try {
      const validatedInput = assert<IdPattern>(ctx.params.id);
      const result = await this.findNewsByIdQuery.run(validatedInput);
      if (!result) {
        return this.sendError(ctx, RESTErrors.NOT_FOUND);
      }

      this.sendData(ctx, result);
    } catch (err) {
      this.handleError(ctx, err as Error);
    }
  };

  findMany = async (ctx: ParameterizedContext): Promise<void> => {
    try {
      const validatedInput = this.prepareFindAndCountInput(ctx);
      const result = await this.findAndCountNewsByCriteriaQuery.run(validatedInput);
      this.sendData(ctx, result);
    } catch (err) {
      this.handleError(ctx, err as Error);
    }
  };

  private prepareFindAndCountInput(ctx: ParameterizedContext): Criteria {
    type ExpectedInput = {
      page: PagePattern,
      limit: LimitPattern,
      sort?: Array<SortPattern>,
      filterConditions?: Array<FilterConditionPattern>,
      filterRelation?: FilterRelationPattern,
    };

    const input = {
      page: parseInt(ctx.request.query.page as string),
      limit: parseInt(ctx.request.query.limit as string),
      sort: this.toArrayOrKeepAsUndefined(ctx.request.query['sort[]']),
      filterConditions: this.toArrayOrKeepAsUndefined(ctx.request.query['filterConditions[]']),
      filterRelation: ctx.request.query.filterRelation,
    };

    const validatedInput = assert<ExpectedInput>(input);

    return {
      page: validatedInput.page,
      limit: validatedInput.limit,
      filter: {
        relation: (validatedInput.filterRelation as FilterRelation) ?? FilterRelation.And,
        conditions: validatedInput.filterConditions?.map((condition) => {
          const [column, value] = condition.split('=');
          if (column === 'title') {
            return { column, value };
          }

          const [startDateAsString, endDateAsString] = value.split(':');
          const startDate = new Date(startDateAsString);
          const endDate = new Date(endDateAsString);

          return {
            column: 'date',
            value: [startDate, endDate],
          };
        }) || [],
      },
      sort: validatedInput.sort?.map((sort) => {
        const [column, order] = sort.split('.');
        return { column, order } as Sort;
      }) || [],
    };
  }

  private toArrayOrKeepAsUndefined(thing: unknown) {
    if (thing === undefined) {
      return undefined;
    }

    return Array.isArray(thing) ? thing : [thing];
  }
}
