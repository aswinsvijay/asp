import { Types } from 'mongoose';
import { Folder, StoredDocument } from './models';

export const getStoredDocumentsRecursive = async (args: { parent: Types.ObjectId; owner: Types.ObjectId }) => {
  const foldersCollection = Folder.collection.name;

  const results = await Folder.aggregate<{ folderIds: Types.ObjectId[] }>()
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
          initialValue: [],
          in: { $concatArrays: ['$$value', '$$this'] },
        },
      },
    });

  const folderIds = results[0]?.folderIds ?? [];

  // Also include the given parent, otherwise documents that
  // are direct children are not included
  folderIds.push(args.parent);

  const documents = await StoredDocument.aggregate<StoredDocument>().match({
    $expr: {
      $and: [
        {
          $in: ['$parent', folderIds],
        },
        {
          $eq: ['$owner', args.owner],
        },
      ],
    },
  });

  return documents;
};
