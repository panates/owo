import omit from 'lodash.omit';
import mongodb from 'mongodb';
import { PartialDTO, PatchDTO, Type } from 'ts-gems';
import { ComplexType, NotAcceptableError, ResourceNotAvailableError } from '@opra/common';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoCollectionService } from './mongo-collection-service.js';
import { MongoService } from './mongo-service.js';

import FilterInput = MongoAdapter.FilterInput;

/**
 *
 * @namespace MongoNestedService
 */
export namespace MongoNestedService {
  /**
   * The constructor options of MongoArrayService.
   */
  export interface Options extends MongoService.Options {
    defaultLimit?: number;
    nestedKey?: string;
    $nestedFilter?:
      | FilterInput
      | ((args: MongoService.CommandInfo, _this: this) => FilterInput | Promise<FilterInput> | undefined);
  }

  export interface CreateOptions extends MongoService.CreateOptions {}

  export interface CountOptions<T> extends MongoService.CountOptions<T> {
    documentFilter?: FilterInput;
  }

  export interface DeleteOptions<T> extends MongoService.DeleteOptions<T> {
    documentFilter?: FilterInput;
  }

  export interface DeleteManyOptions<T> extends MongoService.DeleteManyOptions<T> {
    documentFilter?: FilterInput;
  }

  export interface ExistsOptions<T> extends MongoService.ExistsOptions<T> {}

  export interface ExistsOneOptions<T> extends MongoService.ExistsOneOptions<T> {}

  export interface FindOneOptions<T> extends MongoService.FindOneOptions<T> {
    documentFilter?: FilterInput;
  }

  export interface FindManyOptions<T> extends MongoService.FindManyOptions<T> {
    documentFilter?: FilterInput;
    nestedFilter?: FilterInput;
  }

  export interface UpdateOptions<T> extends MongoService.UpdateOptions<T> {
    documentFilter?: FilterInput;
  }

  export interface UpdateManyOptions<T> extends MongoService.UpdateManyOptions<T> {
    documentFilter?: FilterInput;
    count?: boolean;
  }
}

/**
 * A class that provides methods to perform operations on an array field in a MongoDB collection.
 * @class MongoNestedService
 * @template T The type of the array item.
 */
export class MongoNestedService<T extends mongodb.Document> extends MongoService<T> {
  /**
   * Represents the name of the array field in parent document
   *
   * @type {string}
   */
  fieldName: string;

  /**
   * Represents the value of a nested array key field
   *
   * @type {string}
   */
  nestedKey: string;

  /**
   * Represents the default limit value for a certain operation.
   *
   * @type {number}
   */
  defaultLimit: number;

  /**
   * Represents a common array filter function
   *
   * @type {FilterInput | Function}
   */
  $nestedFilter?:
    | FilterInput
    | ((args: MongoService.CommandInfo, _this: this) => FilterInput | Promise<FilterInput> | undefined);

  /**
   * Constructs a new instance
   *
   * @param {Type | string} dataType - The data type of the array elements.
   * @param {string} fieldName - The name of the field in the document representing the array.
   * @param {MongoNestedService.Options} [options] - The options for the array service.
   * @constructor
   */
  constructor(dataType: Type | string, fieldName: string, options?: MongoNestedService.Options) {
    super(dataType, options);
    this.fieldName = fieldName;
    this.nestedKey = options?.nestedKey || '_id';
    this.defaultLimit = options?.defaultLimit || 10;
    this.$nestedFilter = options?.$nestedFilter;
  }

  /**
   * Asserts whether a resource with the specified parentId and id exists.
   * Throws a ResourceNotFoundError if the resource does not exist.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} id - The ID of the resource.
   * @param {MongoNestedService.ExistsOptions<T>} [options] - Optional parameters for checking resource existence.
   * @return {Promise<void>} - A promise that resolves with no value upon success.
   * @throws {ResourceNotAvailableError} - If the resource does not exist.
   */
  async assert(
    documentId: MongoAdapter.AnyId,
    id: MongoAdapter.AnyId,
    options?: MongoNestedService.ExistsOptions<T>,
  ): Promise<void> {
    if (!(await this.exists(documentId, id, options)))
      throw new ResourceNotAvailableError(this.getResourceName() + '.' + this.nestedKey, documentId + '/' + id);
  }

