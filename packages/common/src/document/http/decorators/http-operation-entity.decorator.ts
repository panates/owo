import { StrictOmit, Type } from 'ts-gems';
import { FilterRules } from '../../../filter/filter-rules.js';
import { OpraFilter } from '../../../filter/index.js';
import { omitUndefined } from '../../../helpers/index.js';
import { HttpStatusCode, MimeTypes } from '../../../http/index.js';
import { OpraSchema } from '../../../schema/index.js';
import { DATATYPE_METADATA } from '../../constants.js';
import { FieldPathType, FilterType } from '../../data-type/extended-types/index.js';
import { IntegerType } from '../../data-type/primitive-types/index.js';
import { HttpOperation } from '../http-operation.js';
import { HttpRequestBody } from '../http-request-body.js';
import { HttpOperationDecorator, HttpOperationDecoratorFactory } from './http-operation.decorator.js';

/** Augmentation **/
declare module '../http-operation' {
  /**
   * HttpOperationConstructor
   */
  interface HttpOperationStatic {
    Entity: HttpOperationEntity;
  }

  interface HttpOperationEntity {
    Create(
      type: Type | string,
      options?: StrictOmit<HttpOperation.Entity.CreateArgs, 'type'>,
    ): HttpOperation.Entity.CreateDecorator;

    Create(args: HttpOperation.Entity.CreateArgs): HttpOperation.Entity.CreateDecorator;

    Delete(
      type: Type | string,
      options?: StrictOmit<HttpOperation.Entity.DeleteArgs, 'type'>,
    ): HttpOperation.Entity.DeleteDecorator;

    Delete(args: HttpOperation.Entity.DeleteArgs): HttpOperation.Entity.DeleteDecorator;

    DeleteMany(
      type: Type | string,
      options?: StrictOmit<HttpOperation.Entity.DeleteManyArgs, 'type'>,
    ): HttpOperation.Entity.DeleteManyDecorator;

    DeleteMany(args: HttpOperation.Entity.DeleteManyArgs): HttpOperation.Entity.DeleteManyDecorator;

    FindMany(
      type: Type | string,
      options?: StrictOmit<HttpOperation.Entity.FindManyArgs, 'type'>,
    ): HttpOperation.Entity.FindManyDecorator;

    FindMany(args: HttpOperation.Entity.FindManyArgs): HttpOperation.Entity.FindManyDecorator;

    Get(
      type: Type | string,
      options?: StrictOmit<HttpOperation.Entity.GetArgs, 'type'>,
    ): HttpOperation.Entity.GetDecorator;

    Get(args: HttpOperation.Entity.GetArgs): HttpOperation.Entity.GetDecorator;

    Update(
      type: Type | string,
      options?: StrictOmit<HttpOperation.Entity.UpdateArgs, 'type'>,
    ): HttpOperation.Entity.UpdateDecorator;

    Update(args: HttpOperation.Entity.UpdateArgs): HttpOperation.Entity.UpdateDecorator;

    UpdateMany(
      type: Type | string,
      options?: StrictOmit<HttpOperation.Entity.UpdateManyArgs, 'type'>,
    ): HttpOperation.Entity.UpdateManyDecorator;

