import { Inject, Logger } from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module.js';
import { joinPath, normalizePath, OpraDocument } from '@opra/common';
import { OpraAdapter, OpraExpressAdapter } from '@opra/core';
import { OPRA_MODULE_OPTIONS } from '../constants.js';
import { OpraApiFactory } from '../factories/opra-api.factory.js';
import { OpraModuleOptions } from '../interfaces/opra-module-options.interface.js';

export class OpraApiLoader {
  private readonly logger = new Logger(OpraApiLoader.name, {timestamp: true});
  private adapter: OpraAdapter<any> | undefined;

  @Inject()
  protected readonly httpAdapterHost: HttpAdapterHost;

  @Inject()
  protected readonly applicationConfig: ApplicationConfig;

  @Inject()
  protected readonly opraFactory: OpraApiFactory;

  @Inject(OPRA_MODULE_OPTIONS)
  protected readonly opraModuleOptions: OpraModuleOptions;

  async initialize(rootModule: Module) {
    const httpAdapter = this.httpAdapterHost?.httpAdapter;
    const globalPrefix = this.applicationConfig.getGlobalPrefix();
    const platformName = httpAdapter.getType();
    const moduleOptions = this.opraModuleOptions;

    const prefix = '/' + normalizePath(joinPath(
        (moduleOptions.useGlobalPrefix !== false ? globalPrefix : ''), moduleOptions.prefix || ''), true);
    const name = moduleOptions.info?.title || 'untitled service';

    const options: OpraModuleOptions = {
      ...moduleOptions,
      prefix
    }

    try {
      const serviceHost = await this.opraFactory.generateService(rootModule, options, 'http');
      if (!Object.keys(serviceHost.resources).length) {
        this.logger.warn(`No resources found (${name})`);
        return;
      }

      if (platformName === 'express') {
        this.adapter = await this.registerExpress(serviceHost, options);
        // else if (platformName === 'fastify')
        // await this.registerFastify();
      } else { // noinspection ExceptionCaughtLocallyJS
        throw new Error(`No support for current HttpAdapter: ${platformName}`);
      }

      this.logger.log(`Mapped {${prefix}} to "${name}" service`);

    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async stop() {
    //
  }

  protected async registerExpress(service: OpraDocument, moduleOptions: OpraModuleOptions) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    if (!httpAdapter)
      return;
    const app = httpAdapter.getInstance();
    return OpraExpressAdapter.init(app, service, moduleOptions);
  }

}
