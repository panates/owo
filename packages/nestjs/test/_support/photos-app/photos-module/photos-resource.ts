import { UseGuards } from '@nestjs/common';
import { Collection } from '@opra/common';
import { RequestContext } from '@opra/core';
import { Context } from '@opra/nestjs';
import { AuthGuard } from '../guards/auth.guard.js';
import { Photos } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@Collection(Photos, {
  description: 'Photos resource',
  primaryKey: 'id'
})
export class PhotosResource {

  constructor(public photosService: PhotosService) {
  }

  @Collection.SearchOperation()
  async search(@Context ctx: RequestContext) {
    const {request} = ctx;
    return this.photosService.search(request.args.filter);
  }

  @UseGuards(AuthGuard)
  @Collection.CreateOperation()
  create(@Context ctx: RequestContext) {
    const {request} = ctx;
    return this.photosService.create(request.args.data);
  }

  @Collection.GetOperation()
  get(@Context ctx: RequestContext) {
    const {request} = ctx;
    return this.photosService.get(request.args.key);
  }

  @Collection.UpdateOperation()
  update(@Context ctx: RequestContext) {
    const {request} = ctx;
    return this.photosService.update(request.args.key, request.args.data);
  }

  @Collection.UpdateManyOperation()
  async updateMany(@Context ctx: RequestContext) {
    const {request} = ctx;
    return this.photosService.updateMany(request.args.data, request.args.filter);
  }

  @Collection.DeleteOperation()
  async delete(@Context ctx: RequestContext) {
    const {request} = ctx;
    return this.photosService.delete(request.args.key);
  }

  @Collection.DeleteManyOperation()
  async deleteMany(@Context ctx: RequestContext) {
    const {request} = ctx;
    return this.photosService.deleteMany(request.args.filter);
  }

}
