import { Logger, Module } from '@nestjs/common';
import { OpraHttpModule, OpraNestAdapter } from '@opra/nestjs';
import { CustomerModelsDocument } from 'customer-mongo';
import { AuthController } from '../api/auth.controller.js';
import { CustomerController } from '../api/customer.controller.js';
import { CustomerNotesController } from '../api/customer-notes.controller.js';
import { CustomersController } from '../api/customers-controller.js';
import { AppDbModule } from './app-db.module.js';

@Module({
  imports: [
    AppDbModule,
    OpraHttpModule.forRoot(
      {
        info: {
          title: 'Customer Application',
          version: '1.0',
        },
        references: {
          cm: () => CustomerModelsDocument.create(),
        },
        name: 'CustomerApi',
        controllers: [AuthController, CustomerController, CustomersController, CustomerNotesController],
      },
      {
        schemaRouteIsPublic: true,
      },
    ),
  ],
})
export class AppApiModule {
  readonly logger: Logger;

  constructor(readonly opraAdapter: OpraNestAdapter) {
    this.logger = new Logger(opraAdapter.document.api!.name!);
    opraAdapter.on('request', context => {
      const { request } = context;
      this.logger.verbose(`Request from: ${request.ip} | ${request.method} | ${request.url}`);
    });
    opraAdapter.on('error', (err: Error, context) => {
      const { request, response } = context;
      this.logger.error(`${response.statusCode}|${request.ip}|${err}`);
    });
  }
}
