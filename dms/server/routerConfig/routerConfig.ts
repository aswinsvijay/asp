import { HttpJsonSchemaOrgDraft04Schema, RouterConfig } from '../schemas/routerConfig/type';
import { narrowedValue } from '../../src/utils/typeUtils';

const tsNonNullable = { tsType: 'NonNullable<unknown>' } satisfies HttpJsonSchemaOrgDraft04Schema;

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
  type: 'object',
  discriminator: { propertyName: 'type' },
  oneOf: [
    {
      properties: {
        type: {
          const: 'document',
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
        mimetype: {
          type: 'string',
        },
        class: {
          type: 'string',
        },
        extractFile: {
          type: 'object',
          properties: {
            class: {
              type: 'string',
            },
          },
          required: ['class'],
          additionalProperties: false,
        },
      },
      required: ['type', 'id', 'name', 'path', 'mimetype', 'class'],
      additionalProperties: false,
    },
    {
      properties: {
        type: {
          const: 'folder',
        },
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
      required: ['type', 'id', 'name'],
      additionalProperties: false,
    },
  ],
} as const satisfies HttpJsonSchemaOrgDraft04Schema;

const EntitySpan = {
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
} as const satisfies HttpJsonSchemaOrgDraft04Schema;

const WorkflowFormInput = {
  title: 'WorkflowFormInput',
  type: 'object',
  properties: {
    name: { type: 'string' },
    type: { type: 'string', enum: ['string', 'number', 'date', 'boolean'] },
    enumFrom: {
      type: 'string',
      enum: ['documents', 'folders'],
    },
  },
  required: ['name', 'type'],
  additionalProperties: false,
} as const satisfies HttpJsonSchemaOrgDraft04Schema;

export const definitions = {
  EntitySpan,
  WorkflowFormInput,
};

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
            schema: tsNonNullable,
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
          response: tsNonNullable,
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
                  $ref: '#/definitions/EntitySpan',
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
                inputs: {
                  type: 'array',
                  items: { $ref: '#/definitions/WorkflowFormInput' },
                },
              },
              required: ['name', 'callback_url', 'inputs'],
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
                    inputs: {
                      type: 'array',
                      items: { $ref: '#/definitions/WorkflowFormInput' },
                    },
                  },
                  required: ['id', 'name', 'inputs'],
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
          requestBody: {
            contentType: 'application/json',
            schema: { type: 'object' },
          },
          response: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
        },
      },
    },
    '/n8n-workflows/:n8nWfId/lastRun': {
      methods: {
        get: {
          operationId: 'GetN8NWorkflowLastRun',
          pathParams: {
            properties: {
              n8nWfId: {
                type: 'string',
              },
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
        post: {
          operationId: 'SetN8NWorkflowLastRun',
          pathParams: {
            properties: {
              n8nWfId: {
                type: 'string',
              },
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
    '/tempfiles': {
      methods: {
        post: {
          operationId: 'UploadTempFile',
          queryParams: {},
          requestBody: {
            contentType: 'multipart/form-data',
            schema: tsNonNullable,
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
    '/tempfiles/:fileId/redaction-entities': {
      methods: {
        get: {
          operationId: 'GetTempFileRedactionEntities',
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
                  $ref: '#/definitions/EntitySpan',
                },
              },
            },
            required: ['data'],
            additionalProperties: false,
          },
        },
      },
    },
    '/tempfiles/:fileId/summarize': {
      methods: {
        post: {
          operationId: 'SummarizeTempFile',
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
    '/jobs': {
      methods: {
        post: {
          operationId: 'ForceRunAllJobs',
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
    '/workflowInputOptions/{type}': {
      methods: {
        get: {
          operationId: 'GetWorkflowInputOptions',
          pathParams: {
            properties: {
              type: {
                type: 'string',
                enum: WorkflowFormInput.properties.enumFrom.enum,
              },
            },
          },
          response: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    displayName: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                  },
                  required: ['value', 'displayName'],
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
  },
} satisfies RouterConfig);
