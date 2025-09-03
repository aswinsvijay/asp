import { controllerGroup } from '.';
import { createStoredDocument } from '../db';
import { MyServerJSONResponse, MyServerUnauthorizedError } from '../objects';

controllerGroup.add('GetFiles', () => {
  return Promise.resolve(new MyServerJSONResponse({ data: { root: '', items: [] } }));
});

controllerGroup.add('UploadFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new MyServerUnauthorizedError('Un-authorized');
  }

  if (Array.isArray(ctx.request.files)) {
    throw new Error('Files should be object');
  }

  const uploadedFile = ctx.request.files?.['file']?.[0];

  if (!uploadedFile) {
    throw new Error('file is required');
  }

  await createStoredDocument({
    name: uploadedFile.originalname,
    path: uploadedFile.path,
    mimetype: uploadedFile.mimetype,
    owner: ctx.state.user.userId,
  });

  return new MyServerJSONResponse({ data: {} });
});

controllerGroup.add('UpdateFile', (ctx) => {
  console.log(ctx.pathParams.fileId);

  return Promise.resolve(new MyServerJSONResponse({ data: {} }));
});
