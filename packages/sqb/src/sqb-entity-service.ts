import { ComplexType, DataType, InternalServerError } from '@opra/common';
import { ServiceBase } from '@opra/core';
import { EntityMetadata, Repository, SqbClient, SqbConnection } from '@sqb/connect';
import { PartialDTO, PatchDTO, RequiredSome, StrictOmit, Type } from 'ts-gems';
import { isNotNullish, IsObject } from 'valgen';
import { SQBAdapter } from './sqb-adapter.js';

/**
 * @namespace SqbEntityService
 */
export namespace SqbEntityService {
  export interface Options {
    db?: SqbEntityService<any>['db'];
    resourceName?: SqbEntityService<any>['resourceName'];
    onError?: SqbEntityService<any>['onError'];
    commonFilter?: SqbEntityService<any>['commonFilter'];
    interceptor?: SqbEntityService<any>['interceptor'];
  }

  export type CrudOp = 'create' | 'read' | 'update' | 'delete';

  export interface CommandInfo {
    crud: SqbEntityService.CrudOp;
    method: string;
    byId: boolean;
    documentId?: SQBAdapter.IdOrIds;
    input?: Record<string, any>;
    options?: Record<string, any>;
  }

  /**
   * Represents options for "create" operation
   *
   * @interface
   */
  export interface CreateOptions extends Repository.CreateOptions {}

  /**
   * Represents options for "count" operation
   *
   * @interface
   */
  export interface CountOptions extends Repository.CountOptions {}

  /**
   * Represents options for "delete" operation
   *
   * @interface
   */
  export interface DeleteOptions extends Repository.DeleteOptions {}

  /**
   * Represents options for "deleteMany" operation
   *
   * @interface
   */
  export interface DeleteManyOptions extends Repository.DeleteManyOptions {}

  /**
   * Represents options for "exists" operation
   *
   * @interface
   */
  export interface ExistsOptions extends Repository.ExistsOptions {}

  /**
   * Represents options for "existsOne" operation
   *
   * @interface
   */
  export interface ExistsOneOptions extends Repository.ExistsOptions {}

  /**
   * Represents options for "findOne" operation
   *
   * @interface
   */
  export interface FindOneOptions extends Repository.FindOneOptions {}

  /**
   * Represents options for "findMany" operation
   *
   * @interface
   */
  export interface FindManyOptions extends Repository.FindManyOptions {}

  /**
   * Represents options for "update" operation
   *
   * @interface
   */
  export interface UpdateOneOptions extends Repository.UpdateOptions {}

  /**
   * Represents options for "updateMany" operation
   *
   * @interface
   */
  export interface UpdateManyOptions extends Repository.UpdateManyOptions {}

  export interface CreateCommand extends StrictOmit<RequiredSome<CommandInfo, 'input'>, 'documentId'> {
    crud: 'create';
    options?: CreateOptions;
  }

  export interface CountCommand extends StrictOmit<CommandInfo, 'documentId' | 'input'> {
    crud: 'read';
    options?: CountOptions;
  }

  export interface DeleteOneCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'delete';
    options?: DeleteOptions;
  }

  export interface DeleteManyCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'delete';
    options?: DeleteManyOptions;
  }

  export interface ExistsCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'read';
    options?: ExistsOptions;
  }

  export interface FindOneCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'read';
    options?: FindOneOptions;
  }

  export interface FindManyCommand extends StrictOmit<CommandInfo, 'input'> {
    crud: 'read';
    options?: FindManyOptions;
  }

  export interface UpdateOneCommand<T> extends CommandInfo {
    crud: 'update';
    input: PatchDTO<T>;
    options?: UpdateOneOptions;
  }

  export interface UpdateManyCommand<T> extends CommandInfo {
    crud: 'update';
    input: PatchDTO<T>;
    options?: UpdateManyOptions;
  }
}

export interface SqbEntityService {
  /**
   * Interceptor function for handling callback execution with provided arguments.
   * @type Function
   * @param next - The callback function to be intercepted.
   * @param {SqbEntityService.CommandInfo} command - The arguments object containing the following properties:
   * @param _this - The reference to the current object.
   * @returns - The promise that resolves to the result of the callback execution.
   */
  interceptor?(next: () => any, command: SqbEntityService.CommandInfo, _this: any): Promise<any>;
}

/**
 * @class SqbEntityService
 * @template T - The data type class type of the resource
 */
export class SqbEntityService<T extends object = object> extends ServiceBase {
  protected _dataType_: Type | string;
  protected _dataType: ComplexType;
  protected _dataTypeClass?: Type;
  protected _entityMetadata?: EntityMetadata;
  protected _inputCodecs: Record<string, IsObject.Validator<T>> = {};
  protected _outputCodecs: Record<string, IsObject.Validator<T>> = {};

