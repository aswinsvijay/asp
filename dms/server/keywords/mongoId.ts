import { FuncKeywordDefinition } from 'ajv';
import { AnySchemaObject, DataValidationCxt } from 'ajv/dist/types';
import mongoose from 'mongoose';

export const mongoId: FuncKeywordDefinition = {
  keyword: 'x-mongo-id',
  type: 'string',
  schemaType: 'boolean',
  validate: (schema: boolean, data: string, _?: AnySchemaObject, dataCxt?: DataValidationCxt) => {
    if (!schema) {
      return true;
    }

    if (!mongoose.Types.ObjectId.isValid(data)) {
      return false;
    }

    if (dataCxt) {
      dataCxt.parentData[dataCxt.parentDataProperty] = new mongoose.Types.ObjectId(data);
    }

    return true;
  },
};
