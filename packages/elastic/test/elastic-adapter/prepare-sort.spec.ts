import { ElasticAdapter } from '@opra/elastic';

describe('ElasticAdapter.prepareSort', () => {
  afterAll(() => global.gc && global.gc());

  it('Should convert ascending sort fields', async () => {
    const o: any = ElasticAdapter.prepareSort(['id', '+address.city']);
    expect(o).toEqual([
      { id: { order: 'asc' } },
      { 'address.city': { order: 'asc' } },
    ]);
  });

  it('Should convert descending sort fields', async () => {
    const o: any = ElasticAdapter.prepareSort(['-id', '-address.city']);
    expect(o).toEqual([
      { id: { order: 'desc' } },
      { 'address.city': { order: 'desc' } },
    ]);
  });

  it('Should return undefined if array is empty', async () => {
    const o: any = ElasticAdapter.prepareSort([]);
    expect(o).toStrictEqual(undefined);
  });
});
