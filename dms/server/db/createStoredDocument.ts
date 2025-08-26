import { StoredDocument } from './models';

export const createStoredDocument = async (args: { name: string; path: string; mimetype: string; owner: string }) => {
  const insertData: StoredDocument = {
    name: args.name,
    path: args.path,
    mimetype: args.mimetype,
    owner: args.owner,
  };

  const dataObject = new StoredDocument(insertData);

  await dataObject.save();
};
