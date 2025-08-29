import { compile } from 'json-schema-to-typescript';
import fs from 'fs';
import path from 'path';
import { UNSAFE_PROPERTY_ACCESS } from '../src/utils';

const schemaDirs = ['../server/schemas/routerConfig'];

export default async function generateTypesFromSchema() {
  for (const dir of schemaDirs) {
    const pathToDir = path.join(__dirname, dir);
    const schemaPath = path.join(pathToDir, 'schema.ts');
    const schema = UNSAFE_PROPERTY_ACCESS<Record<string, unknown>>(await import(schemaPath), 'default');
    const types = await compile(schema, UNSAFE_PROPERTY_ACCESS(schema, 'title'));
    const typesPath = path.join(pathToDir, 'type.ts');

    fs.writeFileSync(typesPath, types);
  }
}
