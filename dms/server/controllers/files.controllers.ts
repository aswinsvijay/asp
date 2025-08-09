import { controllerGroup } from '.';
import { MyServerResponse } from '../objects';

controllerGroup.add('GetFiles', async () => {
  return new MyServerResponse({ data: { root: '', items: [] } });
});

controllerGroup.add('UploadFile', async (ctx) => {
  return new MyServerResponse({ data: ctx.pathParams });
});
