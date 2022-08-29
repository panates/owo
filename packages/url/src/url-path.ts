import {EventEmitter} from 'events';
import {nodeInspectCustom, ResourceKey} from './types.js';
import {encodePathComponent} from './utils/url-utils.js';

export class OpraURLPath extends EventEmitter {
  private _entries: OpraURLPathComponent[] = [];

  constructor() {
    super();
  }

  get size(): number {
    return this._entries.length;
  }

  add(component: OpraURLPathComponent | { resource: string; key?: ResourceKey }): void
  add(name: string, key?: ResourceKey): void
  add(component: any, key?: ResourceKey): void {
    if (component instanceof OpraURLPathComponent) {
      this._entries.push(component);
    } else if (typeof component === 'object')
      this._entries.push(new OpraURLPathComponent(component.resource, component.key));
    else
      this._entries.push(new OpraURLPathComponent(component, key));
    this.emit('change');
  }

  clear(): void {
    this._entries = [];
    this.emit('change');
  }

  get(index: number): OpraURLPathComponent {
    return this._entries[index];
  }

  entries(): IterableIterator<[OpraURLPathComponent, number]> {
    let i = -1;
    const arr = [...this._entries];
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        i++;
        return {
          done: i >= arr.length,
          value: [arr[i], i]
        }
      }
    };
  }

  values(): IterableIterator<OpraURLPathComponent> {
    let i = -1;
    const arr = [...this._entries];
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        i++;
        return {
          done: i >= arr.length,
          value: arr[i]
        }
      }
    };
  }

  forEach(callback: (name: string, key: ResourceKey, _this: this) => void) {
    for (const item of this._entries) {
      callback.call(this, item.resource, item.key, this);
    }
  }

  getResource(index: number): string | undefined {
    const v = this._entries[index];
    return v == null ? undefined : v.resource;
  }

  getKey(index: number): ResourceKey {
    const v = this._entries[index];
    return v == null ? undefined : v.key;
  }

  toString(): string {
    return this._entries.map(x => '' + x).join('/');
  }

  [Symbol.iterator](): IterableIterator<[OpraURLPathComponent, number]> {
    return this.entries();
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    return this._entries;
  }

}

export class OpraURLPathComponent {
  constructor(public resource: string, public key?: ResourceKey) {
  }

  toString() {
    const obj = encodePathComponent(this.resource, this.key);
    if (obj)
      Object.setPrototypeOf(obj, OpraURLPathComponent.prototype);
    return obj;
  }

  /* istanbul ignore next */
  [nodeInspectCustom]() {
    const out: any = {
      resource: this.resource,
    };
    if (this.key != null)
      out.key = this.key;
    return out;
  }
}
