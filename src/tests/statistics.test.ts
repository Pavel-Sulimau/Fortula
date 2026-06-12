import { describe, expect, it } from 'vitest';
import { computeChiSquare, summarizeFairness } from '../utils/statistics';

describe('statistics utilities', () => {
  it('returns zero chi-square for empty histograms', () => {
    expect(computeChiSquare([])).toBe(0);
  });

  it('computes chi-square for a non-uniform histogram', () => {
    expect(computeChiSquare([10, 20, 30])).toBe(10);
  });

  it('summarizes fairness metrics from histogram input', () => {
    const summary = summarizeFairness([8, 12, 10]);

    expect(summary.rounds).toBe(30);
    expect(summary.entries).toBe(3);
    expect(summary.expectedPerEntry).toBe(10);
    expect(summary.chiSquare).toBeCloseTo(0.8, 10);
    expect(summary.histogram).toEqual([8, 12, 10]);
  });
});