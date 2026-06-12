export type Entry = {
  id: string;
  name: string;
  createdAt: number;
};

export type WheelSettings = {
  soundEnabled: boolean;
  confettiEnabled: boolean;
  eliminationMode: boolean;
  autoRemoveWinner: boolean;
  spinDurationMs: number;
};

export type SpinHistoryItem = {
  id: string;
  winnerEntryId: string;
  winnerNameSnapshot: string;
  timestamp: number;
  removedAfterWin: boolean;
};

export type WheelState = {
  entries: Entry[];
  history: SpinHistoryItem[];
  settings: WheelSettings;
};

export type PersistedWheelState = Pick<WheelState, 'entries' | 'history' | 'settings'>;

export const MAX_ENTRY_NAME_LENGTH = 200;
export const MAX_ENTRIES = 500;
export const MAX_HISTORY_ITEMS = 200;
export const SPIN_DURATION_MIN_MS = 2000;
export const SPIN_DURATION_MAX_MS = 8000;
export const SPIN_SETTLE_BUFFER_MS = 140;

export const defaultWheelSettings: WheelSettings = {
  soundEnabled: false,
  confettiEnabled: true,
  eliminationMode: false,
  autoRemoveWinner: false,
  spinDurationMs: 5200,
};
