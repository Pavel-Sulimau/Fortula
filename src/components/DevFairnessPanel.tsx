import { useMemo, useState } from 'react';
import { generateUnbiasedIndex, isSecureRandomAvailable } from '../utils/random';
import { summarizeFairness, type FairnessSummary } from '../utils/statistics';

type DevFairnessPanelProps = {
  defaultEntryCount: number;
};

function runSimulation(entryCount: number, rounds: number): FairnessSummary {
  const histogram = Array.from({ length: entryCount }, () => 0);

  for (let step = 0; step < rounds; step += 1) {
    const winner = generateUnbiasedIndex(entryCount);
    histogram[winner] += 1;
  }

  return summarizeFairness(histogram);
}

export function DevFairnessPanel({ defaultEntryCount }: DevFairnessPanelProps) {
  const [entryCount, setEntryCount] = useState(Math.max(2, defaultEntryCount));
  const [rounds, setRounds] = useState(25000);
  const [result, setResult] = useState<FairnessSummary | null>(null);

  const isSecure = useMemo(() => isSecureRandomAvailable(), []);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <section className="panel dev-panel" aria-label="Fairness simulation">
      <h2>Dev fairness simulation</h2>
      {!isSecure ? (
        <p className="muted">Secure randomness is unavailable, simulation disabled.</p>
      ) : null}
      <div className="dev-controls">
        <label>
          Entries
          <input
            type="number"
            min={2}
            max={200}
            value={entryCount}
            onChange={(event) => setEntryCount(Number(event.target.value))}
          />
        </label>
        <label>
          Rounds
          <input
            type="number"
            min={1000}
            max={500000}
            step={1000}
            value={rounds}
            onChange={(event) => setRounds(Number(event.target.value))}
          />
        </label>
        <button
          type="button"
          className="secondary"
          disabled={!isSecure}
          onClick={() => {
            if (entryCount > 1 && rounds > 0) {
              setResult(runSimulation(entryCount, rounds));
            }
          }}
        >
          Run simulation
        </button>
      </div>
      {result ? (
        <div className="simulation-result">
          <p>
            Chi-square: <strong>{result.chiSquare.toFixed(2)}</strong>
          </p>
          <p>
            Expected per entry: <strong>{result.expectedPerEntry.toFixed(1)}</strong>
          </p>
          <pre>{JSON.stringify(result.histogram, null, 2)}</pre>
        </div>
      ) : (
        <p className="muted">Run a batch to inspect the histogram distribution.</p>
      )}
    </section>
  );
}
