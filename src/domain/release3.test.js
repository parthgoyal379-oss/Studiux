import { describe, expect, it } from 'vitest';
import { examReadiness, mistakeSummary, planActual, revisionBuckets, subjectAllocation } from './release3.js';

describe('Release 3 deterministic intelligence', () => {
  it('allocates recorded time by subject without fake values', () => {
    expect(subjectAllocation([{ subjectId: 'p', duration: 120000 }], [{ id: 'p', name: 'Physics' }])[0].share).toBe(1);
  });
  it('compares planned tasks with derived actual session time', () => {
    expect(planActual([{ estimate: 60, done: true }, { estimate: 30, done: false }], [{ duration: 30 * 60000 }])).toMatchObject({ plannedMinutes: 90, completedTasks: 1, actualMs: 1800000 });
  });
  it('explains readiness inputs and bounds the score', () => {
    expect(examReadiness({ syllabusCoverage: 1, revisionCoverage: .5, practiceRate: 0, consistency: .5 })).toMatchObject({ score: 50, inputs: [1, .5, 0, .5] });
  });
  it('groups revision items by deterministic due buckets', () => {
    const now = Date.parse('2026-09-02T12:00:00Z');
    expect(revisionBuckets([{ id: 'a', dueAt: now - 1 }, { id: 'b', dueAt: now + 86400000 }], now).overdue).toHaveLength(1);
  });
  it('counts mistakes by taxonomy', () => {
    expect(mistakeSummary([{ type: 'Calculation' }, { type: 'Calculation' }, { type: 'Misread' }])).toEqual({ Calculation: 2, Misread: 1 });
  });
});
