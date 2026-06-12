const UINT32_SPACE = 0x1_0000_0000;

function readSecureUint32(): number {
  if (!isSecureRandomAvailable()) {
    throw new Error('Secure randomness is unavailable in this browser.');
  }

  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0] ?? 0;
}

export function isSecureRandomAvailable(): boolean {
  return typeof globalThis.crypto?.getRandomValues === 'function';
}

export function createUnbiasedIndexGenerator(nextUint32: () => number) {
  return (maxExclusive: number): number => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error('maxExclusive must be a positive integer.');
    }

    const unbiasedUpperBound =
      Math.floor(UINT32_SPACE / maxExclusive) * maxExclusive;

    let randomValue = nextUint32();
    while (randomValue >= unbiasedUpperBound) {
      randomValue = nextUint32();
    }

    return randomValue % maxExclusive;
  };
}

export const generateUnbiasedIndex = createUnbiasedIndexGenerator(readSecureUint32);

export function generateSecureInt(
  minInclusive: number,
  maxInclusive: number,
): number {
  if (!Number.isInteger(minInclusive) || !Number.isInteger(maxInclusive)) {
    throw new Error('Range bounds must be integers.');
  }

  if (minInclusive > maxInclusive) {
    throw new Error('minInclusive cannot be greater than maxInclusive.');
  }

  const span = maxInclusive - minInclusive + 1;
  return minInclusive + generateUnbiasedIndex(span);
}
