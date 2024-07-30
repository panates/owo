import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER, ModuleRef } from '@nestjs/core';
import { ApiDocumentFactory, isConstructor } from '@opra/common';
import { ExecutionContext, HttpAdapter } from '@opra/core';
import { asMutable } from 'ts-gems';
import { OPRA_HTTP_MODULE_OPTIONS } from './constants';
import type { OpraHttpModule } from './opra-http.module.js';
import { OpraNestAdapter } from './opra-nestjs-adapter.js';
import { OpraExceptionFilter } from './services/opra-exception-filter';
import { OpraMiddleware } from './services/opra-middleware.js';

@Module({})
@Global()
export class OpraHttpCoreModule implements OnModuleDestroy, NestModule {
  constructor(protected opraAdapter: OpraNestAdapter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OpraMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }

  static forRoot(init: OpraHttpModule.Initiator, options?: OpraHttpModule.Options): DynamicModule {
    const opraAdapter = new OpraNestAdapter(init, options);
    const token = init?.id || OpraNestAdapter;

    const providers = [
      ...(init?.providers || []),
      {
        provide: OPRA_HTTP_MODULE_OPTIONS,
        useValue: { ...options },
      },
      {
        provide: OpraNestAdapter,
        inject: [ModuleRef],
        useFactory: async (moduleRef: ModuleRef) => {
          asMutable(opraAdapter).document = await ApiDocumentFactory.createDocument({
            ...init,
            api: { protocol: 'http', name: init.name, controllers: init.controllers! },
          });
          opraAdapter.interceptors.map(x => {
            if (isConstructor(x)) {
              return (ctx: ExecutionContext, next: HttpAdapter.NextCallback) => {
                const interceptor = moduleRef.get(x);
                if (typeof interceptor.intercept === 'function') return interceptor.intercept(ctx, next());
              };
            }
            return x;
          });
          return opraAdapter;
        },
      },
      {
        provide: APP_FILTER,
        useClass: OpraExceptionFilter,
      },
    ];
    if (token !== OpraNestAdapter) {
      providers.push({
        provide: token,
        useValue: opraAdapter,
      });
    }
    return {
      module: OpraHttpCoreModule,
      controllers: opraAdapter.nestControllers,
      imports: [...(init?.imports || [])],
      exports: [...(init?.exports || []), token],
      providers,
    };
  }

  async onModuleDestroy() {
    await this.opraAdapter.close();
  }
}
