import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { controllerGroup } from '.';
import { MyServerResponse } from '../objects';
import { ItemInfo } from '../routerConfig/compiledRouterTypes';

controllerGroup.add('GetFiles', async (ctx) => {
  const defaultPath = '/Users/aswinvijay';
  const requestPath = ctx.queryParams.path ?? defaultPath;

  if (!fsSync.existsSync(requestPath)) {
    throw new Error('Not found');
  }

  const contents = await fs.readdir(requestPath);

  const contentsInfo = await Promise.all(
    contents.map(async (item): Promise<ItemInfo> => {
      const fullName = path.join(requestPath, item);

      const itemStat = await fs.stat(fullName);

      return {
        name: item,
        path: fullName,
        type: itemStat.isFile() ? 'file' : 'folder',
      };
    })
  );

  return new MyServerResponse({ data: { root: requestPath, items: contentsInfo } });
});

controllerGroup.add('UploadFile', async (ctx) => {
  return new MyServerResponse({ data: ctx.pathParams });
});
