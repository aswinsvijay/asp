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
          zapierConfig: { actionType: 'creates' },
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
          zapierConfig: { actionType: 'creates' },
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
      paths: {
        '/:fileId': {
          methods: {
            patch: {
              zapierConfig: { actionType: 'creates' },
              controller: 'files.controllers',
              operationId: 'UpdateFile',
              pathParams: {
                properties: {
                  fileId: mongoId,
                },
              },
              requestBody: {
                contentType: 'application/json',
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
          paths: {
            '/download': {
              methods: {
                get: {
                  zapierConfig: { actionType: 'creates' },
                  controller: 'files.controllers',
                  operationId: 'DownloadFile',
                  pathParams: {
                    properties: {
                      fileId: mongoId,
                    },
                  },
                  requestBody: null,
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
