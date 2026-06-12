import { describe, expect, it } from 'vitest';
import { createUnbiasedIndexGenerator } from '../utils/random';

describe('createUnbiasedIndexGenerator', () => {
  it('returns indices in expected range', () => {
    let value = 0;
    const generator = createUnbiasedIndexGenerator(() => {
      value = (value + 17) >>> 0;
      return value;
    });

    for (let run = 0; run < 1000; run += 1) {
      const index = generator(7);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(7);
    }
  });

  it('uses rejection sampling to drop biased values', () => {
    const maxExclusive = 10;
    const upperBound = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
    const rejectedValue = upperBound;
    const acceptedValue = 42;

    const stream = [rejectedValue, acceptedValue];
    const generator = createUnbiasedIndexGenerator(() => {
      const next = stream.shift();
      return next ?? acceptedValue;
    });

    expect(generator(maxExclusive)).toBe(acceptedValue % maxExclusive);
    expect(stream.length).toBe(0);
  });

  it('approximates uniform distribution over many trials', () => {
    const target = 5;
    let seed = 123456789;
    const nextUint32 = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed;
    };

    const generator = createUnbiasedIndexGenerator(nextUint32);
    const rounds = 100000;
    const histogram = Array.from({ length: target }, () => 0);

    for (let index = 0; index < rounds; index += 1) {
      histogram[generator(target)] += 1;
    }

    const expected = rounds / target;
    const tolerance = expected * 0.03;
    for (const observed of histogram) {
      expect(Math.abs(observed - expected)).toBeLessThan(tolerance);
    }
  });
});
