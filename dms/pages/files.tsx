import React, { useState } from 'react';
import { useApiCall } from '@/src/utils';

const Files: React.FC = () => {
  const [path] = useState('');
  const {
    loading,
    error,
    data: response,
  } = useApiCall('GetFiles', {
    queryParams: {
      ...(path ? { path: path } : {}),
    },
  });

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    response && (
      <>
        {response.data.items.map((item) => {
          return item.name;
        })}
      </>
    )
  );
};

export default Files;
