import { RouterConfig } from '../schemas/routerConfig/type';
import { narrowedValue } from '../../src/utils/typeUtils';

const filesControllers = 'files.controllers';

export default narrowedValue({
  paths: {
    '/files': {
      methods: {
        get: {
          controller: filesControllers,
          operationId: 'GetFiles',
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
                type: 'object',
                properties: {
                  root: {
                    type: 'string',
                  },
                  items: {
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
                          enum: ['file', 'folder'],
                        },
                      },
                      required: ['name', 'path', 'type'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['root', 'items'],
                additionalProperties: false,
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
                fileId: {
                  allOf: [
                    {
                      type: 'string',
                      'x-mongo-id': true,
                    },
                  ],
                  tsType: 'import("mongoose").Types.ObjectId',
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
      },
    },
  },
}) satisfies RouterConfig;
