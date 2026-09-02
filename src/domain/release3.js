/** Deterministic, explainable product intelligence used by Progress, Revision and Exams. */
export function subjectAllocation(sessions = [], subjects = []) {
  const total = sessions.reduce((sum, row) => sum + Math.max(0, row.duration || 0), 0);
  return subjects.map(subject => {
    const duration = sessions.filter(row => row.subjectId === subject.id).reduce((sum, row) => sum + Math.max(0, row.duration || 0), 0);
    return { id: subject.id, name: subject.name, duration, share: total ? duration / total : 0 };
  });
}

export function planActual(tasks = [], sessions = []) {
  const plannedMinutes = tasks.reduce((sum, task) => sum + Math.max(0, Number(task.estimate || task.estimatedMinutes || 0)), 0);
  const completedTasks = tasks.filter(task => task.done || task.status === 'DONE' || task.status === 'COMPLETED').length;
  const actualMs = sessions.reduce((sum, session) => sum + Math.max(0, session.duration || 0), 0);
  return { plannedMinutes, completedTasks, totalTasks: tasks.length, actualMs, executionRate: tasks.length ? completedTasks / tasks.length : null, estimationAccuracy: plannedMinutes ? actualMs / (plannedMinutes * 60000) : null };
}

export function examReadiness({ syllabusCoverage = 0, revisionCoverage = 0, practiceRate = 0, mockScore = null, consistency = 0 } = {}) {
  const parts = [Math.max(0, Math.min(1, syllabusCoverage)), Math.max(0, Math.min(1, revisionCoverage)), Math.max(0, Math.min(1, practiceRate)), mockScore == null ? null : Math.max(0, Math.min(1, mockScore)), Math.max(0, Math.min(1, consistency))].filter(value => value != null);
  if (!parts.length) return { score: null, inputs: [], explanation: 'Add syllabus, revision or practice records to estimate readiness.' };
  const score = Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length * 100);
  return { score, inputs: parts, explanation: 'Based on recorded syllabus coverage, revision, practice, mock performance and consistency.' };
}

export function revisionBuckets(items = [], now = Date.now()) {
  return items.reduce((result, item) => { const due = Number(item.dueAt || 0); const bucket = due < now ? 'overdue' : new Date(due).toDateString() === new Date(now).toDateString() ? 'today' : 'upcoming'; result[bucket].push(item); return result; }, { overdue: [], today: [], upcoming: [] });
}

export function mistakeSummary(mistakes = []) {
  return mistakes.reduce((result, mistake) => { const key = mistake.type || 'Other'; result[key] = (result[key] || 0) + 1; return result; }, {});
}
