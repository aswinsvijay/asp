import { HttpJsonSchemaOrgDraft04Schema, RouterConfig } from '../schemas/routerConfig/type';
import { narrowedValue } from '../../src/utils/typeUtils';

export const mongoId = {
  type: 'string',
  'x-mongo-id': true,
  tsType: 'import("mongoose").Types.ObjectId',
} as const satisfies HttpJsonSchemaOrgDraft04Schema;

export const stringNull = {
  type: 'string',
  enum: ['null'],
  'x-string-null': true,
  tsType: 'null',
} as const satisfies HttpJsonSchemaOrgDraft04Schema;

const itemInfo = {
  title: 'ItemInfo',
  oneOf: [
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['document'],
        },
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        path: {
          type: 'string',
        },
      },
      required: ['id', 'name', 'path', 'type'],
      additionalProperties: false,
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['folder'],
        },
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
      required: ['id', 'name', 'type'],
      additionalProperties: false,
    },
  ],
} as const satisfies HttpJsonSchemaOrgDraft04Schema;

export default narrowedValue({
  paths: {
    '/:parentId/children': {
      methods: {
        get: {
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
                items: itemInfo,
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
      },
    },
    '/files/stats': {
      methods: {
        get: {
          operationId: 'GetFileStats',
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  documentClasses: {
                    type: 'object',
                    patternProperties: {
                      '.*': {
                        type: 'integer',
                        minimum: 0,
                      },
                    },
                  },
                  documentSizes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        groupDetails: {
                          type: 'object',
                          properties: {
                            min: {
                              type: 'integer',
                            },
                            max: {
                              type: 'integer',
                            },
                            label: {
                              type: 'string',
                            },
                          },
                          required: ['min', 'max', 'label'],
                          additionalProperties: false,
                        },
                        count: {
                          type: 'integer',
                          minimum: 0,
                        },
                      },
                      required: ['groupDetails', 'count'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['documentClasses', 'documentSizes'],
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
          operationId: 'UpdateFile',
          pathParams: {
            properties: {
              fileId: mongoId,
            },
          },
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                parentId: mongoId,
              },
              additionalProperties: false,
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
    '/files/:fileId/summarize': {
      methods: {
        post: {
          operationId: 'SummarizeFile',
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
    '/files/:fileId/redaction-entities': {
      methods: {
        get: {
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
    '/folders': {
      methods: {
        post: {
          operationId: 'CreateFolder',
          requestBody: {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                parentId: mongoId,
              },
              required: ['name'],
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
      },
    },
    '/folders/:folderId/summarize': {
      methods: {
        post: {
          operationId: 'SummarizeFolder',
          pathParams: {
            properties: {
              folderId: mongoId,
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
} satisfies RouterConfig);
