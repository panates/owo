import { UseGuards, UseInterceptors } from '@nestjs/common';
import { OprCollectionResource } from '@opra/common';
import { Cat } from './cat.dto.js';
import { CatsService } from './cats.service.js';
import { Interceptor } from './logging.interceptor.js';
import { Guard } from './request-scoped.guard.js';
import { UsersService } from './users.service.js';

@OprCollectionResource(Cat, {keyFields: 'id'})
export class CatsResource {
  static COUNTER = 0;

  constructor(
      private readonly catsService: CatsService,
      private readonly usersService: UsersService
  ) {
    CatsResource.COUNTER++;
  }

  @UseGuards(Guard)
  @UseInterceptors(Interceptor)
  get(): any[] {
    return this.catsService.getCats();
  }
}
