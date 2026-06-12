import {
  defaultWheelSettings,
  MAX_ENTRIES,
  MAX_ENTRY_NAME_LENGTH,
  MAX_HISTORY_ITEMS,
  SPIN_DURATION_MAX_MS,
  SPIN_DURATION_MIN_MS,
  type Entry,
  type SpinHistoryItem,
  type WheelSettings,
  type WheelState,
} from '../types';
import { createEntry, secureShuffle } from '../utils/entries';

export type WheelAction =
  | { type: 'add-entry'; payload: { name: string } }
  | { type: 'add-many'; payload: { names: string[] } }
  | { type: 'edit-entry'; payload: { id: string; name: string } }
  | { type: 'delete-entry'; payload: { id: string } }
  | { type: 'clear-entries' }
  | { type: 'shuffle-entries' }
  | { type: 'record-winner'; payload: SpinHistoryItem }
  | { type: 'remove-winner'; payload: { id: string; historyId: string } }
  | { type: 'clear-history' }
  | { type: 'restore-from-history' }
  | { type: 'update-settings'; payload: Partial<WheelSettings> };

export function createInitialWheelState(overrides?: Partial<WheelState>): WheelState {
  return {
    entries: [],
    history: [],
    settings: defaultWheelSettings,
    ...overrides,
  };
}

function createEntriesFromNames(names: string[]): Entry[] {
  return names
    .map((name) => name.trim().slice(0, MAX_ENTRY_NAME_LENGTH))
    .filter((name) => name.length > 0)
    .map((name) => createEntry(name));
}

export function wheelReducer(state: WheelState, action: WheelAction): WheelState {
  switch (action.type) {
    case 'add-entry': {
      if (state.entries.length >= MAX_ENTRIES) {
        return state;
      }

      const nextName = action.payload.name.trim().slice(0, MAX_ENTRY_NAME_LENGTH);
      if (!nextName) {
        return state;
      }

      return {
        ...state,
        entries: [...state.entries, createEntry(nextName)],
      };
    }

    case 'add-many': {
      if (action.payload.names.length === 0 || state.entries.length >= MAX_ENTRIES) {
        return state;
      }

      const remainingSlots = MAX_ENTRIES - state.entries.length;
      const nextEntries = createEntriesFromNames(action.payload.names).slice(
        0,
        remainingSlots,
      );
      if (nextEntries.length === 0) {
        return state;
      }

      return {
        ...state,
        entries: [...state.entries, ...nextEntries],
      };
    }

    case 'edit-entry': {
      const nextName = action.payload.name.trim().slice(0, MAX_ENTRY_NAME_LENGTH);
      if (!nextName) {
        return state;
      }

      return {
        ...state,
        entries: state.entries.map((entry) =>
          entry.id === action.payload.id ? { ...entry, name: nextName } : entry,
        ),
      };
    }

    case 'delete-entry': {
      return {
        ...state,
        entries: state.entries.filter((entry) => entry.id !== action.payload.id),
      };
    }

    case 'clear-entries': {
      return {
        ...state,
        entries: [],
      };
    }

    case 'shuffle-entries': {
      return {
        ...state,
        entries: secureShuffle(state.entries),
      };
    }

    case 'record-winner': {
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, MAX_HISTORY_ITEMS),
      };
    }

    case 'remove-winner': {
      return {
        ...state,
        entries: state.entries.filter((entry) => entry.id !== action.payload.id),
        history: state.history.map((item) =>
          item.id === action.payload.historyId
            ? { ...item, removedAfterWin: true }
            : item,
        ),
      };
    }

    case 'clear-history': {
      return {
        ...state,
        history: [],
      };
    }

    case 'restore-from-history': {
      if (state.entries.length >= MAX_ENTRIES) {
        return state;
      }

      const existing = new Set(state.entries.map((entry) => entry.name.toLowerCase()));
      const restorables = state.history
        .filter((item) => item.removedAfterWin)
        .map((item) => item.winnerNameSnapshot)
        .filter((name) => {
          const normalized = name.toLowerCase();
          if (existing.has(normalized)) {
            return false;
          }

          existing.add(normalized);
          return true;
        });

      if (restorables.length === 0) {
        return state;
      }

      const remainingSlots = MAX_ENTRIES - state.entries.length;
      const restoredEntries = createEntriesFromNames(restorables).slice(0, remainingSlots);
      if (restoredEntries.length === 0) {
        return state;
      }

      return {
        ...state,
        entries: [...state.entries, ...restoredEntries],
      };
    }

    case 'update-settings': {
      const nextSettings: WheelSettings = {
        ...state.settings,
        ...action.payload,
      };

      if (
        !Number.isFinite(nextSettings.spinDurationMs) ||
        nextSettings.spinDurationMs < SPIN_DURATION_MIN_MS ||
        nextSettings.spinDurationMs > SPIN_DURATION_MAX_MS
      ) {
        nextSettings.spinDurationMs = defaultWheelSettings.spinDurationMs;
      }

      return {
        ...state,
        settings: nextSettings,
      };
    }

    default: {
      return state;
    }
  }
}
