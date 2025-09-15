import axios from 'axios';
import compiledRouterConfig from '../../server/routerConfig/compiledRouterConfig.out';
import { CompiledOperations } from '../../server/routerConfig/compiledRouterTypes.out';
import { useEffect, useState } from 'react';
import { UNSAFE_DOWNCAST } from './typeUtils';

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

export async function tryApiCall<T extends keyof CompiledOperations>(
  operation: T,
  args: Pick<CompiledOperations[T], 'queryParams'>
) {
  try {
    const response = await apiCall(operation, args);

    return [response, null] as const;
  } catch (error) {
    return [null, UNSAFE_DOWNCAST<Error>(error)] as const;
  }
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
        // TODO: ESLint rule for variable shadowing
        const [apiResponse, apiError] = await tryApiCall(operation, args);
        setData(apiResponse);
        setError(apiError);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [operation, JSON.stringify(args)]);

  return { loading, error, data };
};
