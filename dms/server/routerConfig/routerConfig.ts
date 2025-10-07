import { RouterConfig } from '../schemas/routerConfig/type';
import { narrowedValue } from '../../src/utils/typeUtils';

const filesControllers = 'files.controllers';

const mongoId = {
  allOf: [
    {
      type: 'string',
      'x-mongo-id': true,
    },
  ],
  tsType: 'import("mongoose").Types.ObjectId',
} as const;

const stringNull = {
  allOf: [
    {
      type: 'string',
      enum: ['null'],
      'x-string-null': true,
    },
  ],
  tsType: 'null',
} as const;

export default narrowedValue({
  paths: {
    '/:parentId/children': {
      methods: {
        get: {
          actionType: 'searches',
          controller: filesControllers,
          operationId: 'GetChildren',
          pathParams: {
            properties: {
              parentId: {
                oneOf: [mongoId, stringNull],
              },
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
                  required: ['name', 'path', 'type'],
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
          actionType: 'creates',
          controller: filesControllers,
          operationId: 'UploadFile',
          queryParams: {},
          requestBody: {},
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
      paths: {
        '/:fileId': {
          methods: {
            patch: {
              actionType: 'creates',
              controller: filesControllers,
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
          paths: {
            '/download': {
              methods: {
                get: {
                  actionType: 'creates',
                  controller: filesControllers,
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
          },
        },
      },
    },
  },
}) satisfies RouterConfig;
