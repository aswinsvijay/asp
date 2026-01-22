import { apiCall } from './apiCall';
import { Types } from 'mongoose';
import { ItemInfo } from '../../server/routerConfig/compiledRouterTypes.out';

export const getDocumentBlob = async (item: ItemInfo) => {
  const blob = await apiCall('DownloadFile', {
    pathParams: {
      fileId: new Types.ObjectId(item.id),
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
