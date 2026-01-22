import { controllerGroup } from '.';
import { MyServerJSONResponse } from '../objects';

controllerGroup.add('CreateWorkflow', async () => {
  return Promise.resolve(
    new MyServerJSONResponse({
      data: {
        id: '',
      },
    })
  );
});

controllerGroup.add('GetWorkflows', async () => {
  return Promise.resolve(
    new MyServerJSONResponse({
      data: [],
    })
  );
});

controllerGroup.add('RunWorkflow', async () => {
  return Promise.resolve(new MyServerJSONResponse({}));
});
