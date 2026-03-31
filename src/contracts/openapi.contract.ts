import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';

type JsonPrimitiveType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';

export interface OpenApiSchema {
  $ref?: string;
  type?: JsonPrimitiveType;
  enum?: unknown[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  required?: string[];
  format?: string;
}

interface OpenApiMediaType {
  schema?: OpenApiSchema;
}

interface OpenApiResponse {
  content?: Record<string, OpenApiMediaType>;
}

interface OpenApiOperation {
  responses?: Record<string, OpenApiResponse>;
}

interface OpenApiComponents {
  schemas?: Record<string, OpenApiSchema>;
}

export interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
  components?: OpenApiComponents;
}

let cachedDocument: OpenApiDocument | null = null;

export function loadOpenApiDocument(): OpenApiDocument {
  if (cachedDocument) {
    return cachedDocument;
  }

  const documentPath = path.resolve(process.cwd(), 'openapi/parabank.openapi.json');
  const rawDocument = fs.readFileSync(documentPath, 'utf-8');

  cachedDocument = JSON.parse(rawDocument) as OpenApiDocument;

  return cachedDocument;
}

export function expectOperationDefined(
  document: OpenApiDocument,
  pathName: string,
  method: 'get' | 'post',
): void {
  expect(document.paths[pathName], `Missing OpenAPI path ${pathName}`).toBeDefined();
  expect(document.paths[pathName]?.[method], `Missing OpenAPI operation ${method.toUpperCase()} ${pathName}`).toBeDefined();
}

export function getJsonResponseSchema(
  document: OpenApiDocument,
  pathName: string,
  method: 'get' | 'post',
): OpenApiSchema {
  const operation = document.paths[pathName]?.[method];

  expect(operation, `OpenAPI operation not found for ${method.toUpperCase()} ${pathName}`).toBeDefined();

  const response =
    operation?.responses?.['200']
    ?? operation?.responses?.['201']
    ?? operation?.responses?.default;
  const mediaType =
    response?.content?.['application/json']
    ?? response?.content?.['text/plain']
    ?? Object.values(response?.content ?? {})[0];

  expect(mediaType?.schema, `OpenAPI schema not found for ${method.toUpperCase()} ${pathName}`).toBeDefined();

  return mediaType!.schema!;
}

export function assertMatchesOpenApiSchema(
  value: unknown,
  schema: OpenApiSchema,
  document: OpenApiDocument,
  valuePath = 'response',
): void {
  const resolvedSchema = resolveSchema(schema, document);

  if (resolvedSchema.enum) {
    expect(resolvedSchema.enum, `Unexpected enum value at ${valuePath}`).toContain(value);
  }

  switch (resolvedSchema.type) {
    case 'object':
      expect(value, `Expected object at ${valuePath}`).not.toBeNull();
      expect(Array.isArray(value), `Expected object at ${valuePath}`).toBe(false);
      expect(typeof value, `Expected object at ${valuePath}`).toBe('object');

      for (const requiredProperty of resolvedSchema.required ?? []) {
        expect(value, `Missing required property ${valuePath}.${requiredProperty}`).toHaveProperty(requiredProperty);
      }

      for (const [propertyName, propertySchema] of Object.entries(resolvedSchema.properties ?? {})) {
        if ((value as Record<string, unknown>)[propertyName] === undefined) {
          continue;
        }

        assertMatchesOpenApiSchema(
          (value as Record<string, unknown>)[propertyName],
          propertySchema,
          document,
          `${valuePath}.${propertyName}`,
        );
      }
      return;

    case 'array':
      expect(Array.isArray(value), `Expected array at ${valuePath}`).toBe(true);

      for (const [index, item] of (value as unknown[]).entries()) {
        assertMatchesOpenApiSchema(item, resolvedSchema.items ?? {}, document, `${valuePath}[${index}]`);
      }
      return;

    case 'integer':
      expect(typeof value, `Expected integer at ${valuePath}`).toBe('number');
      expect(Number.isInteger(value), `Expected integer at ${valuePath}`).toBe(true);
      return;

    case 'number':
      expect(typeof value, `Expected number at ${valuePath}`).toBe('number');
      return;

    case 'boolean':
      expect(typeof value, `Expected boolean at ${valuePath}`).toBe('boolean');
      return;

    case 'string':
      expect(typeof value, `Expected string at ${valuePath}`).toBe('string');
      return;

    default:
      return;
  }
}

function resolveSchema(schema: OpenApiSchema, document: OpenApiDocument): OpenApiSchema {
  if (!schema.$ref) {
    return schema;
  }

  const schemaName = schema.$ref.replace('#/components/schemas/', '');
  const resolvedSchema = document.components?.schemas?.[schemaName];

  expect(resolvedSchema, `Unable to resolve schema reference ${schema.$ref}`).toBeDefined();

  return resolvedSchema!;
}
