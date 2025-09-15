import { Collection, InferSchemaType, Model } from 'mongoose';
import { StoredDocument } from './models';
import { UNSAFE_CAST } from '../../src/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCollection = <T extends Model<any>>(model: T) => {
  return UNSAFE_CAST<Collection<InferSchemaType<T['schema']>>>(model.collection);
};

export const getStoredDocumentsCollection = () => {
  return getCollection(StoredDocument);
};
