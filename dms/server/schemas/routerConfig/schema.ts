import { JSONSchema } from 'json-schema-to-typescript';

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
                  $ref: 'http://json-schema.org/draft-04/schema#',
                },
              },
            },
            queryParams: {
              type: 'object',
              patternProperties: {
                '*': {
                  $ref: 'http://json-schema.org/draft-04/schema#',
                },
              },
            },
            response: {
              $ref: 'http://json-schema.org/draft-04/schema#',
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
                  $ref: 'http://json-schema.org/draft-04/schema#',
                },
              },
            },
            queryParams: {
              type: 'object',
              patternProperties: {
                '*': {
                  $ref: 'http://json-schema.org/draft-04/schema#',
                },
              },
            },
            requestBody: {
              $ref: 'http://json-schema.org/draft-04/schema#',
            },
            response: {
              $ref: 'http://json-schema.org/draft-04/schema#',
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
