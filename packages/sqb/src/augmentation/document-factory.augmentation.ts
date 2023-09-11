import { Type } from 'ts-gems';
import { ApiDocumentFactory, ApiField, Collection, DATATYPE_METADATA, OpraSchema } from "@opra/common";
import { DataType as SqbDataType, EntityMetadata, isAssociationField } from '@sqb/connect';

// @ts-ignore
const _extractFieldSchema = ApiDocumentFactory.prototype.extractFieldSchema;
// @ts-ignore
ApiDocumentFactory.prototype.extractFieldSchema = async function (
    this: ApiDocumentFactory,
    target: OpraSchema.Field,
    ctor: Type,
    metadata: ApiField.Metadata,
    name: string
) {
  await _extractFieldSchema.call(this, target, ctor, metadata, name);
  const sqbMeta = EntityMetadata.get(ctor);
  const sqbField = sqbMeta && EntityMetadata.getField(sqbMeta, name);
  if (!sqbField)
    return;
  const detectType = !metadata.type;
  if (isAssociationField(sqbField)) {
    if (!sqbField.association.returnsMany())
      delete target.isArray;
    if (!target.type) {
      const trg = await sqbField.association.resolveTarget();
      if (trg) {
        // @ts-ignore
        target.type = await this.importTypeClass(trg.ctor);
      }
    }
  } else if (sqbField.kind === 'column') {
    if (typeof sqbField.enum === 'object')
      metadata.enum = sqbField.enum as any;
    if (target.required == null && sqbField.notNull)
      target.required = true;

    if (sqbField.type && Reflect.hasMetadata(DATATYPE_METADATA, sqbField.type)) {
      target.type = sqbField.type as any;
    }
    switch (sqbField.dataType) {
      case SqbDataType.GUID:
        if (!target.type || (detectType && target.type === 'string'))
          target.type = 'uuid';
        break;
      case SqbDataType.JSON:
        if (!target.type || (detectType && target.type === 'any'))
          target.type = 'object';
        break;
      case SqbDataType.INTEGER:
      case SqbDataType.SMALLINT:
        if (!target.type || (detectType && target.type === 'number'))
          target.type = 'integer';
        break;
      case SqbDataType.BIGINT:
        if (!target.type || (detectType && target.type === 'number'))
          target.type = 'bigint';
        break;
      case SqbDataType.DATE:
        if (!target.type || (detectType && (target.type === 'timestamp' || target.type === 'string')))
          target.type = 'date';
        break;
      case SqbDataType.TIMESTAMPTZ:
        if (!target.type || (detectType && (target.type === 'timestamp' || target.type === 'string')))
          target.type = 'timestamptz';
        break;
      case SqbDataType.TIME:
        if (!target.type || (detectType && (target.type === 'timestamp' || target.type === 'string')))
          target.type = 'time';
        break;
      case SqbDataType.BINARY:
        if (!target.type || (detectType && target.type === 'string'))
          target.type = 'base64';
        break;
    }

    if (!target.type) {
      switch (sqbField.dataType) {
        case SqbDataType.BOOL:
          target.type = 'boolean';
          break;
        case SqbDataType.CHAR:
        case SqbDataType.VARCHAR:
        case SqbDataType.TEXT:
          target.type = 'string';
          break;
        case SqbDataType.FLOAT:
        case SqbDataType.DOUBLE:
        case SqbDataType.NUMBER:
          target.type = 'number';
          break;
        case SqbDataType.TIMESTAMP:
          target.type = 'timestamp';
          break;
      }
    }
    if (sqbField.notNull && target.required === undefined)
      target.required = sqbField.notNull;
    if (sqbField.exclusive && target.exclusive === undefined)
      target.exclusive = sqbField.exclusive;
    if (sqbField.default !== undefined && target.default === undefined)
      target.default = sqbField.default;
  }
  if (sqbField.exclusive && target.exclusive === undefined)
    target.exclusive = sqbField.exclusive;
}

// @ts-ignore
const _extractCollectionSchema = ApiDocumentFactory.prototype.extractCollectionSchema;
// @ts-ignore
ApiDocumentFactory.prototype.extractCollectionSchema = async function (
    this: ApiDocumentFactory,
    schema: OpraSchema.Collection,
    ctor: Type,
    metadata: Collection.Metadata,
    controller: object | Type
) {
  const {document} = this;
  const dataType = document.getComplexType(schema.type);
  // Determine primaryKey if not defined
  if (!schema.primaryKey && dataType.ctor) {
    const entityMetadata = EntityMetadata.get(dataType.ctor);
    if (entityMetadata?.indexes) {
      const primaryIndex = entityMetadata.indexes.find(x => x.primary);
      if (primaryIndex) {
        schema.primaryKey = primaryIndex.columns;
      }
    }
  }
  return await _extractCollectionSchema.call(this, schema, ctor, metadata, controller);
}
