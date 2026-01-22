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
                },
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
  },
}) satisfies RouterConfig;
