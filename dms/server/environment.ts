import { loadEnvConfig } from '@next/env';

const requiredEnvironmentVariables = ['MONGODB_CONNECTION_STRING'] as const satisfies string[];

type Environment = Record<(typeof requiredEnvironmentVariables)[number], string>;

function getEnvironment() {
  loadEnvConfig(process.cwd());

  const partialEnvironment: Partial<Environment> = {};
  const missingVariables: string[] = [];

  requiredEnvironmentVariables.forEach((key) => {
    const value = process.env[key]?.trim();

    if (value) {
      partialEnvironment[key] = value;
    } else {
      missingVariables.push(key);
    }
  });

  if (missingVariables.length) {
    throw new Error(`Missing environment variable - ${missingVariables.join(',')}`);
  }

  return partialEnvironment as Environment;
}

export const environment = getEnvironment();
