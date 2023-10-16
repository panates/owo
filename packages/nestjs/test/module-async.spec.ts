import { Server } from 'http';
import request from 'supertest';
import { INestApplication, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { OpraModule, OpraModuleRef } from '../src/index.js';
import { ApiRootModule } from './_support/photos-app/api/api.module.js';
import photosData from './_support/photos-app/api/photos-module/photos.data.js';
import config from './_support/photos-app/config.js';

@Module({
  imports: [OpraModule.forRootAsync({
    imports: [ApiRootModule],
    useFactory: async () => {
      return {
        ...config,
        basePath: 'svc1',
      }
    }
  })],
})
export class AsyncApplicationModule {
}

describe('OpraModule (async configuration)', function () {

  let server: Server;
  let app: INestApplication;
  let moduleRef: ModuleRef;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AsyncApplicationModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    moduleRef = app.get(ModuleRef);
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should register resources', async function () {
    const opraModuleRef = moduleRef.get(OpraModuleRef, {strict: false});
    expect(opraModuleRef).toBeDefined();
    expect(opraModuleRef.adapter).toBeDefined();
    expect(opraModuleRef.api).toBeDefined();
    expect(opraModuleRef.options).toBeDefined();
    expect(opraModuleRef.api.getCollection('Photos')).toBeDefined();
    expect(opraModuleRef.api.getStorage('PhotoStorage')).toBeDefined();
  })

  it('Should return query result', async function () {
    const r = await request(server)
        .get('/svc1/Photos@1');
    expect(r.body.errors).toStrictEqual(undefined);
    expect(r.status).toStrictEqual(200);
    expect(r.body.payload).toStrictEqual(photosData[0]);
  });

});
