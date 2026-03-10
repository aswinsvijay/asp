import { apiCall } from './apiCall';
import { Types } from 'mongoose';

export const getDocumentBlob = async (documentId: string) => {
  const blob = await apiCall('DownloadFile', {
    pathParams: {
      fileId: new Types.ObjectId(documentId),
    },
    queryParams: {},
    requestConfig: {
      responseType: 'blob',
    },
  });

  if (!(blob instanceof Blob)) {
    return null;
  }

  return blob;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();

  formData.append('file', file);

  await apiCall('UploadFile', {
    pathParams: {},
    queryParams: {},
    requestBody: formData,
  });
};