  /**
   * Represents a SqbClient or SqbConnection object
   */
  db?: (SqbClient | SqbConnection) | ((_this: any) => SqbClient | SqbConnection);
  /**
   * Represents the name of a resource.
   * @type {string}
   */
  resourceName?: string | ((_this: any) => string);

  /**
   * Represents a common filter function for a service.
   *
   * @type {SqbEntityService.Filter | Function}
   */
  commonFilter?:
    | SQBAdapter.FilterInput
    | ((
        args: SqbEntityService.CommandInfo,
        _this: this,
      ) => SQBAdapter.FilterInput | Promise<SQBAdapter.FilterInput> | undefined);

  /**
   * Callback function for handling errors.
   *
   * @param {unknown} error - The error object.
   * @param {SqbEntityService} _this - The context object.
   */
  onError?: (error: unknown, _this: any) => void | Promise<void>;

  /**
   * Constructs a new instance
   *
   * @param dataType - The data type of the returning results
   * @param [options] - The options for the service.
   * @constructor
   */
  constructor(dataType: Type<T> | string, options?: SqbEntityService.Options) {
    super();
    this._dataType_ = dataType;
    this.db = options?.db;
    this.resourceName = options?.resourceName;
    this.commonFilter = options?.commonFilter;
    this.interceptor = options?.interceptor;
  }

  /**
   * Retrieves the OPRA data type
   *
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  get dataType(): ComplexType {
    if (!this._dataType) this._dataType = this.context.document.node.getComplexType(this._dataType_);
    return this._dataType;
  }

  /**
   * Retrieves the Class of the data type
   *
   * @throws {NotAcceptableError} If the data type is not a ComplexType.
   */
  get dataTypeClass(): Type {
    if (!this._dataTypeClass) this._dataTypeClass = this.entityMetadata.ctor;
    return this._dataTypeClass;
  }

  /**
   * Retrieves the SQB entity metadata object
   *
   * @throws {TypeError} If metadata is not available
   */
  get entityMetadata(): EntityMetadata {
    if (!this._entityMetadata) {
      const t = this.dataType.ctor!;
      const metadata = EntityMetadata.get(t);
      if (!metadata) throw new TypeError(`Class (${t}) is not decorated with $Entity() decorator`);
      this._entityMetadata = metadata;
    }
    return this._entityMetadata!;
  }

  /**
   * Retrieves the resource name.
   *
   * @returns {string} The resource name.
   * @throws {Error} If the collection name is not defined.
   */
  getResourceName(): string {
    const out =
      typeof this.resourceName === 'function' ? this.resourceName(this) : this.resourceName || this.dataType.name;
    if (out) return out;
    throw new Error('resourceName is not defined');
  }

  /**
   * Retrieves the codec for the specified operation.
   *
   * @param operation - The operation to retrieve the encoder for. Valid values are 'create' and 'update'.
   */
  getInputCodec(operation: string): IsObject.Validator<T> {
    let validator = this._inputCodecs[operation];
    if (validator) return validator;
    const options: DataType.GenerateCodecOptions = { projection: '*' };
    if (operation === 'update') options.partial = 'deep';
    const dataType = this.dataType;
    validator = dataType.generateCodec('decode', options) as IsObject.Validator<T>;
    this._inputCodecs[operation] = validator;
    return validator;
  }

  /**
   * Retrieves the codec.
   */
  getOutputCodec(operation: string): IsObject.Validator<T> {
    let validator = this._outputCodecs[operation];
    if (validator) return validator;
    const options: DataType.GenerateCodecOptions = { projection: '*', partial: 'deep' };
    const dataType = this.dataType;
    validator = dataType.generateCodec('decode', options) as IsObject.Validator<T>;
    this._outputCodecs[operation] = validator;
    return validator;
  }

  /**
   * Insert a new record into database
   *
   * @param command
   * @returns - A promise that resolves to the created resource
   * @protected
   */
  protected async _create(command: SqbEntityService.CreateCommand): Promise<PartialDTO<T>> {
    const { input, options } = command;
    isNotNullish(command.input, { label: 'input' });
    const inputCodec = this.getInputCodec('create');
    const outputCodec = this.getOutputCodec('create');
    const data: any = inputCodec(input);
    const out = await this._dbCreate(data, options);
    if (out) return outputCodec(out);
    throw new InternalServerError(`Unknown error while creating document for "${this.getResourceName()}"`);
  }

  /**
   * Returns the count of records based on the provided options
   *
   * @param command
   * @return - A promise that resolves to the count of records
   * @protected
   */
  protected async _count(command: SqbEntityService.CountCommand): Promise<number> {
    return this._dbCount(command.options);
  }

