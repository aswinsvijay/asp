import { controllerGroup } from '.';
import { MyServerResponse } from '../objects';

controllerGroup.add('GetFiles', async () => {
  return new MyServerResponse({ data: { root: '', items: [] } });
});

controllerGroup.add('UploadFile', async (ctx) => {
  console.log(ctx.req.body);
  console.log(ctx.req.files);

  if (Array.isArray(ctx.req.files)) {
    throw new Error('Files should be object');
  }

  const uploadedFile = ctx.req.files?.['file'];

  if (!uploadedFile?.[0]) {
    throw new Error('file is required');
  }

  return new MyServerResponse({ data: {} });
});
