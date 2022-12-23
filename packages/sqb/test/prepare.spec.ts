import {
  CollectionCreateQuery,
  CollectionDeleteManyQuery,
  CollectionDeleteQuery,
  CollectionGetQuery,
  CollectionSearchQuery,
  CollectionUpdateManyQuery,
  CollectionUpdateQuery,
  OpraDocument
} from '@opra/common';
import { OperatorType, SerializationType } from '@sqb/builder';
import { SQBAdapter } from '../src/index.js';
import { createApp } from './_support/app/index.js';

describe('SQBAdapter.prepare', function () {
  let api: OpraDocument;

  beforeAll(async () => {
    api = (await createApp()).api;
  })

  describe('CreateInstanceQuery', function () {
    it('Should prepare', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getResource('Customers'), values);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.args).toStrictEqual([o.values, o.options]);
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getCollectionResource('Customers'), values, {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare "omit" option', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getCollectionResource('Customers'), values, {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'country.name']);
      expect(o.args).toStrictEqual([o.values, o.options]);
    });

    it('Should prepare "include" option', async () => {
      const values = {a: 1};
      const query = new CollectionCreateQuery(api.getCollectionResource('Customers'), values, {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('create');
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'country.name']);
      expect(o.args).toStrictEqual([o.values, o.options]);
    });
  });

  describe('CollectionGetQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionGetQuery(api.getResource('Customers'), 1);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
    });

    it('Should prepare with "pick" option', async () => {
      const query = new CollectionGetQuery(api.getCollectionResource('Customers'), 1, {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const query = new CollectionGetQuery(api.getCollectionResource('Customers'), 1, {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "include" option', async () => {
      const query = new CollectionGetQuery(api.getCollectionResource('Customers'), 1, {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findByPk');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'country.name']);
    });
  });

  describe('CollectionSearchQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionSearchQuery(api.getResource('Customers'));
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({});
      expect(o.args).toStrictEqual([o.options]);
    })

    it('Should prepare "limit" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {limit: 5});
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({limit: 5});
      expect(o.args).toStrictEqual([o.options]);
    })

    it('Should prepare "offset" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {skip: 5});
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({offset: 5});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare "distinct" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {distinct: true});
      const o = SQBAdapter.prepare(query);
      const options = {distinct: true};
      expect(o).toStrictEqual({
        method: 'findAll',
        options,
        args: [options]
      });
    })

    it('Should prepare "total" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {count: true});
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({total: true});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "pick" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({pick: ['id', 'givenName', 'country.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "omit" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({omit: ['id', 'givenName', 'country.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "include" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toStrictEqual({include: ['id', 'givenName', 'country.name']});
      expect(o.args).toStrictEqual([o.options]);
    });

    it('Should prepare with "filter" option', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options.filter).toBeDefined();
      expect(o.args).toStrictEqual([o.options]);
    });
  });

  describe('CollectionUpdateQuery', function () {

    it('Should prepare', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getResource('Customers'), 1, values);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.keyValue).toStrictEqual(1);
      expect(o.values).toStrictEqual(values);
      expect(o.options).toBeDefined();
    });

    it('Should prepare with "pick" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getResource('Customers'), 1, values, {
        pick: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.pick).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "omit" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getResource('Customers'), 1, values, {
        omit: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.omit).toStrictEqual(['id', 'givenName', 'country.name']);
    });

    it('Should prepare with "include" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateQuery(api.getResource('Customers'), 1, values, {
        include: ['id', 'givenName', 'country.name']
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('update');
      expect(o.options).toBeDefined();
      expect(o.options.include).toStrictEqual(['id', 'givenName', 'country.name']);
    });

  });

  describe('CollectionUpdateManyQuery', function () {
    it('Should prepare', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateManyQuery(api.getResource('Customers'), values);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const values = {a: 2};
      const query = new CollectionUpdateManyQuery(api.getResource('Customers'), values, {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('updateAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });

  describe('CollectionDeleteQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionDeleteQuery(api.getResource('Customers'), 1);
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('destroy');
      expect(o.keyValue).toStrictEqual(1);
    });

  });

  describe('CollectionDeleteManyQuery', function () {
    it('Should prepare', async () => {
      const query = new CollectionDeleteManyQuery(api.getResource('Customers'));
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
    })

    it('Should prepare with "filter" option', async () => {
      const query = new CollectionDeleteManyQuery(api.getResource('Customers'), {
        filter: 'name=Demons'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('destroyAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter).toBeDefined();
    })
  });

  describe('Convert filter ast to SQB', function () {
    it('Should convert StringLiteral', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name="Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual('Demons');
    });

    it('Should convert NumberLiteral', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name=10'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual(10);
    });

    it('Should convert BooleanLiteral', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name=true'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual(true);
    });

    it('Should convert NullLiteral', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name=null'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual(null);
    });

    it('Should convert DateLiteral', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name="2020-06-11T12:30:15"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual('2020-06-11T12:30:15');
    });

    it('Should convert TimeLiteral', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name="12:30:15"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.options.filter._right).toStrictEqual('12:30:15');
    });

    it('Should convert ComparisonExpression(=)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name="Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.eq);
    });

    it('Should convert ComparisonExpression(!=)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name!="Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.ne);
    });

    it('Should convert ComparisonExpression(>)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'pages>5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gt);
    });

    it('Should convert ComparisonExpression(>=)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'pages>=5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.gte);
    });

    it('Should convert ComparisonExpression(<)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'pages<5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lt);
    });

    it('Should convert ComparisonExpression(<=)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'pages<=5'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual(5);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.lte);
    });

    it('Should convert ComparisonExpression(in)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'pages in [5,6]'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual([5, 6]);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.in);
    });

    it('Should convert ComparisonExpression(!in)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'pages !in [5,6]'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('pages');
      expect(o.options.filter._right).toStrictEqual([5, 6]);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notIn);
    });

    it('Should convert ComparisonExpression(like)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name like "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.like);
    });

    it('Should convert ComparisonExpression(ilike)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name ilike "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.iLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name !like "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notLike);
    });

    it('Should convert ComparisonExpression(!like)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'name !ilike "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
      expect(o.options.filter._left).toStrictEqual('name');
      expect(o.options.filter._right).toStrictEqual('Demons');
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.notILike);
    });

    it('Should convert LogicalExpression(or)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'page=1 or page=2'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.or);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert LogicalExpression(and)', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: 'page=1 and name = "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.and);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });

    it('Should convert ParenthesesExpression', async () => {
      const query = new CollectionSearchQuery(api.getCollectionResource('Customers'), {
        filter: '(page=1 or page=2) and name = "Demons"'
      });
      const o = SQBAdapter.prepare(query);
      expect(o.method).toStrictEqual('findAll');
      expect(o.options).toBeDefined();
      expect(o.options.filter._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._operatorType).toStrictEqual(OperatorType.and);
      expect(o.options.filter._items[0]._type).toStrictEqual(SerializationType.LOGICAL_EXPRESSION);
      expect(o.options.filter._items[0]._operatorType).toStrictEqual(OperatorType.or);
      expect(o.options.filter._items[1]._type).toStrictEqual(SerializationType.COMPARISON_EXPRESSION);
    });
  });

});

