import { Types } from 'mongoose';
import { Folder, StoredDocument } from './models';

export const getStoredDocumentsRecursive = async (args: { parent: Types.ObjectId; owner: Types.ObjectId }) => {
  const foldersCollection = Folder.collection.name;
  const documentsCollection = StoredDocument.collection.name;

  const results = await Folder.aggregate<{ documents: StoredDocument[] }>()
    // Gets all child folders of given parent
    .match({
      parent: args.parent,
      owner: args.owner,
    })
    // Recursive lookup to get all subfolders
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
    // Collect folder IDs into a single record
    .group({
      _id: null,
      nestedFolderIds: { $push: '$folderIds' },
    })
    .project({
      _id: 0,
      folderIds: {
        $reduce: {
          input: '$nestedFolderIds',
          // Also include the given parent, otherwise documents that
          // are direct children are not included
          initialValue: [args.parent],
          in: { $concatArrays: ['$$value', '$$this'] },
        },
      },
    })
    // Find all documents under the given folder IDs
    .lookup({
      from: documentsCollection,
      let: { folderIds: '$folderIds' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $in: ['$parent', '$$folderIds'],
                },
                {
                  $eq: ['$owner', args.owner],
                },
              ],
            },
          },
        },
      ],
      as: 'documents',
    })
    .project({ _id: 0, documents: 1 });

  return results.flatMap((res) => res.documents);
};
