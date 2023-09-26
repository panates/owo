import { ApiDocumentFactory } from '@opra/common';
import { AuthController } from './resources/auth.controller.js';
import { CustomersResource } from './resources/customers.resource.js';
import { FilesResource } from './resources/files.resource.js';

export * from './resources/customers.resource.js';
export * from './resources/my-profile.resource.js';
export * from './entities/customer.entity.js';
export * from './entities/country.entity.js';
export * from './entities/profile.entity.js';

export async function createTestApi() {
  return ApiDocumentFactory.createDocument({
    version: '1.0',
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    root: {
      resources: [
        AuthController,
        CustomersResource,
        FilesResource
      ]
    }
  });
}
