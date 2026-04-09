import { controllerGroup } from './controllerGroup';
import { ServerJSONResponse, ServerUnauthorizedError } from '../objects';
import { jobs } from '../jobs';

controllerGroup.add('ForceRunAllJobs', (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  jobs.forEach((job) => void job());

  return Promise.resolve(
    new ServerJSONResponse({
      data: {},
    })
  );
});
