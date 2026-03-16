import { controllerGroup } from './controllerGroup';
import { ServerJSONResponse } from '../objects';

controllerGroup.add('CreateWorkflow', async () => {
  return Promise.resolve(
    new ServerJSONResponse({
      data: {
        id: '',
      },
    })
  );
});

controllerGroup.add('GetWorkflows', async () => {
  return Promise.resolve(
    new ServerJSONResponse({
      data: [],
    })
  );
});

controllerGroup.add('RunWorkflow', async () => {
  return Promise.resolve(new ServerJSONResponse({}));
});
