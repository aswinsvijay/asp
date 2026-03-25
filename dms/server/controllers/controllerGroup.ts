import { RemoveIndexSignature } from '@/src/utils';
import { ControllerGroup } from '../objects';
import compiledRouterConfig from '../routerConfig/compiledRouterConfig.out';
import { CompiledOperations } from '../routerConfig/compiledRouterTypes.out';

export const controllerGroup = new ControllerGroup<RemoveIndexSignature<CompiledOperations>>(compiledRouterConfig);
