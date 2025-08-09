import { narrowedValue } from '../../src/utils';

export default narrowedValue({
  GetFiles: {
    path: '/files',
    method: 'get',
    controller: 'files.controllers',
    pathParams: {},
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
  UploadFile: {
    path: '/files',
    method: 'post',
    controller: 'files.controllers',
    pathParams: {},
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
});
