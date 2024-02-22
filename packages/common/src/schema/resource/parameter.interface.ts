import { DataType } from '../data-type/data-type.interface.js';

export interface Parameter {

  /**
   * Name or the name pattern of the parameter
   */
  name: string | RegExp;

  /**
   * The location of the parameter
   */
  in: Parameter.Location;

  /**
   * Data type of the parameter
   */
  type?: DataType.Name | DataType;

  /**
   * Defines the description of the parameter
   */
  description?: string;

  /**
   * Indicates if the parameter value is an array
   */
  isArray?: boolean;

  /**
   * Indicates if parameter value required in create operation
   */
  required?: boolean;

  /**
   * Defines example values for the parameter
   */
  examples?: any[] | Record<string, any>;

  /**
   * Indicates if the parameter is deprecated and can be removed in the next
   */
  deprecated?: boolean | string;

  // instructions?: Record<string, any>;

}

export namespace Parameter {
  export type Location = 'query' | 'header' | 'cookie';
}
