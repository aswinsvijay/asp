import axios from 'axios';
import compiledRouterConfig from '../../server/routerConfig/compiledRouterConfig.out';
import { CompiledOperations } from '../../server/routerConfig/compiledRouterTypes.out';
import { useEffect, useState } from 'react';
import { assertUnreachable, UNSAFE_CAST } from './typeUtils';
import { getToken } from './auth';
import { Types } from 'mongoose';

type Args<T extends keyof CompiledOperations> = Pick<CompiledOperations[T], 'pathParams' | 'queryParams'>;

function convertPathParams(pathParams: Record<string, Types.ObjectId | null>) {
  const convertedPathParams = Object.fromEntries(
    Object.entries(pathParams).map(([key, value]) => {
      let convertedValue;

      // TODO: ESLint to enforce braces
      switch (true) {
        case value === null:
          convertedValue = 'null';
          break;
        // TODO: ESLint to enforce spaces
        case value instanceof Types.ObjectId:
          convertedValue = value.toString();
          break;

        default:
          convertedValue = '';
          assertUnreachable(value, 'Unhandled value type');
      }

      return [key, convertedValue];
    })
  );

  return convertedPathParams;
}

export async function apiCall<T extends keyof CompiledOperations>(operation: T, args: Args<T>) {
  const operationInfo = compiledRouterConfig[operation];
  let url = `/api${operationInfo.path}`;

  const convertedPathParams = convertPathParams(args.pathParams);

  Object.entries(convertedPathParams).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });

  const response = await axios({
    url,
    method: operationInfo.method,
    params: args.queryParams,
    headers: {
      'x-auth-token': await getToken(),
    },
  });

  return response.data as CompiledOperations[T]['response'];
}

export async function tryApiCall<T extends keyof CompiledOperations>(operation: T, args: Args<T>) {
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
  args: Args<T>
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
