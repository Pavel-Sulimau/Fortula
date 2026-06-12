import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_ENTRIES,
  MAX_ENTRY_NAME_LENGTH,
  SPIN_DURATION_MAX_MS,
  SPIN_DURATION_MIN_MS,
  defaultWheelSettings,
  type PersistedWheelState,
} from '../types';
import {
  STORAGE_KEY,
  loadPersistedState,
  savePersistedState,
} from '../utils/storage';

function sampleState(): PersistedWheelState {
  return {
    entries: [{ id: 'entry-1', name: 'Alice', createdAt: 1 }],
    history: [],
    settings: {
      ...defaultWheelSettings,
      spinDurationMs: defaultWheelSettings.spinDurationMs,
    },
  };
}

type LocalStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  clear: () => void;
};

function createMockStorage(): LocalStorageLike {
  const store = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
    clear(): void {
      store.clear();
    },
  };
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMockStorage(),
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('storage utilities', () => {
  it('falls back to default spinDurationMs when persisted value is too low', () => {
    const state = sampleState();
    state.settings.spinDurationMs = SPIN_DURATION_MIN_MS - 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const loaded = loadPersistedState();

    expect(loaded?.settings.spinDurationMs).toBe(defaultWheelSettings.spinDurationMs);
  });

  it('keeps valid spinDurationMs within range', () => {
    const state = sampleState();
    state.settings.spinDurationMs = SPIN_DURATION_MAX_MS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const loaded = loadPersistedState();

    expect(loaded?.settings.spinDurationMs).toBe(SPIN_DURATION_MAX_MS);
  });

  it('swallows localStorage setItem errors', () => {
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    expect(() => savePersistedState(sampleState())).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('sanitizes persisted entries and caps entry count', () => {
    const raw = {
      entries: Array.from({ length: MAX_ENTRIES + 5 }, (_, index) => ({
        id: `entry-${index}`,
        name: `  ${'x'.repeat(MAX_ENTRY_NAME_LENGTH + 10)}  `,
        createdAt: index,
      })),
      history: [],
      settings: defaultWheelSettings,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    const loaded = loadPersistedState();

    expect(loaded?.entries).toHaveLength(MAX_ENTRIES);
    expect(loaded?.entries[0]?.name).toHaveLength(MAX_ENTRY_NAME_LENGTH);
  });
});
