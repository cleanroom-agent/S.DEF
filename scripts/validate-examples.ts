#!/usr/bin/env tsx

import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { Dirent } from 'fs';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

type ValidationResult = [name: string, errors: Promise<string[]>];

async function validateExample(
  examplePath: string,
  validate: ValidateFunction,
): Promise<string[]> {
  try {
    const example = JSON.parse(await readFile(examplePath, 'utf-8'));
    validate(example);
    return (validate.errors ?? []).map(
      (err) => `${err.instancePath || '/'}: ${err.message}`,
    );
  } catch (e) {
    return [(e as Error).message];
  }
}

async function validateSchemaExamples(schemaDir: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  let schema: Record<string, unknown>;
  try {
    schema = JSON.parse(
      await readFile(join(schemaDir, 'schema.json'), 'utf-8'),
    );
  } catch {
    return results;
  }

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const defs = (schema.$defs || schema.definitions) as Record<string, unknown> | undefined;

  const examplesDir = join(schemaDir, 'examples');
  let dirents: Dirent[];
  try {
    dirents = await readdir(examplesDir, { withFileTypes: true });
  } catch {
    return results;
  }

  // Direct JSON files in examples/ are validated against the full schema
  const validateFull = ajv.compile(schema);

  for (const dirent of dirents) {
    if (dirent.isFile() && dirent.name.endsWith('.json')) {
      const filePath = join(examplesDir, dirent.name);
      results.push([filePath, validateExample(filePath, validateFull)]);
      continue;
    }

    if (!dirent.isDirectory()) continue;

    const typeName = dirent.name;
    const typeDir = join(examplesDir, typeName);

    let validate: ValidateFunction | undefined;
    if (defs?.[typeName]) {
      validate = ajv.compile({
        $schema: schema.$schema as string,
        ...schema,
        ...(defs[typeName] as object),
      });
    } else {
      // Default: validate against full schema
      validate = validateFull;
    }

    for (const exampleFile of await readdir(typeDir)) {
      if (!exampleFile.endsWith('.json')) continue;
      const examplePath = join(typeDir, exampleFile);
      results.push([examplePath, validateExample(examplePath, validate!)]);
    }
  }

  return results;
}

async function main() {
  console.log('Validating JSON examples...\n');

  const schemaDirs = (await readdir(join(__dirname, '..', 'schema'), { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => join(__dirname, '..', 'schema', d.name));

  const results = (await Promise.all(schemaDirs.map(validateSchemaExamples))).flat();

  let passed = 0;
  let failed = 0;

  for (const [name, errorsPromise] of results) {
    const errors = await errorsPromise;
    if (errors.length === 0) {
      console.log(`✓ ${name}`);
      passed += 1;
    } else {
      console.log(`✗ ${name}`);
      for (const err of errors) {
        console.log(`    ${err}`);
      }
      failed += 1;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) process.exit(1);
}

main();
