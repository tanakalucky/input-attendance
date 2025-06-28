import type { BrowserWorker } from '@cloudflare/playwright';

export type Env = {
  MYBROWSER: BrowserWorker;
};

// Type guard for environment validation
export function validateEnv(env: unknown): env is Env {
  // Add your environment validation logic here
  return typeof env === 'object' && env !== null;
}
