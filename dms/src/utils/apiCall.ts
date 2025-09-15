import axios from 'axios';
import compiledRouterConfig from '../../server/routerConfig/compiledRouterConfig.out';
import { CompiledOperations } from '../../server/routerConfig/compiledRouterTypes.out';
import { useEffect, useState } from 'react';
import { UNSAFE_CAST } from './typeUtils';

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
    return [null, UNSAFE_CAST<Error>(error)] as const;
  }
}

type UseApiCallResult<T> =
  | {
      loading: true;
      data: null;
      error: null;
    }
  | {
      loading: false;
      data: T;
      error: null;
    }
  | {
      loading: false;
      data: null;
      error: Error;
    };

export const useApiCall = <T extends keyof CompiledOperations>(
  operation: T,
  args: Pick<CompiledOperations[T], 'queryParams'>
): UseApiCallResult<CompiledOperations[T]['response']> => {
  const [result, setResult] = useState<UseApiCallResult<CompiledOperations[T]['response']>>({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setResult({
        loading: true,
        data: null,
        error: null,
      });

      // TODO: ESLint rule for variable shadowing
      const [apiResponse, apiError] = await tryApiCall(operation, args);

      if (apiResponse) {
        setResult({
          loading: false,
          data: apiResponse,
          error: null,
        });
      } else {
        setResult({
          loading: false,
          data: null,
          error: apiError,
        });
      }
    };

    void fetchData();
  }, [operation, JSON.stringify(args)]);

  return result;
};
