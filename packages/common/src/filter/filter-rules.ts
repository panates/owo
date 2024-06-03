import { StrictOmit } from 'ts-gems';
import type { ComplexType } from '../document/index.js';
import { OpraException } from '../exception/index.js';
import { OpraFilter } from '../filter/index.js';
import { omitUndefined, ResponsiveMap } from '../helpers/index.js';
import { translate } from '../i18n/index.js';
import { OpraSchema } from '../schema/index.js';

export namespace FilterRules {
  export interface Options {
    caseSensitive?: boolean;
  }

  export interface Rule {
    operators?: OpraFilter.ComparisonOperator[];
    description?: string;
  }
}

export class FilterRules {
  protected _rules = new ResponsiveMap<FilterRules.Rule>();

  constructor(rules?: Record<string, FilterRules.Rule>, options?: FilterRules.Options) {
    Object.defineProperty(this, '_rules', {
      value: new ResponsiveMap(null, { caseSensitive: options?.caseSensitive }),
      enumerable: false,
    });
    if (rules) {
      for (const [k, v] of Object.entries(rules)) {
        this.set(k, v);
      }
    }
  }

  set(
    fieldName: string,
    options?: Partial<StrictOmit<FilterRules.Rule, 'operators'>> & {
      operators?: OpraFilter.ComparisonOperator[] | string;
    },
  ) {
    const operators =
      typeof options?.operators === 'string'
        ? (options.operators.split(/\s*[,| ]\s*/) as OpraFilter.ComparisonOperator[])
        : options?.operators;
    this._rules.set(
      fieldName,
      omitUndefined<FilterRules.Rule>({
        ...options,
        operators,
      }),
    );
  }

  normalizeFilter(
    filter: OpraSchema.Field.QualifiedName | OpraFilter.Expression,
    dataType?: ComplexType,
  ): OpraFilter.Expression | undefined {
    if (!filter) return;
    const ast = typeof filter === 'string' ? OpraFilter.parse(filter) : filter;
    if (ast instanceof OpraFilter.ComparisonExpression) {
      this.normalizeFilter(ast.left, dataType);
      if (!(ast.left instanceof OpraFilter.QualifiedIdentifier && ast.left.field))
        throw new TypeError(`Invalid filter query. Left side should be a data field.`);
      // Check if filtering accepted for given field
      // const findManyOp = this.getOperation('findMany');
      const rule = this._rules.get(ast.left.value);
      if (!rule) {
        throw new OpraException({
          message: translate('error:UNACCEPTED_FILTER_FIELD', { field: ast.left.value }),
          code: 'UNACCEPTED_FILTER_FIELD',
          details: {
            field: ast.left.value,
          },
        });
      }
      // Check if filtering endpoint accepted for given field
      if (rule.operators && !rule.operators.includes(ast.op))
        throw new OpraException({
          message: translate('error:UNACCEPTED_FILTER_OPERATION', { field: ast.left.value }),
          code: 'UNACCEPTED_FILTER_OPERATION',
          details: {
            field: ast.left.value,
            operator: ast.op,
          },
        });
      this.normalizeFilter(ast.right, dataType);
      return ast;
    }
    if (ast instanceof OpraFilter.LogicalExpression) {
      ast.items.forEach(item => this.normalizeFilter(item, dataType));
      return ast;
    }
    if (ast instanceof OpraFilter.ArithmeticExpression) {
      ast.items.forEach(item => this.normalizeFilter(item.expression, dataType));
      return ast;
    }
    if (ast instanceof OpraFilter.ArrayExpression) {
      ast.items.forEach(item => this.normalizeFilter(item, dataType));
      return ast;
    }
    if (ast instanceof OpraFilter.ParenthesizedExpression) {
      this.normalizeFilter(ast.expression, dataType);
      return ast;
    }
    if (ast instanceof OpraFilter.QualifiedIdentifier && dataType) {
      ast.value = dataType.normalizeFieldPath(ast.value);
      ast.field = dataType.getField(ast.value);
      ast.dataType = ast.field.type;
    }
    return ast;
  }

  toJSON(): Record<string, FilterRules.Rule> {
    return this._rules.toObject();
  }

  [Symbol.iterator](): IterableIterator<[string, FilterRules.Rule]> {
    return this._rules.entries();
  }
}