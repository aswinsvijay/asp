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
