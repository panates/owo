import { Server } from 'http';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from './_support/photos-app/app.module.js';
import photosData from './_support/photos-app/photos-module/photos.data.js';

describe('OpraModule', function () {

  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    server = app.getHttpServer();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Should return query result', async function () {
    return request(server)
        .get('/api/svc1/Photos@1')
        .expect(200, photosData[0]);
  });

});