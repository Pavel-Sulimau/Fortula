export type FairnessSummary = {
  rounds: number;
  entries: number;
  expectedPerEntry: number;
  chiSquare: number;
  histogram: number[];
};

export function computeChiSquare(histogram: number[]): number {
  if (histogram.length === 0) {
    return 0;
  }

  const rounds = histogram.reduce((sum, value) => sum + value, 0);
  const expectedPerEntry = rounds / histogram.length;

  if (expectedPerEntry === 0) {
    return 0;
  }

  return histogram.reduce((sum, observed) => {
    const delta = observed - expectedPerEntry;
    return sum + (delta * delta) / expectedPerEntry;
  }, 0);
}

export function summarizeFairness(histogram: number[]): FairnessSummary {
  const rounds = histogram.reduce((sum, value) => sum + value, 0);
  const expectedPerEntry = histogram.length > 0 ? rounds / histogram.length : 0;

  return {
    rounds,
    entries: histogram.length,
    expectedPerEntry,
    chiSquare: computeChiSquare(histogram),
    histogram,
  };
}
