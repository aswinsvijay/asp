import { fixUnclassifiedDocuments } from './fixUnclassifiedDocuments';
import { extractText } from './extractText';

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

export const jobs = [fixUnclassifiedDocuments, extractText];

async function runLoop(callback: () => Promise<void>) {
  try {
    console.log(`Starting job ${callback.name}`);
    await callback();
    console.log(`Job ${callback.name} run success`);
  } catch (error) {
    console.error('Error running fixUnclassifiedDocuments job', error);
  } finally {
    setTimeout(() => void runLoop(callback), FIFTEEN_MINUTES_IN_MS);
  }
}

export function initialize() {
  for (const job of jobs) {
    void runLoop(job);
  }
}
