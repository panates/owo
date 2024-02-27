import type { MediaContent } from './media-content.interface.js';

export interface RequestBody {

  /**
   * A brief description.
   * [CommonMark](https://commonmark.org/) syntax MAY be used for rich text representation
   */
  description?: string;

  /**
   * Alternatives of media types
   */
  content: MediaContent[];

  /**
   * Determines if the request body is required.
   * Default `true` for POST and PATCH operations, `false` for other methods
   */
  required?: boolean;

  /**
   * Maximum accepted content size in bytes.
   */
  maxContentSize?: number;

}
