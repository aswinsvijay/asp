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

export const getDocumentCountBySize = async (args: { owner: Types.ObjectId }) => {
  const ONE_KB = 1024;
  const ONE_MB = ONE_KB * 1024;
  const sizeRangesInBytes = [
    { min: 0, max: 1 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 3, max: 4 },
    { min: 4, max: 5 },
  ];

  const results = await StoredDocument.aggregate<{ _id: { min: number; max: number; label: string }; count: number }>()
    .match({ owner: args.owner })
    .group({
      _id: {
        $switch: {
          branches: sizeRangesInBytes.map((range) => ({
            case: { $lte: ['$size', range.max * ONE_MB] },
            then: { min: range.min, max: range.max, label: `${String(range.min)}-${String(range.max)} MB` },
          })),
          default: { min: 5, max: 1_000_000, label: '> 5 MB' },
        },
      },
      count: { $sum: 1 },
    });

  return results.map((r) => ({ groupDetails: r._id, count: r.count }));
};
