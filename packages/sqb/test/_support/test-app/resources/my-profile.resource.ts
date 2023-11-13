import { Singleton } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SqbEntityService, SqbSingleton } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { Profile } from '../entities/profile.entity.js';

@Singleton(Profile)
export class MyProfileResource extends SqbSingleton<Profile> {
  service: SqbEntityService<Profile>;

  constructor(readonly db: SqbClient) {
    super();
    this.service = new SqbEntityService(Profile, {db});
  }

  @Singleton.Create()
  create;

  @Singleton.Delete()
  delete;

  @Singleton.Get()
  get;

  @Singleton.Update()
      .InputOmitFields('_id')
  update;

  getService(ctx: RequestContext) {
    return this.service.forContext(ctx);
  }

}
