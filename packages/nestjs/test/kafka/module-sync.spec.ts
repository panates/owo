import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD, ModuleRef } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import { Test } from '@nestjs/testing';
import { waitForMessage } from '@opra/kafka/test/_support/wait-for-message';
import { OpraKafkaModule, OpraKafkaNestjsAdapter } from '@opra/nestjs';
import { Kafka, logLevel } from 'kafkajs';
import { CatsService } from '../_support/test-app/cats.service.js';
import { DogsService } from '../_support/test-app/dogs.service.js';
import { KafkaCatsController } from '../_support/test-app/kafka/kafka-cats-controller.js';
import { KafkaDogsController } from '../_support/test-app/kafka/kafka-dogs-controller.js';
import { Cat } from '../_support/test-app/models/cat.js';
import { Dog } from '../_support/test-app/models/dog.js';
import { TestGlobalGuard } from '../_support/test-app/providers/global.guard.js';
import { GlobalInterceptor } from '../_support/test-app/providers/global.interceptor.js';

// set timeout to be longer (especially for the after hook)
jest.setTimeout(30000);

const kafkaBrokerHost = process.env.KAFKA_BROKER || 'localhost:9092';

describe('OpraKafkaModule - sync', () => {
  let nestApplication: INestApplication;
  let moduleRef: ModuleRef;
  let adapter: OpraKafkaNestjsAdapter;
  let producer: Producer;

  beforeAll(async () => {
    const kafka = new Kafka({
      clientId: 'opra-test',
      brokers: [kafkaBrokerHost],
      logLevel: logLevel.NOTHING,
    });

    const admin = kafka.admin();
    await admin.connect();
    for (const topic of ['feed-cat', 'feed-dog']) {
      try {
        const meta = await admin.fetchTopicMetadata({ topics: [topic] });
        if (meta.topics[0]) {
          await admin.deleteTopicRecords({ topic, partitions: [{ partition: 0, offset: '0' }] });
        }
      } catch {
        //
      }
    }
    await admin.disconnect();

    producer = kafka.producer({
      allowAutoTopicCreation: true,
    });
    await producer.connect();
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        OpraKafkaModule.forRoot({
          client: {
            brokers: [kafkaBrokerHost],
          },
          name: 'test',
          controllers: [KafkaCatsController, KafkaDogsController],
          providers: [CatsService, DogsService],
          types: [Cat, Dog],
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useExisting: TestGlobalGuard,
        },
        TestGlobalGuard,
        {
          provide: APP_INTERCEPTOR,
          useExisting: GlobalInterceptor,
        },
        GlobalInterceptor,
      ],
    }).compile();

    nestApplication = module.createNestApplication();
    await nestApplication.init();
    moduleRef = nestApplication.get(ModuleRef);
    adapter = moduleRef.get(OpraKafkaNestjsAdapter, { strict: false });
  });

  beforeEach(() => {
    CatsService.counters = {
      getCat: 0,
      getCats: 0,
      feedCat: 0,
    };
    DogsService.counters = {
      getDog: 0,
      getDogs: 0,
      feedDog: 0,
    };
  });

  afterAll(async () => {
    await producer.disconnect().catch(() => undefined);
    await nestApplication?.close().catch(() => undefined);
  });

  it('Should register adapter', async () => {
    expect(adapter).toBeDefined();
    expect(adapter.document).toBeDefined();
    expect(adapter.document.api).toBeDefined();
    expect(Array.from(adapter.document.rpcApi.controllers.keys())).toEqual(['Cats', 'Dogs']);
  });

  it('Should call DEFAULT scoped api', async () => {
    const key = faker.string.alpha(5);
    const payload: Cat = {
      id: faker.number.int(),
      name: faker.animal.cat(),
      age: faker.number.int({ max: 12 }),
    };
    const [ctx] = await Promise.all([
      waitForMessage(adapter.adapter, 'feedCat', key),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          producer
            .send({
              topic: 'feed-cat',
              messages: [
                {
                  key,
                  value: JSON.stringify(payload),
                },
              ],
            })
            .then(resolve)
            .catch(reject);
        }, 250);
      }),
    ]);
    expect(ctx).toBeDefined();
    expect(ctx?.key).toStrictEqual(key);
    expect(ctx?.payload).toEqual(payload);
    expect(CatsService.counters).toEqual({
      getCat: 0,
      getCats: 0,
      feedCat: 1,
    });
    expect(CatsService.instanceCounter).toEqual(1);
  });

  // it('Should call REQUEST scoped api', async () => {
  //   const key = faker.string.alpha(5);
  //   const payload: Dog = {
  //     id: faker.number.int(),
  //     name: faker.animal.dog(),
  //     age: faker.number.int({ max: 12 }),
  //   };
  //   await producer.send({
  //     topic: 'feed-dog',
  //     messages: [
  //       {
  //         key,
  //         value: JSON.stringify(payload),
  //       },
  //     ],
  //   });
  //   const ctx = await waitForMessage(adapter.adapter, 'feedDog', key);
  //   expect(ctx).toBeDefined();
  //   expect(ctx?.key).toStrictEqual(key);
  //   expect(ctx?.payload).toEqual(payload);
  //   expect(DogsService.counters).toEqual({
  //     getDog: 0,
  //     getDogs: 0,
  //     feedDog: 1,
  //   });
  //   expect(DogsService.instanceCounter).toEqual(1);
  // });

  // it('Should use router guards', async () => {
  //   const callCounter = AuthGuard.callCounter;
  //   const r = await request(server).get('/api/v1/cats').set('Authorization', 'reject-auth');
  //   expect(r.status).toStrictEqual(401);
  //   expect(AuthGuard.callCounter).toEqual(callCounter + 1);
  //   expect(AuthGuard.instanceCounter).toEqual(1);
  //   expect(HttpCatsController.instanceCounter).toEqual(1);
  // });
  //
  // it('Should use global guards', async () => {
  //   const callCounter = TestGlobalGuard.callCounter;
  //   const r = await request(server).get('/api/v1/cats').set('Authorization', 'reject-auth');
  //   expect(r.status).toStrictEqual(401);
  //   expect(TestGlobalGuard.callCounter).toEqual(callCounter + 1);
  //   expect(TestGlobalGuard.instanceCounter).toEqual(1);
  // });
  //
  // it('Should use global NextJS interceptors', async () => {
  //   const callCounter = GlobalInterceptor.callCounter;
  //   const r = await request(server).get('/api/v1/cats');
  //   expect(r.status).toStrictEqual(200);
  //   expect(GlobalInterceptor.callCounter).toEqual(callCounter + 1);
  //   expect(GlobalInterceptor.instanceCounter).toEqual(1);
  // });
  //
  // it('Should use router NextJS interceptors', async () => {
  //   const callCounter = TestInterceptor.callCounter;
  //   const r = await request(server).get('/api/v1/cats');
  //   expect(r.status).toStrictEqual(200);
  //   expect(TestInterceptor.callCounter).toEqual(callCounter + 1);
  //   expect(TestInterceptor.instanceCounter).toEqual(1);
  // });
  //
  // it('Should be able to disable guards for $schema route', async () => {
  //   const publicCounter = TestGlobalGuard.publicCounter;
  //   const r = await request(server).get('/api/v1/$schema');
  //   expect(r.status).toStrictEqual(200);
  //   expect(TestGlobalGuard.publicCounter).toEqual(publicCounter + 1);
  // });
});
