import { HttpStatusCodes } from '../../http/index.js';
import { translate } from '../../i18n/index.js';
import { OpraException } from '../opra-exception.js';

/**
 * The server cannot find the requested resource.
 * This can also mean that the endpoint is valid but the resource itself does not exist.
 */
export class ResourceNotFoundError extends OpraException {

  constructor(resource: string, keyValue?: any, cause?: Error) {
    super({
      message: translate(`error:RESOURCE_NOT_FOUND`,
          `Resource "${resource}${keyValue ? '/' + keyValue : ''}" not found`),
      severity: 'error',
      code: 'RESOURCE_NOT_FOUND',
      details: {
        resource,
        key: keyValue
      }
    }, cause, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }

}
