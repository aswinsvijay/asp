import { rootFolder } from '../../src/utils';
import { controllerGroup } from '.';
import { createFolder } from '../db';
import { MyServerJSONResponse } from '../objects';

controllerGroup.add('CreateFolder', async (ctx) => {
  if (!ctx.requestBody) {
    throw new Error('Missing requestBody');
  }

  const folder = await createFolder({
    name: ctx.requestBody.name,
    parent: ctx.requestBody.parentId ?? rootFolder,
  });

  return new MyServerJSONResponse({
    data: {
      id: folder._id.toString(),
    },
  });
});
