import { controllerGroup } from './controllerGroup';
import { ServerBadRequestError, ServerJSONResponse, ServerNotFoundError, ServerUnauthorizedError } from '../objects';
import {
  createWorkflow,
  getEnumForWorkflowFormInput,
  getWorkflowById,
  getWorkflowLastRun,
  getWorkflows,
  setWorkflowLastRun,
} from '../db';
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

controllerGroup.add('GetN8NWorkflowLastRun', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  if (!ctx.pathParams.n8nWfId) {
    throw new ServerBadRequestError('n8nWfId is required');
  }

  let result: Date | null = await getWorkflowLastRun(ctx.pathParams.n8nWfId, { owner: ctx.state.user._id });

  if (!result) {
    const now = new Date();

    now.setHours(now.getHours() - 1);

    result = now;
  }

  return new ServerJSONResponse({
    data: result.toISOString(),
  });
});

controllerGroup.add('SetN8NWorkflowLastRun', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  if (!ctx.pathParams.n8nWfId) {
    throw new ServerBadRequestError('n8nWfId is required');
  }

  await setWorkflowLastRun(ctx.pathParams.n8nWfId, new Date(), { owner: ctx.state.user._id });

  return new ServerJSONResponse({
    data: ctx.pathParams.n8nWfId,
  });
});

controllerGroup.add('GetWorkflowInputOptions', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const inputType = ctx.pathParams.type;

  if (!inputType) {
    throw new ServerBadRequestError('inputType is required');
  }

  const result = await getEnumForWorkflowFormInput(inputType, { owner: ctx.state.user._id });

  return new ServerJSONResponse({
    data: result,
  });
});
