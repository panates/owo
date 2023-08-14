import { FallbackLng, I18n, LanguageResource } from '@opra/common';
import { ILogger, OperationContext } from '@opra/core';
import { RequestHandler } from './interfaces/request-handler.interface.js';

export type Protocol = 'http' | 'ws' | 'rpc';

export interface PlatformAdapter extends RequestHandler {
  readonly protocol: Protocol;
  readonly platform: string;
  readonly serviceName: string;

  /**
   * Calls shutDown hook for all resources
   */
  close(): Promise<void>;
}


/**
 * @namespace PlatformAdapter
 */
export namespace PlatformAdapter {

  export interface Options {
    i18n?: I18n | I18nOptions | (() => Promise<I18n>);
    logger?: ILogger;
    on?: {
      request?: (ctx: OperationContext) => void | Promise<void>;
    }
  }

  export interface I18nOptions {
    /**
     * Language to use
     * @default undefined
     */
    lng?: string;

    /**
     * Language to use if translations in user language are not available.
     * @default 'dev'
     */
    fallbackLng?: false | FallbackLng;

    /**
     * Default namespace used if not passed to translation function
     * @default 'translation'
     */
    defaultNS?: string;

    /**
     * Resources to initialize with
     * @default undefined
     */
    resources?: LanguageResource;

    /**
     * Resource directories to initialize with (if not using loading or not appending using addResourceBundle)
     * @default undefined
     */
    resourceDirs?: string[];
  }
}