  /**
   * Deletes a record from the collection.
   *
   * @param command
   * @return - A Promise that resolves to the number of documents deleted.
   * @protected
   */
  protected async _delete(command: SqbEntityService.DeleteOneCommand): Promise<number> {
    isNotNullish(command.documentId, { label: 'documentId' });
    return this._dbDelete(command.documentId!, command.options);
  }

  /**
   * Deletes multiple documents from the collection that meet the specified filter criteria.
   *
   * @param command
   * @return - A promise that resolves to the number of documents deleted.
   * @protected
   */
  protected async _deleteMany(command: SqbEntityService.DeleteManyCommand): Promise<number> {
    return await this._dbDeleteMany(command.options);
  }

  /**
   * Checks if a record with the given id exists.
   *
   * @param command
   * @protected
   */
  protected async _exists(command: SqbEntityService.ExistsCommand): Promise<boolean> {
    isNotNullish(command.documentId, { label: 'documentId' });
    return await this._dbExists(command.documentId!, command.options);
  }

  /**
   * Checks if a record with the given arguments exists.
   *
   * @param command
   * @return - A Promise that resolves to a boolean indicating whether the record exists or not.
   * @protected
   */
  protected async _existsOne(command: SqbEntityService.ExistsCommand): Promise<boolean> {
    return await this._dbExistsOne(command.options);
  }

  /**
   * Finds a record by ID.
   *
   * @param command
   * @return - A promise resolving to the found document, or undefined if not found.
   * @protected
   */
  protected async _findById(command: SqbEntityService.FindOneCommand): Promise<PartialDTO<T> | undefined> {
    isNotNullish(command.documentId, { label: 'documentId' });
    const decode = this.getOutputCodec('find');
    const out = await this._dbFindById(command.documentId!, command.options);
    return out ? (decode(out) as PartialDTO<T>) : undefined;
  }

  /**
   * Finds a record in the collection that matches the specified options.
   *
   * @param command
   * @return - A promise that resolves with the found document or undefined if no document is found.
   * @protected
   */
  protected async _findOne(command: SqbEntityService.FindOneCommand): Promise<PartialDTO<T> | undefined> {
    const decode = this.getOutputCodec('find');
    const out = await this._dbFindOne(command.options);
    return out ? (decode(out) as PartialDTO<T>) : undefined;
  }

  /**
   * Finds multiple records in collection.
   *
   * @param command
   * @return - A Promise that resolves to an array of partial outputs of type T.
   * @protected
   */
  protected async _findMany(command: SqbEntityService.FindManyCommand): Promise<PartialDTO<T>[]> {
    const decode = this.getOutputCodec('find');
    const out: any[] = await this._dbFindMany(command.options);
    if (out?.length) {
      return out.map(x => decode(x)) as any;
    }
    return out;
  }

  /**
   * Updates a record with the given id in the collection.
   *
   * @param command
   * @returns  A promise that resolves to the updated document or undefined if the document was not found.
   * @protected
   */
  protected async _update(command: SqbEntityService.UpdateOneCommand<T>): Promise<PartialDTO<T> | undefined> {
    isNotNullish(command.documentId, { label: 'documentId' });
    isNotNullish(command.input, { label: 'input' });
    const { documentId, input, options } = command;
    const inputCodec = this.getInputCodec('update');
    const data: any = inputCodec(input);
    const out = await this._dbUpdate(documentId!, data, options);
    const outputCodec = this.getOutputCodec('update');
    if (out) return outputCodec(out);
  }

  /**
   * Updates a record in the collection with the specified ID and returns updated record count
   *
   * @param command
   * @returns - A promise that resolves to the number of documents modified.
   * @protected
   */
  protected async _updateOnly(command: SqbEntityService.UpdateOneCommand<T>): Promise<boolean> {
    isNotNullish(command.documentId, { label: 'documentId' });
    isNotNullish(command.input, { label: 'input' });
    const { documentId, input, options } = command;
    const inputCodec = this.getInputCodec('update');
    const data: any = inputCodec(input);
    return await this._dbUpdateOnly(documentId!, data, options);
  }

  /**
   * Updates multiple records in the collection based on the specified input and options.
   *
   * @param command
   * @return - A promise that resolves to the number of documents matched and modified.
   * @protected
   */
  protected async _updateMany(command: SqbEntityService.UpdateOneCommand<T>): Promise<number> {
    isNotNullish(command.input, { label: 'input' });
    const inputCodec = this.getInputCodec('update');
    const data: any = inputCodec(command.input);
    return await this._dbUpdateMany(data, command.options);
  }

  /**
   * Acquires a connection and performs Repository.create operation
   *
   * @param input - The document to insert
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbCreate(input: PartialDTO<T>, options?: Repository.CreateOptions): Promise<PartialDTO<T>> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    return await repo.create(input as any, options);
  }

  /**
   * Acquires a connection and performs Repository.count operation
   *
   * @param options - The options for counting documents.
   * @protected
   */
  protected async _dbCount(options?: Repository.CountOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.count(options);
  }

