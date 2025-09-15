import React, { useState } from 'react';
import { useApiCall } from '@/src/utils';

const Files: React.FC = () => {
  const [path] = useState<string | null>(null);
  const {
    loading,
    error,
    data: response,
  } = useApiCall('GetChildren', {
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
    <>
      {response.data.map((item) => {
        return item.name;
      })}
    </>
  );
};

export default Files;
