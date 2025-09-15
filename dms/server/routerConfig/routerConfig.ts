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

export default narrowedValue({
  paths: {
    '/files': {
      methods: {
        get: {
          controller: filesControllers,
          operationId: 'GetChildren',
          queryParams: {
            path: {
              type: 'string',
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
        post: {
          controller: filesControllers,
          operationId: 'UploadFile',
          queryParams: {
            path: {
              type: 'string',
            },
          },
          requestBody: {
            type: 'object',
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
        '/{fileId}': {
          methods: {
            patch: {
              controller: filesControllers,
              operationId: 'UpdateFile',
              pathParams: {
                fileId: mongoId,
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
                  controller: filesControllers,
                  operationId: 'DownloadFile',
                  pathParams: {
                    fileId: mongoId,
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
