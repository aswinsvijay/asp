import { Collection, InferSchemaType, Model } from 'mongoose';
import { StoredDocument } from './models';
import { UNSAFE_DOWNCAST } from '../../src/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCollection = <T extends Model<any>>(model: T) => {
  return UNSAFE_DOWNCAST<Collection<InferSchemaType<T['schema']>>>(model.collection);
};

export const getStoredDocumentsCollection = () => {
  return getCollection(StoredDocument);
};
