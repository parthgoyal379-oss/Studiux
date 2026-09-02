import { describe, expect, it } from 'vitest';
import { evaluateNotifications } from './notificationEngine.js';

describe('Notification engine', () => {
  it('generates notification for due revisions', () => {
    const now = +new Date('2026-09-02T10:00:00Z');
    const state = {
      profile: { resetHour: 4, timezone: 'UTC' },
      revisionItems: [{ id: 'r1', status: 'DUE', dueAt: now - 3600000 }],
      notifications: []
    };
    const notifications = evaluateNotifications(state, now);
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('REVISION');
    expect(notifications[0].title).toContain('1 revision');
  });

  it('generates notification for upcoming exams', () => {
    const now = +new Date('2026-09-02T10:00:00Z');
    const state = {
      profile: { resetHour: 4, timezone: 'UTC' },
      exams: [{ id: 'e1', name: 'JEE Advanced', startsAt: now + 3 * 86400000 }],
      notifications: []
    };
    const notifications = evaluateNotifications(state, now);
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('EXAM');
    expect(notifications[0].title).toContain('3 days');
  });

  it('does not duplicate existing notifications with same dedupKey', () => {
    const now = +new Date('2026-09-02T10:00:00Z');
    const state = {
      profile: { resetHour: 4, timezone: 'UTC' },
      exams: [{ id: 'e1', name: 'JEE Advanced', startsAt: now + 3 * 86400000 }],
      notifications: []
    };
    const first = evaluateNotifications(state, now);
    const second = evaluateNotifications({ ...state, notifications: first }, now);
    expect(second.length).toBe(1);
  });
});