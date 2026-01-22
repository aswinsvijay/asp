import { Schema, Types } from 'mongoose';
import { controllerGroup } from '.';
import { createStoredDocument, getStoredDocumentById, getStoredDocuments } from '../db';
import {
  MyServerBadRequestError,
  MyServerJSONResponse,
  MyServerNotFoundError,
  MyServerUnauthorizedError,
  MyServerInternalError,
  MyServerStreamResponse,
} from '../objects';
import { UNSAFE_CAST } from '../../src/utils';
import { createReadStream, existsSync } from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { environment } from '../environment';
import { EntitySpan } from '../routerConfig/compiledRouterTypes.out';

const rootFolder = new Types.ObjectId('0'.repeat(24));
const redactionAxiosInstance = axios.create({
  baseURL: environment.REDACT_SERVER_URL,
});

controllerGroup.add('GetChildren', async (ctx) => {
  const documents = await getStoredDocuments(ctx.pathParams.parentId ?? rootFolder);

  const mappedDocuments = documents.map((document) => ({
    ...document,
    id: document._id.toString(),
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
    parent: rootFolder,
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

controllerGroup.add('DownloadFile', async (ctx) => {
  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new MyServerBadRequestError('fileId is required');
  }

  const document = await getStoredDocumentById(documentId);

  if (!document) {
    throw new MyServerNotFoundError('Document not found');
  }

  if (!existsSync(document.path)) {
    throw new MyServerInternalError('Document does not exist on the specified path', { data: {} });
  }

  const stream = createReadStream(document.path);

  return new MyServerStreamResponse(stream);
});

controllerGroup.add('GetRedactionEntities', async (ctx) => {
  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new MyServerBadRequestError('fileId is required');
  }

  const document = await getStoredDocumentById(documentId);

  if (!document) {
    throw new MyServerNotFoundError('Document not found');
  }

  if (!existsSync(document.path)) {
    throw new MyServerInternalError('Document does not exist on the specified path', { data: {} });
  }

  const stream = createReadStream(document.path);

  try {
    const formData = new FormData();
    formData.append('file', stream, document.name);

    const response = await redactionAxiosInstance.post('/redaction-entities', formData, {
      headers: formData.getHeaders(),
    });

    return new MyServerJSONResponse(UNSAFE_CAST<{ data: EntitySpan[] }>(response.data));
  } catch {
    throw new Error('Upstream server error');
  }
});
