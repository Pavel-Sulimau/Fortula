import { describe, expect, it } from 'vitest';
import { MAX_ENTRY_NAME_LENGTH } from '../types';
import {
  deduplicateCaseInsensitive,
  secureShuffle,
  trimAndFilterLines,
} from '../utils/entries';

describe('entries utilities', () => {
  it('trims lines, drops blanks, and caps output by maxLines', () => {
    const input = ['  Alice  ', '', 'Bob', '   ', 'Charlie', 'Daisy'].join('\n');

    expect(trimAndFilterLines(input, 2)).toEqual(['Alice', 'Bob']);
  });

  it('caps imported line length at MAX_ENTRY_NAME_LENGTH', () => {
    const longLine = 'x'.repeat(MAX_ENTRY_NAME_LENGTH + 20);
    const [first] = trimAndFilterLines(longLine);

    expect(first).toHaveLength(MAX_ENTRY_NAME_LENGTH);
  });

  it('deduplicates names case-insensitively while preserving first occurrences', () => {
    const values = ['Alice', 'ALICE', 'Bob', 'alice', 'BOB', 'Cara'];

    expect(deduplicateCaseInsensitive(values)).toEqual(['Alice', 'Bob', 'Cara']);
  });

  it('secureShuffle returns a permutation without mutating input', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    const shuffled = secureShuffle(values);

    expect(shuffled).toHaveLength(values.length);
    expect([...shuffled].sort()).toEqual([...values].sort());
    expect(new Set(shuffled).size).toBe(values.length);
    expect(values).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
});