import { Collection, InferSchemaType, Model } from 'mongoose';
import { StoredDocument } from './models';
import { UNSAFE_DOWNCAST } from '../types';

export const getCollection = <T extends Model<any>>(model: T) => {
  return UNSAFE_DOWNCAST<Collection<InferSchemaType<T['schema']>>>(model.collection);
};

export const getStoredDocumentsCollection = () => {
  return getCollection(StoredDocument);
};
