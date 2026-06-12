import type { Entry } from '../types';
import { createId } from './ids';
import { generateUnbiasedIndex } from './random';

export function createEntry(name: string): Entry {
  return {
    id: createId('entry'),
    name,
    createdAt: Date.now(),
  };
}

export function trimAndFilterLines(multilineText: string): string[] {
  return multilineText
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function findDuplicatesByCaseInsensitive(values: string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    const normalized = value.toLocaleLowerCase();
    if (seen.has(normalized)) {
      duplicates.add(normalized);
      continue;
    }
    seen.add(normalized);
  }

  return duplicates;
}

export function deduplicateCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = value.toLocaleLowerCase();
    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export function secureShuffle<T>(values: T[]): T[] {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = generateUnbiasedIndex(index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}
