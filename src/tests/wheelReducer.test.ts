import { describe, expect, it } from 'vitest';
import {
  createInitialWheelState,
  wheelReducer,
} from '../reducer/wheelReducer';
import {
  MAX_ENTRIES,
  MAX_ENTRY_NAME_LENGTH,
  MAX_HISTORY_ITEMS,
  type SpinHistoryItem,
} from '../types';

function createHistoryItem(index: number): SpinHistoryItem {
  return {
    id: `history-${index}`,
    winnerEntryId: `entry-${index}`,
    winnerNameSnapshot: `Winner ${index}`,
    timestamp: index,
    removedAfterWin: false,
  };
}

describe('wheelReducer', () => {
  it('caps single entry names at MAX_ENTRY_NAME_LENGTH', () => {
    const state = createInitialWheelState();
    const longName = 'x'.repeat(MAX_ENTRY_NAME_LENGTH + 20);

    const next = wheelReducer(state, {
      type: 'add-entry',
      payload: { name: longName },
    });

    expect(next.entries).toHaveLength(1);
    expect(next.entries[0]?.name).toHaveLength(MAX_ENTRY_NAME_LENGTH);
  });

  it('prevents adding entries beyond MAX_ENTRIES', () => {
    const state = createInitialWheelState({
      entries: Array.from({ length: MAX_ENTRIES }, (_, index) => ({
        id: `entry-${index}`,
        name: `Entry ${index}`,
        createdAt: index,
      })),
    });

    const next = wheelReducer(state, {
      type: 'add-entry',
      payload: { name: 'Overflow' },
    });

    expect(next.entries).toHaveLength(MAX_ENTRIES);
  });

  it('caps history length at MAX_HISTORY_ITEMS', () => {
    const state = createInitialWheelState({
      history: Array.from({ length: MAX_HISTORY_ITEMS }, (_, index) =>
        createHistoryItem(index + 1),
      ),
    });

    const next = wheelReducer(state, {
      type: 'record-winner',
      payload: createHistoryItem(999),
    });

    expect(next.history).toHaveLength(MAX_HISTORY_ITEMS);
    expect(next.history[0]?.id).toBe('history-999');
  });

  it('does not restore duplicate names from history', () => {
    const state = createInitialWheelState({
      entries: [{ id: 'entry-1', name: 'Alice', createdAt: 1 }],
      history: [
        {
          id: 'history-1',
          winnerEntryId: 'entry-2',
          winnerNameSnapshot: 'ALICE',
          timestamp: 1,
          removedAfterWin: true,
        },
      ],
    });

    const next = wheelReducer(state, { type: 'restore-from-history' });
    expect(next.entries).toHaveLength(1);
  });
});
