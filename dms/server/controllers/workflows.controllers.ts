import { controllerGroup } from './controllerGroup';
import { ServerBadRequestError, ServerJSONResponse, ServerNotFoundError, ServerUnauthorizedError } from '../objects';
import { createWorkflow, getWorkflowById, getWorkflows } from '../db';
import axios from 'axios';

controllerGroup.add('CreateWorkflow', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const workflow = await createWorkflow({
    name: ctx.requestBody.name,
    owner: ctx.state.user._id,
    url: ctx.requestBody.callback_url,
    inputs: ctx.requestBody.inputs,
  });

  return new ServerJSONResponse({
    data: {
      id: workflow._id.toString(),
    },
  });
});

controllerGroup.add('GetWorkflows', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const workflows = await getWorkflows({ owner: ctx.state.user._id });

  return new ServerJSONResponse({
    data: workflows.map((workflow) => ({
      ...workflow,
      id: workflow._id.toString(),
    })),
  });
});

controllerGroup.add('RunWorkflow', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const { workflowId } = ctx.pathParams;

  if (!workflowId) {
    throw new ServerBadRequestError('workflowId is required');
  }

  const workflow = await getWorkflowById(workflowId, { owner: ctx.state.user._id });

  if (!workflow) {
    throw new ServerNotFoundError('Workflow not found');
  }

  const response = await axios({
    url: workflow.url,
    method: 'post',
    data: ctx.requestBody,
  });

  return Promise.resolve(new ServerJSONResponse({ data: (response.data as unknown) ?? {} }));
});
