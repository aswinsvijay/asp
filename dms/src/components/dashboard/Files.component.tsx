import React, { useState } from 'react';
import { useApiCall } from '@/src/utils';
import { Types } from 'mongoose';

export const FilesComponent = () => {
  const [parent] = useState<Types.ObjectId | null>(null);
  const {
    loading,
    error,
    data: response,
  } = useApiCall('GetChildren', {
    pathParams: {
      parentId: parent,
    },
    queryParams: {},
  });

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <>
      {response.data.map((item) => {
        return item.name;
      })}
    </>
  );
};
