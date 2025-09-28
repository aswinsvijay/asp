import { Schema, Types } from 'mongoose';
import { controllerGroup } from '.';
import { createStoredDocument, getStoredDocuments } from '../db';
import { MyServerJSONResponse, MyServerUnauthorizedError } from '../objects';

controllerGroup.add('GetChildren', async (ctx) => {
  const documents = await getStoredDocuments(ctx.pathParams.parentId ?? null);

  const mappedDocuments = documents.map((document) => ({
    ...document,
    type: 'document' as const,
  }));

  return new MyServerJSONResponse({ data: mappedDocuments });
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

  const document = await createStoredDocument({
    name: uploadedFile.originalname,
    path: uploadedFile.path,
    mimetype: uploadedFile.mimetype,
    owner: ctx.state.user._id,
  });

  return new MyServerJSONResponse({ data: document });
});

controllerGroup.add('UpdateFile', (ctx) => {
  console.log(
    ctx.pathParams.fileId,
    ctx.pathParams.fileId instanceof Types.ObjectId,
    ctx.pathParams.fileId instanceof Schema.Types.ObjectId
  );

  return Promise.resolve(new MyServerJSONResponse({ data: {} }));
});

controllerGroup.add('DownloadFile', () => {
  return Promise.resolve(new MyServerJSONResponse({ data: {} }));
});
