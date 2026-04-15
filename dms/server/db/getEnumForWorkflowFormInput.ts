import { Types } from 'mongoose';
import { WorkflowFormInput } from '../routerConfig/compiledRouterTypes.out';
import { Folder, StoredDocument } from './models';
import { rootFolder } from '../../src/utils';

type Sources = NonNullable<WorkflowFormInput['enumFrom']>;

interface OptionResult {
  value: string;
  displayName: string;
}

const getDocuments = async (args: { owner: Types.ObjectId }): Promise<OptionResult[]> => {
  const documents = await StoredDocument.find(
    { owner: args.owner, mimetype: 'text/plain' },
    {
      _id: 1,
      name: 1,
    },
    {
      sort: { name: 1 },
    }
  ).lean();

  return documents.map(
    (doc): OptionResult => ({
      displayName: doc.name,
      value: doc._id.toString(),
    })
  );
};

const getFolders = async (args: { owner: Types.ObjectId }): Promise<OptionResult[]> => {
  const folders = await Folder.find(
    { owner: args.owner },
    {
      _id: 1,
      name: 1,
    },
    {
      sort: { name: 1 },
    }
  ).lean();

  const result: OptionResult[] = [
    {
      value: rootFolder.toString(),
      displayName: '<ROOT>',
    },
  ];

  folders.forEach((folder) => {
    result.push({
      displayName: folder.name,
      value: folder._id.toString(),
    });
  });

  return result;
};

export const getEnumForWorkflowFormInput = async (
  source: Sources,
  args: { owner: Types.ObjectId }
): Promise<OptionResult[]> => {
  switch (source) {
    case 'documents': {
      return await getDocuments(args);
    }

    case 'folders': {
      return await getFolders(args);
    }

    default: {
      source satisfies never;
    }
  }

  return [];
};
