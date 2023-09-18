import merge from 'putil-merge';
import { Combine, StrictOmit } from 'ts-gems';
import type { ApiDocument } from '../api-document.js';
import { DECORATOR } from '../constants.js';
import { ComplexType } from '../data-type/complex-type.js';
import { CollectionClass } from './collection-class.js';
import { CollectionDecorator } from './collection-decorator.js';
import { Resource } from './resource.js';

export interface Collection extends CollectionClass {
}

export interface CollectionConstructor extends CollectionDecorator {
  prototype: CollectionClass;

  new(document: ApiDocument, init: Collection.InitArguments): CollectionClass;
}

/**
 * @class Collection
 * @decorator Collection
 */
export const Collection = function (this: CollectionClass | void, ...args: any[]) {

  // ClassDecorator
  if (!this) {
    const [type, options] = args;
    return Collection[DECORATOR].call(undefined, type, options);
  }

  // Constructor
  const [document, init] = args as [ApiDocument, Collection.InitArguments];
  merge(this, new CollectionClass(document, init), {descriptor: true});
} as CollectionConstructor;

Collection.prototype = CollectionClass.prototype;
Object.assign(Collection, CollectionDecorator);
Collection[DECORATOR] = CollectionDecorator;


/**
 * @namespace Collection
 */
export namespace Collection {

  export interface InitArguments extends Combine<Resource.InitArguments,
      StrictOmit<CollectionDecorator.Metadata, 'type'>> {
    name: string;
    type: ComplexType;
  }

  // Need for augmentation
  export namespace Create {
  }

  // Need for augmentation
  export namespace Delete {
  }

  // Need for augmentation
  export namespace DeleteMany {
  }

  // Need for augmentation
  export namespace FindMany {
  }

  // Need for augmentation
  export namespace Get {
  }

  // Need for augmentation
  export namespace Update {
  }

  // Need for augmentation
  export namespace UpdateMany {
  }

}


