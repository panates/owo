import { UseGuards } from '@nestjs/common';
import {
  CollectionCountQuery,
  CollectionCreateQuery, OpraDeleteCollectionQuery, OpraDeleteInstanceQuery, OpraGetInstanceQuery,
  OpraSearchCollectionQuery, OpraUpdateCollectionQuery, OpraUpdateInstanceQuery,
  OprCollectionResource
} from '@opra/schema';
import { Query } from '../../../../src/index.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { Photos } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@OprCollectionResource(Photos, {
  description: 'Photos resource',
  keyFields: 'id'
})
export class PhotosResource {

  constructor(public photosService: PhotosService) {
  }

  async search(@Query query: OpraSearchCollectionQuery) {
    return this.photosService.search(query.filter);
  }

  async count(@Query query: CollectionCountQuery) {
    return this.photosService.count(query.filter);
  }

  @UseGuards(AuthGuard)
  create(@Query query: CollectionCreateQuery) {
    return this.photosService.create(query.data);
  }

  get(@Query query: OpraGetInstanceQuery) {
    return this.photosService.get(query.keyValue);
  }

  update(@Query query: OpraUpdateInstanceQuery) {
    return this.photosService.update(query.keyValue, query.data);
  }

  async updateMany(@Query query: OpraUpdateCollectionQuery) {
    return this.photosService.updateMany(query.data, query.filter);
  }

  async delete(@Query query: OpraDeleteInstanceQuery) {
    return this.photosService.delete(query.keyValue);
  }

  async deleteMany(@Query query: OpraDeleteCollectionQuery) {
    return this.photosService.deleteMany(query.filter);
  }

}
