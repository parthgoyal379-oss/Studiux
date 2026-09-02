import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { DAY, formatDuration, uid } from '../lib.js';
import { planActualForRange } from '../domain/product.js';
import * as I from '../icons.jsx';

const startOfDay = value => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return +d;
};

export default function PlannerExperience({ go }) {
  const { state, patch } = useStore();
  const [view, setView] = useState('DAY');
  const [cursor, setCursor] = useState(startOfDay(Date.now()));
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('17:00');
  const [duration, setDuration] = useState(45);
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id || '');
  const [editingEvent, setEditingEvent] = useState(null);

  const span = view === 'DAY' ? DAY : view === 'WEEK' ? 7 * DAY : 31 * DAY;
  const start = view === 'WEEK' ? cursor - new Date(cursor).getDay() * DAY : cursor;
  const end = start + span;

  const events = useMemo(
    () =>
      state.plannerEvents
        .filter(row => row.startsAt >= start && row.startsAt < end)
        .sort((a, b) => a.startsAt - b.startsAt),
    [state.plannerEvents, start, end]
  );

  const dayTasks = useMemo(() => {
    if (view !== 'DAY') return [];
    return state.tasks.filter(t => {
      const taskDate = t.scheduledAt || t.dueAt;
      return taskDate && taskDate >= cursor && taskDate < cursor + DAY;
    });
  }, [state.tasks, view, cursor]);

  const dayRevisions = useMemo(() => {
    if (view !== 'DAY') return [];
    return state.revisionItems.filter(r => {
      return r.status !== 'COMPLETED' && r.dueAt && r.dueAt >= cursor && r.dueAt < cursor + DAY;
    });
  }, [state.revisionItems, view, cursor]);

  const actual = planActualForRange({
    tasks: state.tasks,
    events: state.plannerEvents,
    sessions: state.sessions,
    start,
    end
  });

  function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const startsAt = +new Date(`${date}T${time}`);
    const endsAt = startsAt + Math.max(5, duration) * 60000;
    patch(s => ({
      ...s,
      plannerEvents: [
        ...s.plannerEvents,
        {
          id: uid(),
          title: title.trim(),
          type: 'STUDY',
          startsAt,
          endsAt,
          subjectId: subjectId || null
        }
      ]
    }));
    setTitle('');
  }

  function deleteEvent(id) {
    patch(s => ({
      ...s,
      plannerEvents: s.plannerEvents.filter(row => row.id !== id)
    }));
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editingEvent) return;
    patch(s => ({
      ...s,
      plannerEvents: s.plannerEvents.map(row => (row.id === editingEvent.id ? editingEvent : row))
    }));
    setEditingEvent(null);
  }

  function move(days) {
    setCursor(value => value + days * DAY);
  }

  // Days matrix for MONTH view
  const monthDays = useMemo(() => {
    if (view !== 'MONTH') return [];
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = start + i * DAY;
      const dayEvents = state.plannerEvents.filter(e => e.startsAt >= d && e.startsAt < d + DAY);
      days.push({ timestamp: d, events: dayEvents });
    }
    return days;
  }, [view, start, state.plannerEvents]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">STUDY PLANNER</span>
          <h1>Plan the work you can execute.</h1>
          <p>Schedule high-leverage study sessions and track adherence against reality.</p>
        </div>
        <div className="range-switch">
          <button
            onClick={() => move(view === 'DAY' ? -1 : view === 'WEEK' ? -7 : -30)}
            aria-label="Previous period"
          >
            ←
          </button>
          <button onClick={() => setCursor(startOfDay(Date.now()))}>Today</button>
          <button
            onClick={() => move(view === 'DAY' ? 1 : view === 'WEEK' ? 7 : 30)}
            aria-label="Next period"
          >
            →
          </button>
        </div>
      </div>

      <div className="segmented">
        {['DAY', 'WEEK', 'MONTH'].map(value => (
          <button
            key={value}
            className={view === value ? 'active' : ''}
            onClick={() => setView(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="today-summary">
        <div className="metric">
          <span>PLANNED STUDY</span>
          <b>{formatDuration(actual.plannedMinutes * 60000)}</b>
        </div>
        <div className="metric">
          <span>ACTUAL RECORDED</span>
          <b>{formatDuration(actual.actualMs)}</b>
        </div>
        <div className="metric">
          <span>EXECUTION ADHERENCE</span>
          <b>
            {actual.adherence == null ? '—' : `${Math.round(actual.adherence * 100)}%`}
          </b>
        </div>
        <div className="metric">
          <span>TASKS COMPLETED</span>
          <b>
            {actual.completedTasks} / {actual.plannedTasks}
          </b>
        </div>
      </div>

      {view === 'MONTH' ? (
        <section className="panel planner">
          <div className="panel-title">
            <div>
              <span className="eyebrow">MONTH CALENDAR</span>
              <h3>
                {new Date(start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <span>{events.length} total blocks</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginTop: 12 }}>
            {monthDays.map(item => {
              const dateObj = new Date(item.timestamp);
              const isToday = startOfDay(Date.now()) === item.timestamp;
              return (
                <button
                  key={item.timestamp}
                  type="button"
                  onClick={() => {
                    setCursor(item.timestamp);
                    setView('DAY');
                  }}
                  style={{
                    background: isToday ? 'var(--surface-active)' : 'var(--surface-hover)',
                    border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 10,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <b style={{ fontSize: 13, color: isToday ? 'var(--accent-light)' : 'var(--text)' }}>
                      {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </b>
                    <small style={{ color: 'var(--text-muted)' }}>{dateObj.toLocaleDateString(undefined, { weekday: 'narrow' })}</small>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {item.events.slice(0, 2).map(e => (
                      <span key={e.id} style={{ fontSize: 11, background: 'var(--surface-glass)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.title}
                      </span>
                    ))}
                    {item.events.length > 2 && (
                      <small style={{ color: 'var(--accent-light)', fontSize: 10 }}>+{item.events.length - 2} more</small>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="panel planner">
          <div className="panel-title">
            <div>
              <span className="eyebrow">{view} VIEW</span>
              <h3>
                {new Date(start).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>
            <span>{events.length} scheduled blocks</span>
          </div>

          {events.length ? (
            events.map(event => {
              const subject = state.subjects.find(row => row.id === event.subjectId);
              return (
                <div
                  className="event-row"
                  key={event.id}
                  style={{
                    borderLeft: `3px solid ${subject?.color || 'var(--border-strong)'}`,
                    paddingLeft: 12,
                    borderRadius: 'var(--radius-xs)',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <time>
                    {new Date(event.startsAt).toLocaleString([], {
                      weekday: view === 'DAY' ? undefined : 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                  <div style={{ flex: 1 }}>
                    <b>{event.title}</b>
                    <small style={{ display: 'block', color: 'var(--text-secondary)' }}>
                      {formatDuration(event.endsAt - event.startsAt)} ·{' '}
                      {subject?.name || 'Study Block'}
                    </small>
                  </div>
                  <button
                    className="primary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => {
                      patch({
                        focusDraft: {
                          subjectId: event.subjectId || '',
                          chapterId: '',
                          intention: event.title
                        }
                      });
                      go?.('Focus');
                    }}
                  >
                    <I.Play /> Focus
                  </button>
                  <button
                    className="icon-button"
                    title="Edit block"
                    onClick={() => setEditingEvent(event)}
                    style={{ padding: 6 }}
                  >
                    <I.SlidersHorizontal style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Move to tomorrow"
                    title="Shift to tomorrow"
                    onClick={() =>
                      patch(s => ({
                        ...s,
                        plannerEvents: s.plannerEvents.map(row =>
                          row.id === event.id
                            ? { ...row, startsAt: row.startsAt + DAY, endsAt: row.endsAt + DAY }
                            : row
                        )
                      }))
                    }
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    +1d
                  </button>
                  <button
                    className="icon-button"
                    title="Delete block"
                    onClick={() => deleteEvent(event.id)}
                    style={{ padding: 6, color: 'var(--rose)' }}
                  >
                    <I.X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty">
              <h3>No study blocks scheduled</h3>
              <p>Add the next realistic study block below to guide your focus.</p>
            </div>
          )}

          {view === 'DAY' && (dayTasks.length > 0 || dayRevisions.length > 0) && (
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>INTEGRATED DAY TARGETS</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {dayTasks.map(t => (
                  <span key={t.id} style={{ fontSize: 12, background: 'var(--surface-hover)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <I.CheckSquare style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                    <b>{t.title}</b> ({t.estimate || 30}m)
                  </span>
                ))}
                {dayRevisions.map(r => {
                  const topic = state.topics.find(top => top.id === r.topicId);
                  return (
                    <span key={r.id} style={{ fontSize: 12, background: 'var(--surface-hover)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <I.RotateCcw style={{ width: 13, height: 13, color: 'var(--amber)' }} />
                      <b>Revise: {topic?.name || 'Topic'}</b>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {editingEvent && (
        <div className="overlay">
          <form className="import-dialog" role="dialog" aria-modal="true" onSubmit={saveEdit}>
            <span className="eyebrow">EDIT STUDY BLOCK</span>
            <h2>Update scheduled block</h2>
            <label>
              Title
              <input
                value={editingEvent.title}
                onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Subject
                <select
                  value={editingEvent.subjectId || ''}
                  onChange={e => setEditingEvent({ ...editingEvent, subjectId: e.target.value || null })}
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
                Duration (minutes)
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={Math.round((editingEvent.endsAt - editingEvent.startsAt) / 60000)}
                  onChange={e =>
                    setEditingEvent({
                      ...editingEvent,
                      endsAt: editingEvent.startsAt + Math.max(5, Number(e.target.value)) * 60000
                    })
                  }
                />
              </label>
            </div>
            <div className="dialog-actions">
              <button type="button" onClick={() => setEditingEvent(null)}>
                Cancel
              </button>
              <button className="primary">Save changes</button>
            </div>
          </form>
        </div>
      )}

      <form className="planner-form" onSubmit={add}>
        <label>
          Block Title
          <input
            value={title}
            maxLength="160"
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Electrostatics problem set 1"
          />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>
        <label>
          Start Time
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </label>
        <label>
          Duration (m)
          <input
            type="number"
            min="5"
            max="480"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          />
        </label>
        <label>
          Subject
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)}>
            <option value="">Unsorted</option>
            {state.subjects.map(row => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" style={{ height: 42 }}>
          <I.Plus /> Add block
        </button>
      </form>
    </>
  );
}

