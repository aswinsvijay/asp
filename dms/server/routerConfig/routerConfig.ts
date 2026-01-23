import { RouterConfig } from '../schemas/routerConfig/type';
import { narrowedValue } from '../../src/utils/typeUtils';

export const mongoId = {
  type: 'string',
  'x-mongo-id': true,
  tsType: 'import("mongoose").Types.ObjectId',
} as const;

export const stringNull = {
  type: 'string',
  enum: ['null'],
  'x-string-null': true,
  tsType: 'null',
} as const;

export default narrowedValue({
  paths: {
    '/:parentId/children': {
      methods: {
        get: {
          controller: 'files.controllers',
          operationId: 'GetChildren',
          pathParams: {
            properties: {
              parentId: mongoId,
            },
          },
          requestBody: null,
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  title: 'ItemInfo',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    name: {
                      type: 'string',
                    },
                    path: {
                      type: 'string',
                    },
                    type: {
                      type: 'string',
                      enum: ['document', 'folder'],
                    },
                  },
                  required: ['id', 'name', 'path', 'type'],
                  additionalProperties: false,
                },
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
    '/files': {
      methods: {
        post: {
          controller: 'files.controllers',
          operationId: 'UploadFile',
          queryParams: {},
          requestBody: {
            contentType: 'multipart/form-data',
            schema: {},
          },
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {},
                additionalProperties: false,
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
    '/files/:fileId': {
      methods: {
        patch: {
          controller: 'files.controllers',
          operationId: 'UpdateFile',
          pathParams: {
            properties: {
              fileId: mongoId,
            },
          },
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {},
                additionalProperties: false,
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
    '/files/:fileId/download': {
      methods: {
        get: {
          controller: 'files.controllers',
          operationId: 'DownloadFile',
          pathParams: {
            properties: {
              fileId: mongoId,
            },
          },
          response: {},
        },
      },
    },
    '/files/:fileId/redaction-entities': {
      methods: {
        get: {
          controller: 'files.controllers',
          operationId: 'GetRedactionEntities',
          pathParams: {
            properties: {
              fileId: mongoId,
            },
          },
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  title: 'EntitySpan',
                  properties: {
                    entity_group: {
                      type: 'string',
                    },
                    start: {
                      type: 'integer',
                    },
                    end: {
                      type: 'integer',
                    },
                  },
                  required: ['entity_group', 'start', 'end'],
                  additionalProperties: false,
                },
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
    '/files/:fileId/classify': {
      methods: {
        post: {
          controller: 'files.controllers',
          operationId: 'ClassifyFile',
          pathParams: {
            properties: {
              fileId: mongoId,
            },
          },
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'string',
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
    '/workflows': {
      methods: {
        post: {
          controller: 'workflows.controllers',
          operationId: 'CreateWorkflow',
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                callback_url: {
                  type: 'string',
                },
                parameters: {},
              },
              required: ['name', 'callback_url'],
              additionalProperties: false,
            },
          },
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                },
                required: ['id'],
                additionalProperties: false,
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
        get: {
          controller: 'workflows.controllers',
          operationId: 'GetWorkflows',
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    name: {
                      type: 'string',
                    },
                  },
                  required: ['id', 'name'],
                  additionalProperties: false,
                },
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
    '/workflows/:workflowId': {
      methods: {
        post: {
          controller: 'workflows.controllers',
          operationId: 'RunWorkflow',
          pathParams: {
            properties: {
              workflowId: mongoId,
            },
          },
          response: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
        },
      },
    },
  },
}) satisfies RouterConfig;
