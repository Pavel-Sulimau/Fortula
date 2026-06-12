import { defaultWheelSettings, type PersistedWheelState } from '../types';

export const STORAGE_KEY = 'pickwise-state-v1';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function loadPersistedState(): PersistedWheelState | undefined {
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed)) {
      return undefined;
    }

    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.filter(
          (entry): entry is PersistedWheelState['entries'][number] => {
            return (
              isPlainObject(entry) &&
              typeof entry.id === 'string' &&
              typeof entry.name === 'string' &&
              typeof entry.createdAt === 'number'
            );
          },
        )
      : [];

    const history = Array.isArray(parsed.history)
      ? parsed.history.filter(
          (item): item is PersistedWheelState['history'][number] => {
            return (
              isPlainObject(item) &&
              typeof item.id === 'string' &&
              typeof item.winnerEntryId === 'string' &&
              typeof item.winnerNameSnapshot === 'string' &&
              typeof item.timestamp === 'number' &&
              typeof item.removedAfterWin === 'boolean'
            );
          },
        )
      : [];

    const settings = isPlainObject(parsed.settings)
      ? {
          soundEnabled:
            typeof parsed.settings.soundEnabled === 'boolean'
              ? parsed.settings.soundEnabled
              : defaultWheelSettings.soundEnabled,
          confettiEnabled:
            typeof parsed.settings.confettiEnabled === 'boolean'
              ? parsed.settings.confettiEnabled
              : defaultWheelSettings.confettiEnabled,
          eliminationMode:
            typeof parsed.settings.eliminationMode === 'boolean'
              ? parsed.settings.eliminationMode
              : defaultWheelSettings.eliminationMode,
          autoRemoveWinner:
            typeof parsed.settings.autoRemoveWinner === 'boolean'
              ? parsed.settings.autoRemoveWinner
              : defaultWheelSettings.autoRemoveWinner,
          spinDurationMs:
            typeof parsed.settings.spinDurationMs === 'number'
              ? parsed.settings.spinDurationMs
              : defaultWheelSettings.spinDurationMs,
        }
      : defaultWheelSettings;

    return {
      entries,
      history,
      settings,
    };
  } catch {
    return undefined;
  }
}

export function savePersistedState(state: PersistedWheelState): void {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
