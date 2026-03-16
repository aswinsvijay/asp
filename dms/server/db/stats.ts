import { Types } from 'mongoose';
import { StoredDocument } from './models';

/**
 * Returns the count of documents in each class.
 * Documents without a class property are included under class: null.
 */
export const getDocumentCountByClass = async (args: { owner: Types.ObjectId }) => {
  const results = await StoredDocument.aggregate<{ _id: string | null; count: number }>()
    .match({ owner: args.owner })
    .group({ _id: '$class', count: { $sum: 1 } })
    .sort({ _id: 1 });

  return Object.fromEntries(results.map((r) => [(r._id ?? '') || '(no class)', r.count] as const));
};
