import type { SpinHistoryItem } from '../types';

type HistoryPanelProps = {
  history: SpinHistoryItem[];
  onClearHistory: () => void;
};

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function HistoryPanel({ history, onClearHistory }: HistoryPanelProps) {
  return (
    <section className="panel history-panel" aria-label="Winner history">
      <div className="panel-head">
        <h2>Winner history</h2>
        <button
          type="button"
          className="ghost"
          disabled={history.length === 0}
          onClick={onClearHistory}
        >
          Clear history
        </button>
      </div>
      {history.length === 0 ? (
        <p className="muted">No rounds played yet.</p>
      ) : (
        <ol>
          {history.map((item, index) => (
            <li key={item.id} className="history-item">
              <p>
                Round {history.length - index}: <strong>{item.winnerNameSnapshot}</strong>
              </p>
              <p className="meta">{formatTimestamp(item.timestamp)}</p>
              {item.removedAfterWin ? (
                <p className="meta">Removed from wheel</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
