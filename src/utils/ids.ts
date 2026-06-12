let fallbackCounter = 0;

export function createId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  fallbackCounter += 1;
  return `${prefix}-${Date.now()}-${fallbackCounter}`;
}
