import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { aggregate, DAY, formatDuration, studyDayKey, uid } from '../lib.js';
import { nextRecurrenceDue } from '../domain/recurrence.js';
import * as I from '../icons.jsx';

const endOfDay = now => {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return +d;
};

const startOfDay = now => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return +d;
};

export default function TodayExperience({ go }) {
  const { state, patch, addTask } = useStore();
  const [quickTitle, setQuickTitle] = useState('');
  const now = Date.now();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const key = studyDayKey(new Date(now), state.profile.resetHour, state.profile.timezone);
  const recorded = aggregate(state.sessions, key, {
    resetHour: state.profile.resetHour,
    timeZone: state.profile.timezone
  }).duration;

  const plannedEventsMs = state.plannerEvents
    .filter(row => row.startsAt <= todayEnd && row.endsAt >= todayStart)
    .reduce((sum, row) => sum + Math.max(0, row.endsAt - row.startsAt), 0);

  const plannedTasksMs = state.tasks
    .filter(t => {
      if (t.done) return false;
      const tDate = t.scheduledAt || t.dueAt;
      return tDate && tDate >= todayStart && tDate <= todayEnd;
    })
    .reduce((sum, t) => sum + (t.estimate || 30) * 60000, 0);

  const planned = plannedEventsMs + plannedTasksMs;

  const open = state.tasks.filter(row => !row.done);
  const dueRevision = state.revisionItems
    .filter(row => row.status !== 'COMPLETED' && Number(row.dueAt) <= todayEnd)
    .sort((a, b) => a.dueAt - b.dueAt);
  const done = state.tasks
    .filter(row => row.done && Number(row.completedAt) >= todayStart)
    .slice(0, 8);

  const buckets = useMemo(() => {
    const sorted = [...open].sort((a, b) => {
      const priority = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (
        (priority[a.priority] ?? 1) - (priority[b.priority] ?? 1) ||
        (a.dueAt || Infinity) - (b.dueAt || Infinity)
      );
    });
    return {
      NOW: sorted.slice(0, 1),
      NEXT: sorted.slice(1, 4),
      LATER: sorted.slice(4)
    };
  }, [open]);

  function complete(id) {
    patch(s => {
      const targetTask = s.tasks.find(t => t.id === id);
      let newTasks = s.tasks.map(row =>
        row.id === id ? { ...row, done: true, status: 'DONE', completedAt: Date.now() } : row
      );
      if (targetTask?.recurrence) {
        const nextDue = nextRecurrenceDue(targetTask.recurrence, targetTask.dueAt || Date.now());
        newTasks = [
          {
            ...targetTask,
            id: uid(),
            done: false,
            status: 'OPEN',
            dueAt: nextDue,
            completedAt: null
          },
          ...newTasks
        ];
      }
      return { ...s, tasks: newTasks };
    });
  }

  function handleQuickAdd(e) {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask({
      title: quickTitle.trim(),
      subjectId: state.subjects[0]?.id || null,
      subject: state.subjects[0]?.name || '',
      estimate: 30,
      priority: 'MEDIUM',
      status: 'OPEN',
      dueAt: todayEnd,
      recurrence: null
    });
    setQuickTitle('');
  }

  function focus(task) {
    patch({
      focusDraft: {
        subjectId: task.subjectId || state.subjects[0]?.id || '',
        chapterId: task.chapterId || '',
        taskId: task.id,
        intention: task.title
      }
    });
    go?.('Focus');
  }

  function carry(id) {
    patch(s => ({
      ...s,
      tasks: s.tasks.map(row =>
        row.id === id ? { ...row, dueAt: (row.dueAt || Date.now()) + DAY, status: 'PLANNED' } : row
      )
    }));
  }

  const renderTaskRows = rows =>
    rows.map(task => {
      const subject = state.subjects.find(row => row.id === task.subjectId);
      return (
        <div className="task-row" key={task.id}>
          <button
            className="checkbox"
            aria-label="Complete task"
            onClick={() => complete(task.id)}
          />
          <button className="task-copy task-open" onClick={() => focus(task)}>
            <b>{task.title}</b>
            <small>
              {subject?.name || 'Unsorted'} · {task.estimate || 30}m
              {task.dueAt ? ` · Due ${new Date(task.dueAt).toLocaleDateString()}` : ''}
            </small>
          </button>
          <button
            className="icon-button"
            title="Carry one day"
            onClick={() => carry(task.id)}
            style={{ fontSize: 11, fontWeight: 700 }}
          >
            +1d
          </button>
          <button
            className="icon-button"
            aria-label="Start focus"
            onClick={() => focus(task)}
          >
            <I.Play />
          </button>
        </div>
      );
    });


  const nowTask = buckets.NOW[0];
  const nowSubject = state.subjects.find(row => row.id === nowTask?.subjectId);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">COMMAND CENTER</span>
          <h1>Today's Execution</h1>
          <p>Prioritized focus blocks. Execute what is right in front of you.</p>
        </div>
        <button className="primary" onClick={() => go?.('Focus')}>
          <I.Play />
          <span>Start Focus</span>
        </button>
      </div>

      <form className="quick-add" onSubmit={handleQuickAdd} style={{ marginBottom: 16 }}>
        <I.Plus style={{ color: 'var(--accent)' }} />
        <input
          maxLength="200"
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          placeholder="Add a task for today and press Enter…"
        />
        <kbd>↵ Enter</kbd>
      </form>

      <div className="today-summary">

        <div className="metric">
          <span>DAILY TARGET</span>
          <b>{formatDuration((state.profile.targetMinutes || 360) * 60000)}</b>
        </div>
        <div className="metric">
          <span>RECORDED FOCUS</span>
          <b>{formatDuration(recorded)}</b>
        </div>
        <div className="metric">
          <span>PLANNED STUDY</span>
          <b>{formatDuration(planned)}</b>
        </div>
        <div className="metric">
          <span>REMAINING</span>
          <b>
            {formatDuration(
              Math.max(0, (state.profile.targetMinutes || 360) * 60000 - recorded)
            )}
          </b>
        </div>
      </div>

      <div className="today-board">
        {/* NOW Priority Lane */}
        <section className="today-lane" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="panel-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="eyebrow"
                style={{
                  color: 'var(--accent-light)',
                  fontWeight: 800,
                  fontSize: 12
                }}
              >
                NOW — PRIMARY FOCUS
              </span>
            </div>
            <span>{buckets.NOW.length} item</span>
          </div>
          {nowTask ? (
            <div
              className="task-row"
              style={{
                padding: '16px 8px',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <button
                className="checkbox"
                aria-label="Complete task"
                onClick={() => complete(nowTask.id)}
              />
              <button className="task-copy task-open" onClick={() => focus(nowTask)}>
                <b style={{ fontSize: 15 }}>{nowTask.title}</b>
                <small>
                  {nowSubject?.name || 'Unsorted'} · {nowTask.estimate || 45}m planned
                  {nowTask.dueAt ? ` · Due ${new Date(nowTask.dueAt).toLocaleDateString()}` : ''}
                </small>
              </button>
              <button
                className="primary"
                onClick={() => focus(nowTask)}
                style={{ padding: '8px 14px', fontSize: 12 }}
              >
                <I.Play /> Focus Now
              </button>
            </div>
          ) : (
            <p className="muted" style={{ margin: '8px 0' }}>
              No immediate priority set. Add or select a task to focus on now.
            </p>
          )}
        </section>

        {/* NEXT Priority Lane */}
        <section className="today-lane">
          <div className="panel-title">
            <h3>NEXT</h3>
            <span>{buckets.NEXT.length}</span>
          </div>
          {buckets.NEXT.length ? (
            renderTaskRows(buckets.NEXT)
          ) : (
            <p className="muted">No secondary tasks scheduled.</p>
          )}
        </section>

        {/* LATER Priority Lane */}
        {buckets.LATER.length > 0 && (
          <section className="today-lane">
            <div className="panel-title">
              <h3>LATER</h3>
              <span>{buckets.LATER.length}</span>
            </div>
            {renderTaskRows(buckets.LATER)}
          </section>
        )}

        {/* REVISION DUE Lane */}
        <section className="today-lane revision-lane">
          <div className="panel-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <I.RotateCcw style={{ width: 14, height: 14, color: 'var(--amber)' }} />
              <h3>REVISION DUE</h3>
            </div>
            <span>{dueRevision.length}</span>
          </div>
          {dueRevision.length ? (
            dueRevision.map(item => {
              const topic = state.topics.find(row => row.id === item.topicId);
              const chapter = state.chapters.find(
                row => row.id === (item.chapterId || topic?.chapterId)
              );
              return (
                <div className="task-row" key={item.id}>
                  <span className="revision-index">R{(item.intervalIndex || 0) + 1}</span>
                  <button
                    className="task-copy task-open"
                    onClick={() => {
                      patch({
                        focusDraft: {
                          subjectId: chapter?.subjectId || '',
                          chapterId: chapter?.id || '',
                          mode: 'COUNTDOWN',
                          minutes: item.estimatedMinutes || 20,
                          intention: `Revise ${topic?.name || chapter?.name || 'topic'}`
                        }
                      });
                      go?.('Focus');
                    }}
                  >
                    <b>{topic?.name || chapter?.name || 'Revision item'}</b>
                    <small>
                      {chapter?.name || 'Topic'} · {item.estimatedMinutes || 20}m
                    </small>
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Start revision focus"
                    onClick={() => {
                      patch({
                        focusDraft: {
                          subjectId: chapter?.subjectId || '',
                          chapterId: chapter?.id || '',
                          mode: 'COUNTDOWN',
                          minutes: item.estimatedMinutes || 20,
                          intention: `Revise ${topic?.name || chapter?.name || 'topic'}`
                        }
                      });
                      go?.('Focus');
                    }}
                  >
                    <I.Play />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="muted">All revisions up to date for today.</p>
          )}
        </section>

        {/* DONE Lane */}
        <section className="today-lane">
          <div className="panel-title">
            <h3>COMPLETED TODAY</h3>
            <span>{done.length}</span>
          </div>
          {done.length ? (
            done.map(task => (
              <div className="task-row done" key={task.id}>
                <button
                  className="checkbox"
                  onClick={() =>
                    patch(s => ({
                      ...s,
                      tasks: s.tasks.map(row =>
                        row.id === task.id
                          ? { ...row, done: false, status: 'OPEN', completedAt: null }
                          : row
                      )
                    }))
                  }
                >
                  <I.Check />
                </button>
                <div className="task-copy">
                  <b>{task.title}</b>
                  <small>Completed today</small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">Completed tasks will appear here.</p>
          )}
        </section>
      </div>
    </>
  );
}