  /**
   * Adds a single item into the array field.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {T} input - The item to be added to the array field.
   * @param {MongoNestedService.CreateOptions} [options] - Optional options for the create operation.
   * @return {Promise<PartialDTO<T>>} - A promise that resolves with the partial output of the created item.
   * @throws {ResourceNotAvailableError} - If the parent document is not found.
   */
  async create(
    documentId: MongoAdapter.AnyId,
    input: PartialDTO<T>,
    options?: MongoNestedService.CreateOptions,
  ): Promise<PartialDTO<T>> {
    const id = (input as any)._id || this._generateId();
    if (id != null) (input as any)._id = id;
    const info: MongoService.CommandInfo = {
      crud: 'create',
      method: 'create',
      byId: false,
      documentId,
      nestedId: id,
      input,
      options,
    };
    return this._intercept(() => this._create(documentId, input, options), info);
  }

  protected async _create(
    documentId: MongoAdapter.AnyId,
    input: PartialDTO<T>,
    options?: MongoNestedService.CreateOptions,
  ): Promise<PartialDTO<T>> {
    const encode = this.getEncoder('create');
    const doc: any = encode(input);
    doc._id = doc._id || this._generateId();

    const docFilter = MongoAdapter.prepareKeyValues(documentId, ['_id']);
    const r = await this._dbUpdateOne(
      docFilter,
      {
        $push: { [this.fieldName]: doc } as any,
      },
      options,
    );
    if (r.matchedCount) {
      if (!options) return doc;
      const id = doc[this.nestedKey];
      const out = await this._findById(documentId, id, {
        ...options,
        filter: undefined,
        skip: undefined,
      });
      if (out) return out;
    }
    throw new ResourceNotAvailableError(this.getResourceName(), documentId);
  }

