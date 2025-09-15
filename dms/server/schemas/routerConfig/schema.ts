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
              patternProperties: {
                '*': {
                  $ref: jsonSchemaPath,
                },
              },
            },
            queryParams: {
              type: 'object',
              patternProperties: {
                '*': {
                  $ref: jsonSchemaPath,
                },
              },
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
              patternProperties: {
                '*': {
                  $ref: jsonSchemaPath,
                },
              },
            },
            queryParams: {
              type: 'object',
              patternProperties: {
                '*': {
                  $ref: jsonSchemaPath,
                },
              },
            },
            requestBody: {
              $ref: jsonSchemaPath,
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
              patternProperties: {
                '*': {
                  $ref: jsonSchemaPath,
                },
              },
            },
            queryParams: {
              type: 'object',
              patternProperties: {
                '*': {
                  $ref: jsonSchemaPath,
                },
              },
            },
            requestBody: {
              $ref: jsonSchemaPath,
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
      },
      required: ['controller', 'operationId'],
      additionalProperties: false,
    },
  },
} satisfies JSONSchema;

export default schema;
