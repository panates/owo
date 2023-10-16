import mongodb from 'mongodb';
import { Maybe } from 'ts-gems';
import { Collection, ICollection, PartialOutput } from '@opra/common';
import { RequestContext } from '@opra/core';
import { MongoAdapter } from './mongo-adapter.js';
import { MongoEntityService } from './mongo-entity-service.js';

export namespace MongoCollection {
  export interface Options {
    defaultLimit?: number;
  }
}

// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
export abstract class MongoCollection<T extends mongodb.Document> implements ICollection<T> {
  defaultLimit?: number;

  constructor(options?: MongoCollection.Options) {
    this.defaultLimit = options?.defaultLimit || 100;
  }

  @Collection.Create()
  async create?(ctx: Collection.Create.Context): Promise<PartialOutput<T>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.insertOne(prepared.data, prepared.options);
  }

  @Collection.Delete()
  async delete?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.deleteOne(prepared.filter, prepared.options);
  }

  @Collection.DeleteMany()
  async deleteMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.deleteMany(prepared.filter, prepared.options);
  }

  @Collection.Get()
  async get?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.findOne(prepared.filter, prepared.options);
  }

  @Collection.Update()
  async update?(ctx: RequestContext): Promise<Maybe<PartialOutput<T>>> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.updateOne(prepared.filter, prepared.data, prepared.options);
  }

  @Collection.UpdateMany()
  async updateMany?(ctx: RequestContext): Promise<number> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    return service.updateMany(prepared.filter, prepared.data, prepared.options);
  }

  @Collection.FindMany()
  async findMany?(ctx: RequestContext): Promise<PartialOutput<T>[]> {
    const prepared = await this._prepare(ctx);
    const service = await this.getService(ctx);
    if (prepared.options.count) {
      const [items, count] = await Promise.all([
        service.find(prepared.filter, prepared.options),
        service.count(prepared.filter, prepared.options)
      ]);
      ctx.response.totalMatches = count;
      return items;
    }
    return service.find(prepared.filter, prepared.options);
  }

  protected async _prepare(ctx: RequestContext): Promise<MongoAdapter.TransformedRequest> {
    const prepared = MongoAdapter.transformRequest(ctx.request);
    return (this.onPrepare && await this.onPrepare(ctx, prepared)) || prepared;
  }

  protected onPrepare?(ctx: RequestContext,
                       prepared: MongoAdapter.TransformedRequest): MongoAdapter.TransformedRequest | Promise<MongoAdapter.TransformedRequest>;

  protected abstract getService(ctx: RequestContext): MongoEntityService<T> | Promise<MongoEntityService<T>>;

}