    UpdateMany(args: HttpOperation.Entity.UpdateManyArgs): HttpOperation.Entity.UpdateManyDecorator;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace HttpOperation {
    namespace Entity {
      /** Create */
      export interface CreateDecorator extends HttpOperationDecorator {}

      export interface CreateArgs extends StrictOmit<HttpOperation.Options, 'method' | 'requestBody'> {
        type: Type | string;
        requestBody?: Pick<HttpRequestBody.Options, 'description' | 'maxContentSize'> & {
          type?: Type | string;
          immediateFetch?: boolean;
        };
      }

      /** Delete */
      export type DeleteDecorator = HttpOperationDecorator;

      export interface DeleteArgs extends StrictOmit<HttpOperation.Options, 'method' | 'requestBody'> {
        type: Type | string;
        keyField?: string;
      }

      /** DeleteMany */
      export interface DeleteManyDecorator extends HttpOperationDecorator {
        Filter(
          field: OpraSchema.Field.QualifiedName,
          operators?: OpraFilter.ComparisonOperator[] | string,
          notes?: string,
        ): this;
      }

      export interface DeleteManyArgs extends StrictOmit<HttpOperation.Options, 'method' | 'requestBody'> {
        type: Type | string;
      }

      /** FindMany */
      export interface FindManyDecorator extends HttpOperationDecorator {
        SortFields(...fields: OpraSchema.Field.QualifiedName[]): FindManyDecorator;

        DefaultSort(...fields: OpraSchema.Field.QualifiedName[]): FindManyDecorator;

        Filter(
          field: OpraSchema.Field.QualifiedName,
          operators?: OpraFilter.ComparisonOperator[] | string,
          notes?: string,
        ): this;
      }

      export interface FindManyArgs extends StrictOmit<HttpOperation.Options, 'method' | 'requestBody'> {
        type: Type | string;
        defaultLimit?: number;
        maxLimit?: number;
      }

      /** Get */
      export interface GetDecorator extends HttpOperationDecorator {}

      export interface GetArgs extends StrictOmit<HttpOperation.Options, 'method' | 'requestBody'> {
        type: Type | string;
        keyField?: string;
      }

      /** Update */
      export interface UpdateDecorator extends HttpOperationDecorator {
        Filter(
          field: OpraSchema.Field.QualifiedName,
          operators?: OpraFilter.ComparisonOperator[] | string,
          notes?: string,
        ): this;
      }

      export interface UpdateArgs extends StrictOmit<HttpOperation.Options, 'method' | 'requestBody'> {
        type: Type | string;
        keyField?: string;
        requestBody?: Pick<HttpRequestBody.Options, 'description' | 'maxContentSize'> & {
          type?: Type | string;
          immediateFetch?: boolean;
        };
      }

      /** UpdateMany */
      export interface UpdateManyDecorator extends HttpOperationDecorator {
        Filter(
          field: OpraSchema.Field.QualifiedName,
          operators?: OpraFilter.ComparisonOperator[] | string,
          notes?: string,
        ): this;
      }

      export interface UpdateManyArgs extends StrictOmit<HttpOperation.Options, 'method' | 'requestBody'> {
        type: Type | string;
        requestBody?: Pick<HttpRequestBody.Options, 'description' | 'maxContentSize'> & {
          type?: Type | string;
          immediateFetch?: boolean;
        };
      }
    }
  }
}

/** Implementation **/

HttpOperation.Entity = {} as any;

/**
 * HttpOperation.Entity.Create
 */
HttpOperation.Entity.Create = function (arg0: any, arg1?: any): HttpOperation.Entity.CreateDecorator {
  let args: HttpOperation.Entity.CreateArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const decorator = HttpOperationDecoratorFactory(
    decoratorChain,
    omitUndefined({
      description: args.description,
      method: 'POST',
      composition: 'Entity.Create',
      requestBody: {
        immediateFetch: true,
        ...args.requestBody,
        required: true,
      },
    }),
  ) as HttpOperation.Entity.CreateDecorator;
  decorator
    .QueryParam('fields', {
      description: 'Determines fields to be exposed',
      type: new FieldPathType({
        dataType: args.type,
        allowSigns: 'each',
      }),
      isArray: true,
      arraySeparator: ',',
    })
    .RequestContent(args.requestBody?.type || args.type)
    .Response(HttpStatusCode.CREATED, {
      description:
        'Operation is successful. Returns OperationResult with "payload" field that contains the created resource.',
      contentType: MimeTypes.opra_response_json,
      type: args.type,
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description: 'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    });
  if (typeof args.type === 'function') decorator.UseType(args.type);

  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
  });
  return decorator;
};

/**
 * HttpOperation.Entity.Delete
 */
HttpOperation.Entity.Delete = function (arg0: any, arg1?: any): HttpOperation.Entity.DeleteDecorator {
  let args: HttpOperation.Entity.DeleteArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const decorator = HttpOperationDecoratorFactory(
    decoratorChain,
    omitUndefined({
      description: args.description,
      method: 'DELETE',
      composition: 'Entity.Delete',
    }),
  ) as HttpOperation.Entity.DeleteDecorator;
  decorator
    .Response(HttpStatusCode.OK, {
      description: 'Operation is successful. Returns OperationResult with "affected" field.',
      contentType: MimeTypes.opra_response_json,
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description: 'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    });
  if (typeof args.type === 'function') decorator.UseType(args.type);
  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
    compositionOptions.keyField = args.keyField;
  });
  return decorator;
};

/**
 * HttpOperation.Entity.DeleteMany
 */
HttpOperation.Entity.DeleteMany = function (arg0: any, arg1?: any): HttpOperation.Entity.DeleteManyDecorator {
  let args: HttpOperation.Entity.DeleteManyArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const filterRules = new FilterRules();
  const filterType = new FilterType({ dataType: args.type });
  const decorator = HttpOperationDecoratorFactory(
    decoratorChain,
    omitUndefined({
      description: args.description,
      method: 'DELETE',
      composition: 'Entity.DeleteMany',
    }),
  ) as HttpOperation.Entity.DeleteManyDecorator;
  decorator
    .Response(HttpStatusCode.OK, {
      description: 'Operation is successful. Returns OperationResult with "affected" field.',
      contentType: MimeTypes.opra_response_json,
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description: 'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    });
  if (typeof args.type === 'function') decorator.UseType(args.type);
  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
  });
  decorator.Filter = (
    field: OpraSchema.Field.QualifiedName,
    operators?: OpraFilter.ComparisonOperator[] | string,
    description?: string,
  ) => {
    decorator.QueryParam('filter', {
      type: filterType,
      description: 'Determines filter fields',
    });
    decoratorChain.push(() => {
      filterRules.set(field, { operators, description });
      filterType.rules = filterRules.toJSON();
    });
    return decorator;
  };
  return decorator;
};

/**
 * HttpOperation.Entity.FindMany
 */
HttpOperation.Entity.FindMany = function (arg0: any, arg1?: any): HttpOperation.Entity.FindManyDecorator {
  let args: HttpOperation.Entity.FindManyArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const filterRules = new FilterRules();
  const decorator = HttpOperationDecoratorFactory(
    decoratorChain,
    omitUndefined({
      description: args.description,
      method: 'GET',
      composition: 'Entity.FindMany',
    }),
  ) as HttpOperation.Entity.FindManyDecorator;
  decorator
    .Response(HttpStatusCode.OK, {
      description:
        'Operation is successful. Returns OperationResult with "payload" field that contains list of resources.',
      contentType: MimeTypes.opra_response_json,
      type: args.type,
      isArray: true,
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description: 'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    })
    .QueryParam('limit', {
      description: 'Determines number of returning instances',
      type: new IntegerType({ minValue: 1 }),
    })
    .QueryParam('skip', {
      description: 'Determines number of returning instances',
      type: new IntegerType({ minValue: 1 }),
    })
    .QueryParam('count', {
      description: 'Counts all matching instances if enabled',
      type: Boolean,
    })
    .QueryParam('fields', {
      description: 'Determines fields to be exposed',
      type: new FieldPathType({
        dataType: args.type,
        allowSigns: 'each',
      }),
      isArray: true,
      arraySeparator: ',',
    });
  if (typeof args.type === 'function') decorator.UseType(args.type);

  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
  });
  decorator.DefaultSort = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
      const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
      compositionOptions.defaultSort = fields;
    });
    return decorator;
  };
  decorator.SortFields = (...fields: OpraSchema.Field.QualifiedName[]) => {
    decorator.QueryParam('sort', {
      description: 'Determines sort fields',
      type: new FieldPathType({
        dataType: args.type,
        allowSigns: 'first',
      }),
      isArray: true,
      arraySeparator: ',',
    });
    decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
      const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
      compositionOptions.sortFields = fields;
    });
    return decorator;
  };
  decorator.Filter = (
    field: OpraSchema.Field.QualifiedName,
    operators?: OpraFilter.ComparisonOperator[] | string,
    description?: string,
  ) => {
    const filterType = new FilterType({ dataType: args.type });
    decorator.QueryParam('filter', {
      type: filterType,
      description: 'Determines filter fields',
    });
    decoratorChain.push(() => {
      filterRules.set(field, { operators, description });
      filterType.rules = filterRules.toJSON();
    });
    return decorator;
  };
  return decorator;
};

