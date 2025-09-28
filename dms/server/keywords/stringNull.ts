import { FuncKeywordDefinition } from 'ajv';
import { AnySchemaObject, DataValidationCxt } from 'ajv/dist/types';

export const stringNull: FuncKeywordDefinition = {
  keyword: 'x-string-null',
  type: 'string',
  schemaType: 'boolean',
  validate: (schema: boolean, data: string, _?: AnySchemaObject, dataCxt?: DataValidationCxt) => {
    if (!schema) {
      return true;
    }

    if (data !== 'null') {
      return false;
    }

    if (dataCxt) {
      dataCxt.parentData[dataCxt.parentDataProperty] = null;
    }

    return true;
  },
};
