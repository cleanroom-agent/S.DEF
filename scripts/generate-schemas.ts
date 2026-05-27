#!/usr/bin/env tsx

import { exec } from 'child_process';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CHECK_MODE = process.argv.includes('--check');

function getSchemaVersions(): string[] {
  const dir = join(__dirname, '..', 'schema');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

async function generateSchema(version: string, check: boolean = false): Promise<boolean> {
  const schemaDir = join(__dirname, '..', 'schema', version);
  const schemaTs = join(schemaDir, 'schema.ts');
  const schemaJson = join(schemaDir, 'schema.json');

  if (check) {
    const existingSchema = readFileSync(schemaJson, 'utf-8');

    try {
      const { stdout: generated } = await execAsync(
        `npx typescript-json-schema --defaultNumberType integer --required --skipLibCheck "${schemaTs}" "*"`,
      );

      if (existingSchema.trim() !== generated.trim()) {
        console.error(`  ✗ Schema ${version} is out of date!`);
        return false;
      }

      console.log(`  ✓ Schema ${version} is up to date`);
      return true;
    } catch (error) {
      console.error(`Failed to check schema for ${version}`);
      throw error;
    }
  } else {
    try {
      await execAsync(
        `npx typescript-json-schema --defaultNumberType integer --required --skipLibCheck "${schemaTs}" "*" -o "${schemaJson}"`,
      );
    } catch (error) {
      console.error(`Failed to generate schema for ${version}`);
      throw error;
    }

    console.log(`  ✓ Generated schema for ${version}`);
    return true;
  }
}

async function main(): Promise<void> {
  const versions = getSchemaVersions();

  if (versions.length === 0) {
    console.log('No schema versions found.');
    return;
  }

  if (CHECK_MODE) {
    console.log('Checking JSON schemas...\n');

    const results = await Promise.all(versions.map((v) => generateSchema(v, true)));
    const allValid = results.every((valid) => valid);

    console.log();
    if (!allValid) {
      console.error('Error: Some schemas are out of date. Run: bun run generate:schema');
      process.exit(1);
    } else {
      console.log('All schemas are up to date!');
    }
  } else {
    console.log('Generating JSON schemas...\n');

    await Promise.all(versions.map((v) => generateSchema(v, false)));

    console.log('\nSchema generation complete!');
  }
}

main().catch((error) => {
  console.error('Schema generation failed:', error);
  process.exit(1);
});