/**
 * HttpOperation.Entity.Get
 */
HttpOperation.Entity.Get = function (arg0: any, arg1?: any): HttpOperation.Entity.GetDecorator {
  let args: HttpOperation.Entity.GetArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const decorator = HttpOperationDecoratorFactory(
    decoratorChain,
    omitUndefined({
      description: args.description,
      method: 'GET',
      composition: 'Entity.Get',
    }),
  ) as HttpOperation.Entity.GetDecorator;
  decorator
    .QueryParam('fields', {
      description: 'Determines fields to be exposed',
      type: new FieldPathType({
        dataType: args.type,
        allowSigns: 'each',
      }),
      isArray: true,
      arraySeparator: ',',
    })
    .Response(HttpStatusCode.OK, {
      description:
        'Operation is successful. Returns OperationResult with "payload" field that contains the resource asked for.',
      contentType: MimeTypes.opra_response_json,
      type: args.type,
    })
    .Response(HttpStatusCode.NO_CONTENT, {
      description: 'Operation is successful but no resource found',
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description: 'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    });
  if (typeof args.type === 'function') decorator.UseType(args.type);

  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
    compositionOptions.keyField = args.keyField;
  });
  return decorator;
};

/**
 * HttpOperation.Entity.UpdateMany
 */
HttpOperation.Entity.UpdateMany = function (arg0: any, arg1?: any): HttpOperation.Entity.UpdateManyDecorator {
  let args: HttpOperation.Entity.UpdateManyArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const filterRules = new FilterRules();
  const decorator = HttpOperationDecoratorFactory(
    decoratorChain,
    omitUndefined({
      description: args.description,
      method: 'PATCH',
      composition: 'Entity.UpdateMany',
      requestBody: {
        immediateFetch: true,
        ...args.requestBody,
        required: true,
      },
    }),
  ) as HttpOperation.Entity.UpdateManyDecorator;
  decorator.RequestContent(args.requestBody?.type || args.type);
  if (typeof args.type === 'function') decorator.UseType(args.type);

  decorator
    .Response(HttpStatusCode.OK, {
      description: 'Operation is successful. Returns OperationResult with "affected" field.',
      contentType: MimeTypes.opra_response_json,
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description: 'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    });

  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
  });

  decorator.Filter = (
    field: OpraSchema.Field.QualifiedName,
    operators?: OpraFilter.ComparisonOperator[] | string,
    description?: string,
  ) => {
    const filterType = new FilterType({ dataType: args.type });
    decorator.QueryParam('filter', {
      type: filterType,
      description: 'Determines filter fields',
    });
    decoratorChain.push(() => {
      filterRules.set(field, { operators, description });
      filterType.rules = filterRules.toJSON();
    });
    return decorator;
  };
  return decorator;
};

