import { Singleton } from '@opra/common';
import { EndpointContext } from '@opra/core';
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

  getService(ctx: EndpointContext) {
    return this.service.with(ctx);
  }

}
