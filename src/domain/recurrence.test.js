import { describe, expect, it } from 'vitest';
import { nextRecurrenceDue, validateRecurrence } from './recurrence.js';

describe('Recurrence calculations', () => {
  it('validates recurrence rules', () => {
    expect(validateRecurrence({ type: 'daily' })).toEqual({ type: 'daily' });
    expect(() => validateRecurrence({ type: 'invalid' })).toThrow();
  });

  it('calculates daily recurrence', () => {
    const monday = new Date('2026-09-07T10:00:00Z');
    const next = nextRecurrenceDue({ type: 'daily' }, +monday);
    expect(new Date(next).getUTCDate()).toBe(8);
  });

  it('skips weekend for weekday recurrence', () => {
    const friday = new Date('2026-09-11T10:00:00Z');
    const next = nextRecurrenceDue({ type: 'weekdays' }, +friday);
    const nextDate = new Date(next);
    expect(nextDate.getUTCDay()).toBe(1); // Monday
  });

  it('calculates weekly recurrence on anchor day', () => {
    const wednesday = new Date('2026-09-09T10:00:00Z');
    const next = nextRecurrenceDue({ type: 'weekly', anchor: +wednesday }, +wednesday);
    const nextDate = new Date(next);
    expect(nextDate.getUTCDay()).toBe(3); // Next Wednesday
  });
});