  /**
   * Counts the number of documents in the collection that match the specified parentId and options.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.CountOptions<T>} [options] - Optional parameters for counting.
   * @returns {Promise<number>} - A promise that resolves to the count of documents.
   */
  async count(documentId: MongoAdapter.AnyId, options?: MongoNestedService.CountOptions<T>): Promise<number> {
    const info: MongoService.CommandInfo = {
      crud: 'read',
      method: 'count',
      byId: false,
      documentId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info)]);
      const filter = MongoAdapter.prepareFilter([await this._getNestedFilter(info), options?.filter]);
      return this._count(documentId, { ...options, filter, documentFilter });
    }, info);
  }

  protected async _count(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.CountOptions<T>,
  ): Promise<number> {
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ]);
    const stages: mongodb.Document[] = [
      { $match: matchFilter },
      { $unwind: { path: '$' + this.fieldName } },
      { $replaceRoot: { newRoot: '$' + this.fieldName } },
    ];
    if (options?.filter) {
      const filter = MongoAdapter.prepareFilter(options?.filter);
      stages.push({ $match: filter });
    }
    stages.push({ $count: '*' });

    const r = await this._dbAggregate(stages, options);
    try {
      const n = await r.next();
      return n?.['*'] || 0;
    } finally {
      await r.close();
    }
  }

  /**
   * Deletes an element from an array within a document in the MongoDB collection.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the element to delete from the nested array.
   * @param {MongoNestedService.DeleteOptions<T>} [options] - Additional options for the delete operation.
   * @return {Promise<number>} - A Promise that resolves to the number of elements deleted (1 if successful, 0 if not).
   */
  async delete(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.DeleteOptions<T>,
  ): Promise<number> {
    const info: MongoService.CommandInfo = {
      crud: 'delete',
      method: 'delete',
      byId: true,
      documentId,
      nestedId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info)]);
      const filter = MongoAdapter.prepareFilter([await this._getNestedFilter(info), options?.filter]);
      return this._delete(documentId, nestedId, { ...options, filter, documentFilter });
    }, info);
  }

  protected async _delete(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.DeleteOptions<T>,
  ): Promise<number> {
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ]);
    const pullFilter =
      MongoAdapter.prepareFilter([MongoAdapter.prepareKeyValues(nestedId, [this.nestedKey]), options?.filter]) || {};
    const r = await this._dbUpdateOne(
      matchFilter,
      {
        $pull: { [this.fieldName]: pullFilter } as any,
      },
      options,
    );
    return r.modifiedCount ? 1 : 0;
  }

  /**
   * Deletes multiple items from a collection based on the parent ID and optional filter.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.DeleteManyOptions<T>} [options] - Optional options to specify a filter.
   * @returns {Promise<number>} - A Promise that resolves to the number of items deleted.
   */
  async deleteMany(documentId: MongoAdapter.AnyId, options?: MongoNestedService.DeleteManyOptions<T>): Promise<number> {
    const info: MongoService.CommandInfo = {
      crud: 'delete',
      method: 'deleteMany',
      byId: false,
      documentId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info)]);
      const filter = MongoAdapter.prepareFilter([await this._getNestedFilter(info), options?.filter]);
      return this._deleteMany(documentId, { ...options, filter, documentFilter });
    }, info);
  }

  protected async _deleteMany(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.DeleteManyOptions<T>,
  ): Promise<number> {
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
    ]);
    // Count matching items, we will use this as result
    const matchCount = await this.count(documentId, options);
    const pullFilter = MongoAdapter.prepareFilter(options?.filter) || {};
    const r = await this._dbUpdateOne(
      matchFilter,
      {
        $pull: { [this.fieldName]: pullFilter } as any,
      },
      options,
    );
    if (r.matchedCount) return matchCount;
    return 0;
  }

  /**
   * Checks if an array element with the given parentId and id exists.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} nestedId - The id of the record.
   * @param {MongoNestedService.ExistsOptions<T>} [options] - The options for the exists method.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the record exists or not.
   */
  async exists(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.ExistsOptions<T>,
  ): Promise<boolean> {
    return !!(await this.findById(documentId, nestedId, { ...options, projection: ['_id'] }));
  }

  /**
   * Checks if an object with the given arguments exists.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.ExistsOneOptions} [options] - The options for the query (optional).
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the object exists or not.
   */
  async existsOne(
    documentId: MongoAdapter.AnyId,
    options?: MongoCollectionService.ExistsOneOptions<T>,
  ): Promise<boolean> {
    return !!(await this.findOne(documentId, { ...options, projection: ['_id'] }));
  }

  /**
   * Finds an element in array field by its parent ID and ID.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the document.
   * @param {MongoNestedService.FindOneOptions<T>} [options] - The optional options for the operation.
   * @returns {Promise<PartialDTO<T> | undefined>} - A promise that resolves to the found document or undefined if not found.
   */
  async findById(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const info: MongoService.CommandInfo = {
      crud: 'read',
      method: 'findById',
      byId: true,
      documentId,
      nestedId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info)]);
      const filter = MongoAdapter.prepareFilter([await this._getNestedFilter(info), options?.filter]);
      return this._findById(documentId, nestedId, { ...options, filter, documentFilter });
    }, info);
  }

  protected async _findById(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const filter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(nestedId, [this.nestedKey]),
      options?.filter,
    ]);
    const rows = await this._findMany(documentId, {
      ...options,
      filter,
      limit: 1,
      skip: undefined,
      sort: undefined,
    });
    return rows?.[0];
  }

  /**
   * Finds the first array element that matches the given parentId.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document.
   * @param {MongoNestedService.FindOneOptions<T>} [options] - Optional options to customize the query.
   * @returns {Promise<PartialDTO<T> | undefined>} A promise that resolves to the first matching document, or `undefined` if no match is found.
   */
  async findOne(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const info: MongoService.CommandInfo = {
      crud: 'read',
      method: 'findOne',
      byId: false,
      documentId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info)]);
      const filter = MongoAdapter.prepareFilter([await this._getNestedFilter(info), options?.filter]);
      return this._findOne(documentId, { ...options, filter, documentFilter });
    }, info);
  }

  protected async _findOne(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const rows = await this._findMany(documentId, {
      ...options,
      limit: 1,
    });
    return rows?.[0];
  }

  /**
   * Finds multiple elements in an array field.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.FindManyOptions<T>} [options] - The options for finding the documents.
   * @returns {Promise<PartialDTO<T>[]>} - The found documents.
   */
  async findMany(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindManyOptions<T>,
  ): Promise<PartialDTO<T>[]> {
    const args: MongoService.CommandInfo = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      documentId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = await this._getDocumentFilter(args);
      const nestedFilter = await this._getNestedFilter(args);
      return this._findMany(documentId, {
        ...options,
        documentFilter,
        nestedFilter,
        limit: options?.limit || this.defaultLimit,
      });
    }, args);
  }

  protected async _findMany(
    documentId: MongoAdapter.AnyId,
    options: MongoNestedService.FindManyOptions<T>,
  ): Promise<PartialDTO<T>[]> {
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options.documentFilter,
    ]);
    const mongoOptions: mongodb.AggregateOptions = {
      ...omit(options, ['documentFilter', 'nestedFilter', 'projection', 'sort', 'skip', 'limit', 'filter', 'count']),
    };
    const limit = options?.limit || this.defaultLimit;
    const stages: mongodb.Document[] = [
      { $match: matchFilter },
      { $unwind: { path: '$' + this.fieldName } },
      { $replaceRoot: { newRoot: '$' + this.fieldName } },
    ];

    if (options?.filter || options.nestedFilter) {
      const optionsFilter = MongoAdapter.prepareFilter([options?.filter, options.nestedFilter]);
      stages.push({ $match: optionsFilter });
    }
    if (options?.skip) stages.push({ $skip: options.skip });
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) stages.push({ $sort: sort });
    }
    stages.push({ $limit: limit });

    const dataType = this.getDataType();
    const projection = MongoAdapter.prepareProjection(dataType, options?.projection);
    if (projection) stages.push({ $project: projection });
    const decode = this.getDecoder();

    const cursor = await this._dbAggregate(stages, mongoOptions);
    try {
      const out = await (await cursor.toArray()).map((r: any) => decode(r));
      return out;
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Finds multiple elements in an array field.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoNestedService.FindManyOptions<T>} [options] - The options for finding the documents.
   * @returns {Promise<PartialDTO<T>[]>} - The found documents.
   */
  async findManyWithCount(
    documentId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindManyOptions<T>,
  ): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const args: MongoService.CommandInfo = {
      crud: 'read',
      method: 'findMany',
      byId: false,
      documentId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = await this._getDocumentFilter(args);
      const nestedFilter = await this._getNestedFilter(args);
      return this._findManyWithCount(documentId, {
        ...options,
        documentFilter,
        nestedFilter,
        limit: options?.limit || this.defaultLimit,
      });
    }, args);
  }

  protected async _findManyWithCount(
    documentId: MongoAdapter.AnyId,
    options: MongoNestedService.FindManyOptions<T>,
  ): Promise<{
    count: number;
    items: PartialDTO<T>[];
  }> {
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options.documentFilter,
    ]);
    const mongoOptions: mongodb.AggregateOptions = {
      ...omit(options, ['pick', 'include', 'omit', 'sort', 'skip', 'limit', 'filter', 'count']),
    };
    const limit = options?.limit || this.defaultLimit;
    const dataStages: mongodb.Document[] = [];
    const stages: mongodb.Document[] = [
      { $match: matchFilter },
      { $unwind: { path: '$' + this.fieldName } },
      { $replaceRoot: { newRoot: '$' + this.fieldName } },
      {
        $facet: {
          data: dataStages,
          count: [{ $count: 'totalMatches' }],
        },
      },
    ];

    if (options?.filter || options.nestedFilter) {
      const optionsFilter = MongoAdapter.prepareFilter([options?.filter, options.nestedFilter]);
      dataStages.push({ $match: optionsFilter });
    }
    if (options?.skip) dataStages.push({ $skip: options.skip });
    if (options?.sort) {
      const sort = MongoAdapter.prepareSort(options.sort);
      if (sort) dataStages.push({ $sort: sort });
    }
    dataStages.push({ $limit: limit });

    const dataType = this.getDataType();
    const projection = MongoAdapter.prepareProjection(dataType, options?.projection);
    if (projection) dataStages.push({ $project: projection });
    const decode = this.getDecoder();

    const cursor: mongodb.AggregationCursor = await this._dbAggregate(stages, {
      ...mongoOptions,
    });
    try {
      const facetResult = await cursor.toArray();
      return {
        count: facetResult[0].count[0].totalMatches || 0,
        items: facetResult[0].data.map((r: any) => decode(r)),
      };
    } finally {
      if (!cursor.closed) await cursor.close();
    }
  }

  /**
   * Retrieves a specific item from the array of a document.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the item.
   * @param {MongoNestedService.FindOneOptions<T>} [options] - The options for finding the item.
   * @returns {Promise<PartialDTO<T>>} - The item found.
   * @throws {ResourceNotAvailableError} - If the item is not found.
   */
  async get(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    options?: MongoNestedService.FindOneOptions<T>,
  ): Promise<PartialDTO<T>> {
    const out = await this.findById(documentId, nestedId, options);
    if (!out)
      throw new ResourceNotAvailableError(this.getResourceName() + '.' + this.nestedKey, documentId + '/' + nestedId);
    return out;
  }

  /**
   * Updates an array element with new data and returns the updated element
   *
   * @param {AnyId} documentId - The ID of the document to update.
   * @param {AnyId} nestedId - The ID of the item to update within the document.
   * @param {PatchDTO<T>} input - The new data to update the item with.
   * @param {MongoNestedService.UpdateOptions<T>} [options] - Additional update options.
   * @returns {Promise<PartialDTO<T> | undefined>} The updated item or undefined if it does not exist.
   * @throws {Error} If an error occurs while updating the item.
   */
  async update(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    input: PatchDTO<T>,
    options?: MongoNestedService.UpdateOptions<T>,
  ): Promise<PartialDTO<T> | undefined> {
    const r = await this.updateOnly(documentId, nestedId, input, options);
    if (!r) return;
    const out = await this._findById(documentId, nestedId, {
      ...options,
      sort: undefined,
    });
    if (out) return out;
    throw new ResourceNotAvailableError(this.getResourceName() + '.' + this.nestedKey, documentId + '/' + nestedId);
  }

  /**
   * Update an array element with new data. Returns 1 if document updated 0 otherwise.
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the parent document.
   * @param {MongoAdapter.AnyId} nestedId - The ID of the document to update.
   * @param {PatchDTO<T>} input - The partial input object containing the fields to update.
   * @param {MongoNestedService.UpdateOptions<T>} [options] - Optional update options.
   * @returns {Promise<number>} - A promise that resolves to the number of elements updated.
   */
  async updateOnly(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    input: PatchDTO<T>,
    options?: MongoNestedService.UpdateOptions<T>,
  ): Promise<number> {
    const info: MongoService.CommandInfo = {
      crud: 'update',
      method: 'update',
      byId: true,
      documentId,
      nestedId,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info)]);
      const filter = MongoAdapter.prepareFilter([await this._getNestedFilter(info), options?.filter]);
      return this._updateOnly(documentId, nestedId, input, { ...options, filter, documentFilter });
    }, info);
  }

  protected async _updateOnly(
    documentId: MongoAdapter.AnyId,
    nestedId: MongoAdapter.AnyId,
    input: PatchDTO<T>,
    options?: MongoNestedService.UpdateOptions<T>,
  ): Promise<number> {
    let filter = MongoAdapter.prepareKeyValues(nestedId, [this.nestedKey]);
    if (options?.filter) filter = MongoAdapter.prepareFilter([filter, options?.filter]);
    return await this._updateMany(documentId, input, { ...options, filter });
  }

  /**
   * Updates multiple array elements in document
   *
   * @param {MongoAdapter.AnyId} documentId - The ID of the document to update.
   * @param {PatchDTO<T>} input - The updated data for the document(s).
   * @param {MongoNestedService.UpdateManyOptions<T>} [options] - Additional options for the update operation.
   * @returns {Promise<number>} - A promise that resolves to the number of documents updated.
   */
  async updateMany(
    documentId: MongoAdapter.AnyId,
    input: PatchDTO<T>,
    options?: MongoNestedService.UpdateManyOptions<T>,
  ): Promise<number> {
    const info: MongoService.CommandInfo = {
      crud: 'update',
      method: 'updateMany',
      documentId,
      byId: false,
      input,
      options,
    };
    return this._intercept(async () => {
      const documentFilter = MongoAdapter.prepareFilter([await this._getDocumentFilter(info)]);
      const filter = MongoAdapter.prepareFilter([await this._getNestedFilter(info), options?.filter]);
      return this._updateMany(documentId, input, { ...options, filter, documentFilter });
    }, info);
  }

  protected async _updateMany(
    documentId: MongoAdapter.AnyId,
    input: PatchDTO<T>,
    options?: MongoNestedService.UpdateManyOptions<T>,
  ): Promise<number> {
    const encode = this.getEncoder('update');
    const doc = encode(input, { coerce: true });
    if (!Object.keys(doc).length) return 0;
    const matchFilter = MongoAdapter.prepareFilter([
      MongoAdapter.prepareKeyValues(documentId, ['_id']),
      options?.documentFilter,
      { [this.fieldName]: { $exists: true } },
    ]);
    if (options?.filter) {
      const elemMatch = MongoAdapter.prepareFilter([options?.filter], { fieldPrefix: 'elem.' });
      options = options || {};
      options.arrayFilters = [elemMatch];
    }
    const update: any = MongoAdapter.preparePatch(doc, {
      fieldPrefix: this.fieldName + (options?.filter ? '.$[elem].' : '.$[].'),
    });

    const r = await this._dbUpdateOne(matchFilter, update, options);
    if (options?.count) return await this._count(documentId, options);
    return r.modifiedCount || 0;
  }

  /**
   * Retrieves the data type of the array field
   *
   * @returns {ComplexType} The complex data type of the field.
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  getDataType(): ComplexType {
    const t = super.getDataType().getField(this.fieldName).type;
    if (!(t instanceof ComplexType)) throw new NotAcceptableError(`Data type "${t.name}" is not a ComplexType`);
    return t;
  }

  /**
   * Retrieves the common filter used for querying array elements.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {FilterInput | Promise<FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getNestedFilter(args: MongoService.CommandInfo): FilterInput | Promise<FilterInput> | undefined {
    return typeof this.$nestedFilter === 'function' ? this.$nestedFilter(args, this) : this.$nestedFilter;
  }
}