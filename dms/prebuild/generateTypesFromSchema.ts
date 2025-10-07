import { compile } from 'json-schema-to-typescript';
import fs from 'fs';
import path from 'path';
import { resolveConfig } from 'prettier';
import { UNSAFE_PROPERTY_ACCESS } from '../src/utils/typeUtils';

const schemaDirs = ['../server/schemas/routerConfig'];

export default async function generateTypesFromSchema() {
  for (const dir of schemaDirs) {
    const pathToDir = path.join(__dirname, dir);
    const schemaPath = path.join(pathToDir, 'schema.ts');
    const schema = UNSAFE_PROPERTY_ACCESS<Record<string, unknown>>(await import(schemaPath), 'default');

    const config = await resolveConfig(__dirname);

    if (!config) {
      throw new Error('No prettier config found');
    }

    const types = await compile(schema, UNSAFE_PROPERTY_ACCESS(schema, 'title'), { style: config });
    const typesPath = path.join(pathToDir, 'type.ts');

    fs.writeFileSync(typesPath, types);
  }
}
