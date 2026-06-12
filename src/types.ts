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

export const defaultWheelSettings: WheelSettings = {
  soundEnabled: false,
  confettiEnabled: true,
  eliminationMode: false,
  autoRemoveWinner: false,
  spinDurationMs: 5200,
};
