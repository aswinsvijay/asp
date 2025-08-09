import { compile } from 'json-schema-to-typescript';
import fs from 'fs';
import path from 'path';

const schemaDirs = ['../server/schemas/routerConfig'];

export default async function generateTypesFromSchema() {
  for (const dir of schemaDirs) {
    const pathToDir = path.join(__dirname, dir);
    const schemaPath = path.join(pathToDir, 'schema.ts');
    const schema = (await import(schemaPath)).default;
    const types = await compile(schema, schema.title);
    const typesPath = path.join(pathToDir, 'type.ts');

    fs.writeFileSync(typesPath, types);
  }
}
