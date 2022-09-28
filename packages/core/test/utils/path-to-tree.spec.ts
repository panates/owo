import 'reflect-metadata';
import { pathToTree } from '../../src/utils/path-to-tree.js';

describe('pathToTree()', function () {

  it('Should wrap array of string paths to object tree', async () => {
    const out = pathToTree(['a', 'b', 'c.a.x', 'c.b']);
    expect(out).toStrictEqual({a: true, b: true, c: {a: {x: true}, b: true}});
  })

  it('Should ignore sub paths if whole path required', async () => {
    const out = pathToTree(['a.x', 'a', 'a.y', 'b', 'b.x']);
    expect(out).toStrictEqual({a: true, b: true});
  })

})
