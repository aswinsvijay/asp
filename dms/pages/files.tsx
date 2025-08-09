import { ItemInfo } from '@/server/routerConfig/compiledRouterTypes';
import { apiCall } from '@/src/utils/apiCall';
import React, { useEffect, useState } from 'react';

const Files: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<string>();
  const [items, setItems] = useState<ItemInfo[]>();

  useEffect(() => {
    async function fetchFiles() {
      const response = await apiCall('GetFiles', {
        queryParams: {
          ...(path ? { path: path } : {}),
        },
      });

      setPath(response.data.root);
      setItems(response.data.items);
      setLoading(false);
    }

    fetchFiles();
  }, [path]);

  if (loading) {
    return null;
  }

  if (!items) {
    return null;
  }

  return (
    <>
      {items.map((item) => {
        return item.name;
      })}
    </>
  );
};

export default Files;
