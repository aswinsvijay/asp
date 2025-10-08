import { JSONSchema } from 'json-schema-to-typescript';

const jsonSchemaPath = 'http://json-schema.org/draft-04/schema#';

const schema = {
  title: 'RouterConfig',
  type: 'object',
  properties: {
    paths: {
      $ref: '#/definitions/RouterConfigPaths',
    },
    methods: {
      $ref: '#/definitions/PathMethods',
    },
  },
  required: [],
  additionalProperties: false,

  definitions: {
    RouterConfigPaths: {
      type: 'object',
      patternProperties: {
        '^/.*': {
          $ref: '#',
        },
      },
    },
    PathMethods: {
      type: 'object',
      properties: {
        get: {
          $ref: '#/definitions/GetMethodConfig',
        },
        post: {
          $ref: '#/definitions/PostMethodConfig',
        },
        patch: {
          $ref: '#/definitions/PatchMethodConfig',
        },
      },
      additionalProperties: false,
    },
    GetMethodConfig: {
      allOf: [
        {
          $ref: '#/definitions/ControllerInfo',
        },
        {
          type: 'object',
          properties: {
            pathParams: {
              type: 'object',
              properties: {
                properties: {
                  type: 'object',
                  patternProperties: {
                    '*': {
                      $ref: jsonSchemaPath,
                    },
                  },
                },
              },
              additionalProperties: false,
            },
            queryParams: {
              type: 'object',
              properties: {
                properties: {
                  type: 'object',
                  patternProperties: {
                    '*': {
                      $ref: jsonSchemaPath,
                    },
                  },
                },
              },
              additionalProperties: false,
            },
            requestBody: {
              type: 'null',
            },
            response: {
              $ref: jsonSchemaPath,
            },
          },
          required: ['response'],
          additionalProperties: false,
        },
      ],
    },
    PostMethodConfig: {
      allOf: [
        {
          $ref: '#/definitions/ControllerInfo',
        },
        {
          type: 'object',
          properties: {
            pathParams: {
              type: 'object',
              properties: {
                properties: {
                  type: 'object',
                  patternProperties: {
                    '*': {
                      $ref: jsonSchemaPath,
                    },
                  },
                },
              },
              additionalProperties: false,
            },
            queryParams: {
              type: 'object',
              properties: {
                properties: {
                  type: 'object',
                  patternProperties: {
                    '*': {
                      $ref: jsonSchemaPath,
                    },
                  },
                },
              },
              additionalProperties: false,
            },
            requestBody: {
              $ref: '#/definitions/RequestBody',
            },
            response: {
              $ref: jsonSchemaPath,
            },
          },
          required: ['response'],
          additionalProperties: false,
        },
      ],
    },
    PatchMethodConfig: {
      allOf: [
        {
          $ref: '#/definitions/ControllerInfo',
        },
        {
          type: 'object',
          properties: {
            pathParams: {
              type: 'object',
              properties: {
                properties: {
                  type: 'object',
                  patternProperties: {
                    '*': {
                      $ref: jsonSchemaPath,
                    },
                  },
                },
              },
              additionalProperties: false,
            },
            queryParams: {
              type: 'object',
              properties: {
                properties: {
                  type: 'object',
                  patternProperties: {
                    '*': {
                      $ref: jsonSchemaPath,
                    },
                  },
                },
              },
              additionalProperties: false,
            },
            requestBody: {
              $ref: '#/definitions/RequestBody',
            },
            response: {
              $ref: jsonSchemaPath,
            },
          },
          required: ['response'],
          additionalProperties: false,
        },
      ],
    },
    ControllerInfo: {
      type: 'object',
      properties: {
        controller: {
          type: 'string',
        },
        operationId: {
          type: 'string',
        },
        zapierConfig: {
          $ref: '#/definitions/ZapierConfig',
        },
      },
      required: ['zapierConfig', 'controller', 'operationId'],
      additionalProperties: false,
    },
    ZapierConfig: {
      type: 'object',
      properties: {
        actionType: {
          type: 'string',
          enum: ['triggers', 'searches', 'creates'],
        },
      },
      required: ['actionType'],
      additionalProperties: false,
    },
    RequestBody: {
      type: 'object',
      properties: {
        contentType: {
          $ref: '#/definitions/ContentType',
        },
        schema: {
          $ref: jsonSchemaPath,
        },
      },
      required: ['contentType', 'schema'],
      additionalProperties: false,
    },
    ContentType: {
      type: 'string',
      enum: [
        'application/json',
        'text/plain',
        'text/html',
        'image/png',
        'application/octet-stream',
        'multipart/form-data',
      ],
    },
  },
} satisfies JSONSchema;

export default schema;
