import { apiCall } from './apiCall';
import { Types } from 'mongoose';

export const downloadDocument = async (documentId: string) => {
  const blob = await apiCall('DownloadFile', {
    pathParams: {
      fileId: new Types.ObjectId(documentId),
    },
    queryParams: {},
    requestBody: null,
    requestConfig: {
      responseType: 'blob',
    },
  });

  if (!(blob instanceof Blob)) {
    return null;
  }

  return blob;
};

export const uploadFile = async (file: File, parentId: Types.ObjectId) => {
  const formData = new FormData();

  formData.append('file', file);

  const response = await apiCall('UploadFile', {
    pathParams: {},
    queryParams: {},
    requestBody: formData,
  });

  await apiCall('UpdateFile', {
    pathParams: {
      fileId: new Types.ObjectId(response.data.id),
    },
    queryParams: {},
    requestBody: {
      parentId,
    },
  });
};