/**
 * HttpOperation.Entity.Update
 */
HttpOperation.Entity.Update = function (arg0: any, arg1?: any): HttpOperation.Entity.UpdateDecorator {
  let args: HttpOperation.Entity.UpdateArgs;
  if (typeof arg0 === 'object' && !arg0[DATATYPE_METADATA]) {
    args = arg0;
  } else args = { ...arg1, type: arg0 };

  /** Initialize the decorator and the chain */
  const decoratorChain: Function[] = [];
  const filterRules = new FilterRules();
  const decorator = HttpOperationDecoratorFactory(
    decoratorChain,
    omitUndefined({
      description: args.description,
      method: 'PATCH',
      composition: 'Entity.Update',
      requestBody: {
        immediateFetch: true,
        ...args.requestBody,
        required: true,
      },
    }),
  ) as HttpOperation.Entity.UpdateDecorator;
  decorator
    .QueryParam('fields', {
      description: 'Determines fields to be exposed',
      type: new FieldPathType({
        dataType: args.type,
        allowSigns: 'each',
      }),
      isArray: true,
      arraySeparator: ',',
    })
    .RequestContent(args.requestBody?.type || args.type)
    .Response(HttpStatusCode.OK, {
      description:
        'Operation is successful. Returns OperationResult with "payload" field that contains updated resource.',
      contentType: MimeTypes.opra_response_json,
      type: args.type,
    })
    .Response(HttpStatusCode.NO_CONTENT, {
      description: 'Operation is successful but no resource found',
    })
    .Response(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      description: 'The request was well-formed but was unable to process operation due to one or many errors.',
      contentType: MimeTypes.opra_response_json,
    });
  if (typeof args.type === 'function') decorator.UseType(args.type);

  decoratorChain.push((operationMeta: HttpOperation.Metadata) => {
    const compositionOptions = (operationMeta.compositionOptions = operationMeta.compositionOptions || {});
    compositionOptions.type = getDataTypeName(args.type);
    compositionOptions.keyField = args.keyField;
  });

  decorator.Filter = (
    field: OpraSchema.Field.QualifiedName,
    operators?: OpraFilter.ComparisonOperator[] | string,
    description?: string,
  ) => {
    const filterType = new FilterType({ dataType: args.type });
    decorator.QueryParam('filter', {
      type: filterType,
      description: 'Determines filter fields',
    });
    decoratorChain.push(() => {
      filterRules.set(field, { operators, description });
      filterType.rules = filterRules.toJSON();
    });
    return decorator;
  };
  return decorator;
};

/**
 *
 * @param typ
 */
function getDataTypeName(typ: Type | string): string {
  if (typeof typ === 'string') return typ;
  const metadata = Reflect.getMetadata(DATATYPE_METADATA, typ);
  if (metadata?.name) return metadata.name;
  throw new TypeError(`Type (${typ}) is not decorated with any datatype decorators`);
}
