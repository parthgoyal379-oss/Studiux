import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { formatDuration, uid } from '../lib.js';
import { taskActualMs, taskProgress } from '../domain/product.js';
import { nextRecurrenceDue } from '../domain/recurrence.js';
import * as I from '../icons.jsx';

const dateValue = value => (value ? new Date(value).toISOString().slice(0, 10) : '');

export default function TasksExperience({ go }) {
  const { state, patch, addTask } = useStore();
  const [filter, setFilter] = useState('OPEN');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('DUE');
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState('');

  const rows = useMemo(() => {
    return state.tasks
      .filter(task => (filter === 'DONE' ? task.done : filter === 'ALL' ? true : !task.done))
      .filter(task => task.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'PRIORITY') {
          const map = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return (map[a.priority] ?? 1) - (map[b.priority] ?? 1);
        }
        if (sortBy === 'ESTIMATE') {
          return (b.estimate || 0) - (a.estimate || 0);
        }
        if (sortBy === 'TITLE') {
          return a.title.localeCompare(b.title);
        }
        return (a.dueAt || a.scheduledAt || Infinity) - (b.dueAt || b.scheduledAt || Infinity);
      });
  }, [state.tasks, filter, query, sortBy]);

  const task = state.tasks.find(row => row.id === selected);
  const subtasks = task ? state.subtasks.filter(row => row.taskId === task.id) : [];

  function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      subjectId: null,
      subject: '',
      estimate: 45,
      priority: 'MEDIUM',
      status: 'OPEN',
      recurrence: null
    });
    setTitle('');
  }

  function toggleComplete(item) {
    patch(s => {
      const isCompleting = !item.done;
      let newTasks = s.tasks.map(t =>
        t.id === item.id
          ? {
              ...t,
              done: isCompleting,
              status: isCompleting ? 'DONE' : 'OPEN',
              completedAt: isCompleting ? Date.now() : null
            }
          : t
      );

      // If completing a recurring task, schedule the next occurrence
      if (isCompleting && item.recurrence) {
        const nextDue = nextRecurrenceDue(item.recurrence, item.dueAt || Date.now());
        const nextTask = {
          ...item,
          id: uid(),
          done: false,
          status: 'OPEN',
          dueAt: nextDue,
          scheduledAt: item.scheduledAt ? nextRecurrenceDue(item.recurrence, item.scheduledAt) : null,
          completedAt: null
        };
        newTasks = [nextTask, ...newTasks];
      }

      return { ...s, tasks: newTasks };
    });
  }

  function update(values) {
    patch(s => ({
      ...s,
      tasks: s.tasks.map(row => (row.id === task.id ? { ...row, ...values } : row))
    }));
  }

  function archive() {
    patch(s => ({
      ...s,
      tasks: s.tasks.filter(row => row.id !== task.id),
      subtasks: s.subtasks.filter(row => row.taskId !== task.id)
    }));
    setSelected(null);
  }

  function deleteSubtask(subtaskId) {
    patch(s => ({
      ...s,
      subtasks: s.subtasks.filter(row => row.id !== subtaskId)
    }));
  }

  function focus(item) {
    patch({
      focusDraft: {
        subjectId: item.subjectId || state.subjects[0]?.id || '',
        chapterId: item.chapterId || '',
        taskId: item.id,
        intention: item.title
      }
    });
    go?.('Focus');
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">TASK REGISTRY</span>
          <h1>Clear work, not a longer list.</h1>
          <p>Organize actionable study tasks with realistic duration estimates.</p>
        </div>
        <button className="primary" onClick={() => go?.('Focus')}>
          <I.Play />
          <span>Start Focus</span>
        </button>
      </div>

      <form className="quick-add" onSubmit={add}>
        <I.Plus style={{ color: 'var(--accent)' }} />
        <input
          maxLength="200"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a new task and press Enter…"
        />
        <kbd>↵ Enter</kbd>
      </form>

      <div className="task-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="segmented">
            {['OPEN', 'DONE', 'ALL'].map(value => (
              <button
                key={value}
                className={filter === value ? 'active' : ''}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}
          >
            <option value="DUE">Sort: Due Date</option>
            <option value="PRIORITY">Sort: Priority</option>
            <option value="ESTIMATE">Sort: Estimate</option>
            <option value="TITLE">Sort: Title</option>
          </select>
        </div>
        <label className="task-search">
          <I.Search style={{ width: 15, height: 15, color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks…"
          />
        </label>
      </div>

      <div className="task-layout">
        <section className="panel task-list">
          <div className="panel-title">
            <h3>{filter.toLowerCase()} TASKS</h3>
            <span>{rows.length} total</span>
          </div>
          {rows.length ? (
            rows.map(row => {
              const actual = taskActualMs(row.id, state.sessions);
              const subject = state.subjects.find(s => s.id === row.subjectId);
              const priorityClass =
                row.priority === 'HIGH'
                  ? 'var(--rose)'
                  : row.priority === 'LOW'
                  ? 'var(--emerald)'
                  : 'var(--amber)';

              return (
                <div
                  className={`task-row ${row.done ? 'done' : ''}`}
                  key={row.id}
                  style={{
                    background: selected === row.id ? 'var(--surface-hover)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 8px'
                  }}
                >
                  <button
                    className="checkbox"
                    aria-label={row.done ? 'Reopen task' : 'Complete task'}
                    onClick={() => toggleComplete(row)}
                  >
                    {row.done && <I.Check />}
                  </button>
                  <button className="task-copy task-open" onClick={() => setSelected(row.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: priorityClass
                        }}
                      />
                      <b>{row.title}</b>
                      {row.recurrence && (
                        <span style={{ fontSize: 11, background: 'var(--accent-subtle)', color: 'var(--accent-light)', padding: '1px 6px', borderRadius: 4 }}>
                          ↻ {row.recurrence.type}
                        </span>
                      )}
                    </div>
                    <small>
                      {subject?.name || 'Unsorted'} · {row.estimate || 0}m planned ·{' '}
                      {formatDuration(actual)} actual focus
                    </small>
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Start focus"
                    onClick={() => focus(row)}
                  >
                    <I.Play />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty">
              <h3>Nothing here</h3>
              <p>Add only study blocks that deserve dedicated focus.</p>
            </div>
          )}
        </section>


        {task && (
          <aside className="task-detail">
            <div className="panel-title">
              <span className="eyebrow">TASK DETAILS</span>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <I.X />
              </button>
            </div>

            <label>
              Title
              <input value={task.title} onChange={e => update({ title: e.target.value })} />
            </label>

            <div className="form-row">
              <label>
                Subject
                <select
                  value={task.subjectId || ''}
                  onChange={e =>
                    update({
                      subjectId: e.target.value || null,
                      subject:
                        state.subjects.find(row => row.id === e.target.value)?.name || ''
                    })
                  }
                >
                  <option value="">Unsorted</option>
                  {state.subjects.map(row => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  value={task.priority || 'MEDIUM'}
                  onChange={e => update({ priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Estimate (minutes)
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={task.estimate || 0}
                  onChange={e => update({ estimate: Number(e.target.value) || 0 })}
                />
              </label>
              <label>
                Planned study date
                <input
                  type="date"
                  value={dateValue(task.scheduledAt)}
                  onChange={e =>
                    update({
                      scheduledAt: e.target.value ? +new Date(`${e.target.value}T09:00:00`) : null
                    })
                  }
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Due date
                <input
                  type="date"
                  value={dateValue(task.dueAt)}
                  onChange={e =>
                    update({
                      dueAt: e.target.value ? +new Date(`${e.target.value}T23:59:59`) : null
                    })
                  }
                />
              </label>
              <label>
                Repeat schedule
                <select
                  value={task.recurrence?.type || ''}
                  onChange={e =>
                    update({
                      recurrence: e.target.value
                        ? { type: e.target.value, anchor: task.dueAt || Date.now() }
                        : null
                    })
                  }
                >
                  <option value="">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
            </div>

            <label>
              Notes
              <textarea
                maxLength="2000"
                value={task.notes || ''}
                onChange={e => update({ notes: e.target.value })}
                placeholder="Key formulas, sub-problems, or specific targets…"
              />
            </label>

            <div className="task-derived">
              <span>
                Actual Focus: <b>{formatDuration(taskActualMs(task.id, state.sessions))}</b>
              </span>
              <span>
                Subtasks:{' '}
                <b>{Math.round(taskProgress(task, state.subtasks) * 100)}%</b>
              </span>
            </div>

            <div className="subtask-list">
              <h4>Subtasks & Checklist</h4>
              {subtasks.map(row => (
                <div className="toggle-row" key={row.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={Boolean(row.completed)}
                      onChange={() =>
                        patch(s => ({
                          ...s,
                          subtasks: s.subtasks.map(item =>
                            item.id === row.id ? { ...item, completed: !item.completed } : item
                          )
                        }))
                      }
                    />
                    <span style={{ textDecoration: row.completed ? 'line-through' : 'none', color: row.completed ? 'var(--text-muted)' : 'var(--text)' }}>
                      {row.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Delete subtask"
                    onClick={() => deleteSubtask(row.id)}
                    style={{ padding: 4, width: 24, height: 24, minWidth: 24, color: 'var(--text-muted)' }}
                  >
                    <I.X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ))}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('subtask');
                  if (!input.value.trim()) return;
                  patch(s => ({
                    ...s,
                    subtasks: [
                      ...s.subtasks,
                      {
                        id: uid(),
                        taskId: task.id,
                        title: input.value.trim(),
                        completed: false
                      }
                    ]
                  }));
                  input.value = '';
                }}
              >
                <input name="subtask" placeholder="Add a subtask…" />
                <button className="primary" style={{ padding: '8px 14px' }}>
                  Add
                </button>
              </form>
            </div>


            <div className="dialog-actions">
              <button
                className="danger-text"
                onClick={archive}
                style={{ color: 'var(--rose)', fontWeight: 600 }}
              >
                Archive task
              </button>
              <button className="primary" onClick={() => focus(task)}>
                <I.Play /> Start Focus
              </button>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
