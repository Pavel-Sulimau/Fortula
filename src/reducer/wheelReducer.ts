import {
  defaultWheelSettings,
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
  return names.map((name) => createEntry(name));
}

export function wheelReducer(state: WheelState, action: WheelAction): WheelState {
  switch (action.type) {
    case 'add-entry': {
      const nextName = action.payload.name.trim();
      if (!nextName) {
        return state;
      }

      return {
        ...state,
        entries: [...state.entries, createEntry(nextName)],
      };
    }

    case 'add-many': {
      if (action.payload.names.length === 0) {
        return state;
      }

      return {
        ...state,
        entries: [...state.entries, ...createEntriesFromNames(action.payload.names)],
      };
    }

    case 'edit-entry': {
      const nextName = action.payload.name.trim();
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
        history: [action.payload, ...state.history],
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
      const existing = new Set(state.entries.map((entry) => entry.name.toLocaleLowerCase()));
      const restorables = state.history
        .filter((item) => item.removedAfterWin)
        .map((item) => item.winnerNameSnapshot)
        .filter((name) => {
          const normalized = name.toLocaleLowerCase();
          if (existing.has(normalized)) {
            return false;
          }

          existing.add(normalized);
          return true;
        });

      if (restorables.length === 0) {
        return state;
      }

      return {
        ...state,
        entries: [...state.entries, ...createEntriesFromNames(restorables)],
      };
    }

    case 'update-settings': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    }

    default: {
      return state;
    }
  }
}
