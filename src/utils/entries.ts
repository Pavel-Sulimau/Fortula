import type { Entry } from '../types';
import { MAX_ENTRIES, MAX_ENTRY_NAME_LENGTH } from '../types';
import { createId } from './ids';
import { generateUnbiasedIndex } from './random';

export function createEntry(name: string): Entry {
  return {
    id: createId('entry'),
    name,
    createdAt: Date.now(),
  };
}

export function trimAndFilterLines(multilineText: string, maxLines = MAX_ENTRIES): string[] {
  const normalizedMaxLines =
    Number.isInteger(maxLines) && maxLines > 0 ? maxLines : MAX_ENTRIES;
  const scanLimit = normalizedMaxLines * 2;

  const trimmedLines: string[] = [];
  let start = 0;
  let scannedLines = 0;

  while (start <= multilineText.length && scannedLines < scanLimit) {
    const end = multilineText.indexOf('\n', start);
    const rawLine =
      end === -1 ? multilineText.slice(start) : multilineText.slice(start, end);
    const sanitized = rawLine
      .replace(/\r$/, '')
      .trim()
      .slice(0, MAX_ENTRY_NAME_LENGTH);

    if (sanitized.length > 0) {
      trimmedLines.push(sanitized);
      if (trimmedLines.length >= normalizedMaxLines) {
        break;
      }
    }

    if (end === -1) {
      break;
    }

    scannedLines += 1;
    start = end + 1;
  }

  return trimmedLines;
}

export function deduplicateCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = value.toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export function secureShuffle<T>(values: T[]): T[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = generateUnbiasedIndex(index + 1);
    const current = shuffled[index] as T;
    shuffled[index] = shuffled[swapIndex] as T;
    shuffled[swapIndex] = current;
  }

  return shuffled;
}
