import { Types } from 'mongoose';
import { Folder, StoredDocument } from './models';

export const getStoredDocumentsRecursive = async (args: { parent: Types.ObjectId; owner: Types.ObjectId }) => {
  const foldersCollection = Folder.collection.name;
  const documentsCollection = StoredDocument.collection.name;

  const results = await Folder.aggregate<{ documents: StoredDocument[] }>()
    .match({ _id: args.parent, owner: args.owner })
    .graphLookup({
      from: foldersCollection,
      startWith: '$_id',
      connectFromField: '_id',
      connectToField: 'parent',
      as: 'descendants',
      restrictSearchWithMatch: { owner: args.owner },
    })
    .project({
      folderIds: { $concatArrays: [['$_id'], '$descendants._id'] },
    })
    .lookup({
      from: documentsCollection,
      let: { folderIds: '$folderIds' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ['$owner', args.owner] }, { $in: ['$parent', '$$folderIds'] }],
            },
          },
        },
      ],
      as: 'documents',
    })
    .project({ _id: 0, documents: 1 });

  const documents = results[0]?.documents;

  return documents ?? [];
};
