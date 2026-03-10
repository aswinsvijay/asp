import { rootFolder } from '../../src/utils';
import { controllerGroup } from '.';
import { createFolder } from '../db';
import { MyServerJSONResponse, MyServerUnauthorizedError } from '../objects';

controllerGroup.add('CreateFolder', async (ctx) => {
  if (!ctx.state.user) {
    throw new MyServerUnauthorizedError('Un-authorized');
  }

  if (!ctx.requestBody) {
    throw new Error('Missing requestBody');
  }

  const folder = await createFolder({
    name: ctx.requestBody.name,
    owner: ctx.state.user._id,
    parent: ctx.requestBody.parentId ?? rootFolder,
  });

  return new MyServerJSONResponse({
    data: {
      id: folder._id.toString(),
    },
  });
});