  /**
   * Acquires a connection and performs Repository.delete operation
   *
   * @param id - Value of the key field used to select the record
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbDelete(id: SQBAdapter.IdOrIds, options?: Repository.DeleteOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return (await repo.delete(id, options)) ? 1 : 0;
  }

  /**
   * Acquires a connection and performs Repository.deleteMany operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbDeleteMany(options?: Repository.DeleteManyOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.deleteMany(options);
  }

  /**
   * Acquires a connection and performs Repository.exists operation
   *
   * @param id - Value of the key field used to select the record
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbExists(id: SQBAdapter.IdOrIds, options?: Repository.ExistsOptions): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.exists(id, options);
  }

  /**
   * Acquires a connection and performs Repository.existsOne operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbExistsOne(options?: Repository.ExistsOptions): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.existsOne(options);
  }

  /**
   * Acquires a connection and performs Repository.findById operation
   *
   * @param id - Value of the key field used to select the record
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindById(
    id: SQBAdapter.IdOrIds,
    options?: Repository.FindOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.findById(id, options);
  }

  /**
   * Acquires a connection and performs Repository.findOne operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindOne(options?: Repository.FindOneOptions): Promise<PartialDTO<T> | undefined> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.findOne(options);
  }

  /**
   * Acquires a connection and performs Repository.findMany operation
   *
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbFindMany(options?: Repository.FindManyOptions): Promise<PartialDTO<T>[]> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.findMany(options);
  }

  /**
   * Acquires a connection and performs Repository.update operation
   *
   * @param id - Value of the key field used to select the record
   * @param data - The update values to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdate(
    id: SQBAdapter.IdOrIds,
    data: PatchDTO<T>,
    options?: Repository.UpdateOptions,
  ): Promise<PartialDTO<T> | undefined> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.update(id, data, options);
  }

  /**
   * Acquires a connection and performs Repository.updateOnly operation
   *
   * @param id - Value of the key field used to select the record
   * @param data - The update values to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdateOnly(
    id: SQBAdapter.IdOrIds,
    data: PatchDTO<T>,
    options?: Repository.UpdateOptions,
  ): Promise<boolean> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.updateOnly(id, data, options);
  }

  /**
   * Acquires a connection and performs Repository.updateMany operation
   *
   * @param data - The update values to be applied to the document
   * @param options - Optional settings for the command
   * @protected
   */
  protected async _dbUpdateMany(data: PatchDTO<T>, options?: Repository.UpdateManyOptions): Promise<number> {
    const conn = await this.getConnection();
    const repo = conn.getRepository(this.dataTypeClass);
    if (options?.filter) options.filter = SQBAdapter.parseFilter(options.filter);
    return await repo.updateMany(data as any, options);
  }

  /**
   * Retrieves the database connection.
   *
   * @protected
   *
   * @throws {Error} If the context or database is not set.
   */
  protected getConnection(): SqbConnection | SqbClient | Promise<SqbConnection | SqbClient> {
    const db = typeof this.db === 'function' ? this.db(this) : this.db;
    if (!db) throw new Error(`Database not set!`);
    return db;
  }

  /**
   * Retrieves the common filter used for querying documents.
   * This method is mostly used for security issues like securing multi-tenant applications.
   *
   * @protected
   * @returns {FilterInput | Promise<FilterInput> | undefined} The common filter or a Promise
   * that resolves to the common filter, or undefined if not available.
   */
  protected _getCommonFilter(args: {
    crud: SqbEntityService.CrudOp;
    method: string;
    byId: boolean;
    documentId?: SQBAdapter.IdOrIds;
    input?: Object;
    options?: Record<string, any>;
  }): SQBAdapter.FilterInput | Promise<SQBAdapter.FilterInput> | undefined {
    return typeof this.commonFilter === 'function' ? this.commonFilter(args, this) : this.commonFilter;
  }

  protected async _executeCommand(command: SqbEntityService.CommandInfo, commandFn: () => any): Promise<any> {
    let proto: any;
    const next = async () => {
      proto = proto ? Object.getPrototypeOf(proto) : this;
      while (proto) {
        if (proto.interceptor && Object.prototype.hasOwnProperty.call(proto, 'interceptor')) {
          return await proto.interceptor.call(this, next, command, this);
        }
        proto = Object.getPrototypeOf(proto);
        if (!(proto instanceof SqbEntityService)) break;
      }
      return commandFn();
    };
    try {
      return await next();
    } catch (e: any) {
      Error.captureStackTrace(e, this._executeCommand);
      await this.onError?.(e, this);
      throw e;
    }
  }
}
