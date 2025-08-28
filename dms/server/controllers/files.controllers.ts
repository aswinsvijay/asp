import { controllerGroup } from '.';
import { createStoredDocument } from '../db';
import { MyServerJSONResponse } from '../objects';

controllerGroup.add('GetFiles', async () => {
  return new MyServerJSONResponse({ data: { root: '', items: [] } });
});

controllerGroup.add('UploadFile', async (ctx) => {
  if (Array.isArray(ctx.req.files)) {
    throw new Error('Files should be object');
  }

  const uploadedFile = ctx.req.files?.['file']?.[0];

  if (!uploadedFile) {
    throw new Error('file is required');
  }

  await createStoredDocument({
    name: uploadedFile.originalname,
    path: uploadedFile.path,
    mimetype: uploadedFile.mimetype,
    owner: '',
  });

  return new MyServerJSONResponse({ data: {} });
});
