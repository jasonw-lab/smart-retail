import { execSync } from 'child_process';
import fs from 'fs/promises';
import { serverEnv } from '@/lib/env/server';

const specUrl = serverEnv.OPENAPI_SPEC_URL || 'http://localhost:8080/api/v1/api-docs';
const outputPath = 'types/api-generated.d.ts';

async function main() {
  try {
    execSync(`npx openapi-typescript ${specUrl} -o ${outputPath}`, { stdio: 'inherit' });
  } catch {
    process.stderr.write('Failed to fetch live OpenAPI spec.\n');

    try {
      await fs.access(outputPath);
      process.stderr.write(`Existing ${outputPath} kept as fallback.\n`);
    } catch {
      process.stderr.write(`No fallback ${outputPath} found.\n`);
      process.exit(1);
    }
  }
}

main();
