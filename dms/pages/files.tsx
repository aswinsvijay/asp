import React, { useState } from 'react';
import { useApiCall } from '@/src/utils';
import { Types } from 'mongoose';

const Files: React.FC = () => {
  const [parent] = useState<Types.ObjectId | null>(null);
  const {
    loading,
    error,
    data: response,
  } = useApiCall('GetChildren', {
    queryParams: {
      ...(parent ? { parent } : {}),
    },
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

export default Files;
