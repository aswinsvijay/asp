import axios from 'axios';
import compiledRouterConfig from '../../server/routerConfig/compiledRouterConfig';
import { CompiledOperations } from '../../server/routerConfig/compiledRouterTypes';

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
