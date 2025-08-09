import axios from 'axios';
import compiledRouterConfig from '../../server/routerConfig/compiledRouterConfig';
import { CompiledOperations } from '../../server/routerConfig/compiledRouterTypes';
import { useEffect, useState } from 'react';

export async function apiCall<T extends keyof CompiledOperations>(
  operation: T,
  args: Pick<CompiledOperations[T], 'queryParams'>
) {
  const operationInfo = compiledRouterConfig[operation];
  const url = `/api${operationInfo.path}` as const;

  const response = await axios({
    url,
    method: operationInfo.method,
    params: args.queryParams,
  });

  return response.data as CompiledOperations[T]['response'];
}

export const useApiCall = <T extends keyof CompiledOperations>(
  operation: T,
  args: Pick<CompiledOperations[T], 'queryParams'>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<CompiledOperations[T]['response'] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiCall(operation, args);
        setData(response);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [operation, args]);

  return { loading, error, data };
}
