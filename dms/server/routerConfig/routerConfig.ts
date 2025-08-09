import { RouterConfig } from '../schemas/routerConfig/type';
import { narrowedValue } from '../../src/utils';

export default narrowedValue({
  paths: {
    '/files': {
      methods: {
        get: {
          controller: 'files.controllers',
          operationId: 'GetFiles',
          queryParams: {
            path: {
              type: 'string',
            },
          },
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
          controller: 'files.controllers',
          operationId: 'UploadFile',
          queryParams: {
            path: {
              type: 'string',
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
}) satisfies RouterConfig;
