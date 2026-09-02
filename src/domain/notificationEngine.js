import { DAY, studyDayKey, uid } from '../lib.js';

export function evaluateNotifications(state, now = Date.now()) {
  const existing = state.notifications || [];
  const generated = [];
  const todayKey = studyDayKey(new Date(now), state.profile?.resetHour || 4, state.profile?.timezone);

  // 1. Revision notifications
  const dueRevisions = (state.revisionItems || []).filter(item => 
    item.status !== 'COMPLETED' && Number(item.dueAt) <= now + 12 * 3600000
  );
  if (dueRevisions.length > 0) {
    const revKey = `revision-due-${todayKey}`;
    const alreadyExists = existing.some(n => n.data?.dedupKey === revKey);
    if (!alreadyExists) {
      generated.push({
        id: uid(),
        type: 'REVISION',
        title: `${dueRevisions.length} revision${dueRevisions.length > 1 ? 's' : ''} due today`,
        body: 'Strengthen weak recall before it slips. Keep your revision streak active.',
        data: { page: 'Revision', dedupKey: revKey },
        readAt: null,
        createdAt: now
      });
    }
  }

  // 2. Upcoming Exams (within 7 days)
  (state.exams || []).forEach(exam => {
    const startsAt = Number(exam.startsAt);
    const diff = startsAt - now;
    if (diff > 0 && diff <= 7 * DAY) {
      const daysLeft = Math.ceil(diff / DAY);
      const examKey = `exam-approaching-${exam.id}-${daysLeft}d`;
      const alreadyExists = existing.some(n => n.data?.dedupKey === examKey);
      if (!alreadyExists) {
        generated.push({
          id: uid(),
          type: 'EXAM',
          title: `${exam.name} in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          body: `Target: ${exam.target || 'Prepare thoroughly'}. Check your syllabus coverage and mock scores.`,
          data: { page: 'Exams', examId: exam.id, dedupKey: examKey },
          readAt: null,
          createdAt: now
        });
      }
    }
  });

  // 3. Daily Target Reached
  const targetMs = (Number(state.profile?.targetMinutes) || 0) * 60000;
  if (targetMs > 0) {
    const todayRecorded = (state.sessions || [])
      .filter(s => studyDayKey(new Date(s.endedAt || s.startedAt), state.profile?.resetHour || 4, state.profile?.timezone) === todayKey)
      .reduce((sum, s) => sum + Math.max(0, s.duration || 0), 0);
    
    if (todayRecorded >= targetMs) {
      const targetKey = `target-reached-${todayKey}`;
      const alreadyExists = existing.some(n => n.data?.dedupKey === targetKey);
      if (!alreadyExists) {
        generated.push({
          id: uid(),
          type: 'TARGET',
          title: 'Daily study target achieved! 🎯',
          body: `You completed ${Math.round(targetMs / 60000)} minutes of focused work today.`,
          data: { page: 'Progress', dedupKey: targetKey },
          readAt: null,
          createdAt: now
        });
      }
    }
  }

  return generated.length ? [...generated, ...existing] : existing;
}