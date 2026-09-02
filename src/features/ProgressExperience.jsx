import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { aggregate, DAY, formatDuration, studyDayKey } from '../lib.js';
import { deterministicInsights, planActualForRange } from '../domain/product.js';
import * as I from '../icons.jsx';

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export default function ProgressExperience({ go }) {
  const { state } = useStore();
  const [range, setRange] = useState(7);
  const end = Date.now();
  const start = end - range * DAY;

  const sessions = useMemo(
    () =>
      state.sessions.filter(
        row =>
          (row.endedAt || row.startedAt) >= start &&
          (row.endedAt || row.startedAt) < end
      ),
    [state.sessions, start, end]
  );

  const total = sessions.reduce((sum, row) => sum + Math.max(0, row.duration || 0), 0);

  const days = Array.from({ length: range }, (_, index) => {
    const date = new Date(end - (range - 1 - index) * DAY);
    const key = studyDayKey(date, state.profile.resetHour, state.profile.timezone);
    return {
      key,
      date,
      ...aggregate(state.sessions, key, {
        resetHour: state.profile.resetHour,
        timeZone: state.profile.timezone
      })
    };
  });

  const activeDays = days.filter(day => day.duration > 0).length;
  const max = Math.max(...days.map(day => day.duration), 1);
  const plan = planActualForRange({
    tasks: state.tasks,
    events: state.plannerEvents,
    sessions: state.sessions,
    start,
    end
  });

  const insights = deterministicInsights({ ...state, now: end });

  const subjectRows = state.subjects
    .map(subject => ({
      subject,
      ms: sessions
        .filter(row => row.subjectId === subject.id)
        .reduce((sum, row) => sum + (row.duration || 0), 0)
    }))
    .sort((a, b) => b.ms - a.ms);

  const averageFocus = sessions.length
    ? Math.round(
        sessions.reduce((sum, row) => sum + (row.focusScore || 0), 0) / sessions.length
      )
    : null;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">STUDY INTELLIGENCE</span>
          <h1>Evidence, not vanity metrics.</h1>
          <p>Ground-truth analytics calculated directly from your verified focus blocks.</p>
        </div>
        <div className="range-switch">
          {[7, 30, 90].map(value => (
            <button
              key={value}
              className={range === value ? 'active' : ''}
              onClick={() => setRange(value)}
            >
              {value} Days
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-metrics">
        <div className="metric">
          <span>FOCUSED STUDY TIME</span>
          <b>{formatDuration(total)}</b>
          <small>{range}-day cumulative</small>
        </div>
        <div className="metric">
          <span>RECORDED SESSIONS</span>
          <b>{sessions.length}</b>
          <small>
            {sessions.length
              ? `${Math.round(total / (sessions.length * 60000))}m avg length`
              : '—'}
          </small>
        </div>
        <div className="metric">
          <span>ACTIVE STUDY DAYS</span>
          <b>
            {activeDays} / {range}
          </b>
          <small>{Math.round((activeDays / range) * 100)}% consistency</small>
        </div>
        <div className="metric">
          <span>AVG FOCUS SCORE</span>
          <b>{averageFocus != null ? averageFocus : '—'}</b>
          <small>Scale of 100</small>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="panel">
          <div className="panel-title">
            <h3>Daily Focus Trend</h3>
            <span>
              {state.profile.timezone || 'Local time'} · Reset {String(state.profile.resetHour).padStart(2, '0')}:00
            </span>
          </div>
          {sessions.length ? (
            <div className="trend-bars" aria-label="Daily focus chart">
              {days.map(day => (
                <div key={day.key} title={`${day.key}: ${formatDuration(day.duration)}`}>
                  <span style={{ height: `${(day.duration / max) * 100}%` }} />
                  <small>
                    {day.date.toLocaleDateString(undefined, {
                      weekday: range > 14 ? undefined : 'narrow',
                      day: 'numeric'
                    })}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '40px 20px' }}>
              <h3>Your analytics start with one session</h3>
              <p>No synthetic placeholder data is inserted here.</p>
              <button className="primary" onClick={() => go?.('Focus')} style={{ margin: '14px auto 0' }}>
                <I.Play /> Start Focus
              </button>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-title">
            <h3>Subject Balance</h3>
            <span>Selected {range}d range</span>
          </div>
          {subjectRows.length ? (
            subjectRows.map(({ subject, ms }) => (
              <div className="balance-row" key={subject.id}>
                <div>
                  <i
                    className="subject-dot"
                    style={{ background: subject.color || 'var(--accent)' }}
                  />
                  <b>{subject.name}</b>
                  <span>{formatDuration(ms)}</span>
                </div>
                <div className="balance-track">
                  <i
                    style={{
                      width: `${pct(ms, total)}%`,
                      background: subject.color || 'var(--accent)'
                    }}
                  />
                </div>
                <small>{pct(ms, total)}%</small>
              </div>
            ))
          ) : (
            <div className="empty">
              <h3>Add subjects to see balance</h3>
              <p>Subject balance is calculated strictly from your completed sessions.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-title">
            <h3>Plan vs Actual Execution</h3>
            <span>{range} Days Scope</span>
          </div>
          <div className="analytics-list">
            <p>
              <span>Planned Study Time</span>
              <b>{formatDuration(plan.plannedMinutes * 60000)}</b>
            </p>
            <p>
              <span>Recorded Actual Focus</span>
              <b>{formatDuration(plan.actualMs)}</b>
            </p>
            <p>
              <span>Execution Adherence</span>
              <b>{plan.adherence == null ? '—' : `${Math.round(plan.adherence * 100)}%`}</b>
            </p>
            <p>
              <span>Planned Tasks Completed</span>
              <b>
                {plan.completedTasks} of {plan.plannedTasks}
              </b>
            </p>
          </div>
        </section>

        <section className="insight insight-list">
          <div>
            <span className="eyebrow">GROUNDED INSIGHTS</span>
            <h3>{insights[0] || 'A useful pattern needs more evidence.'}</h3>
            {insights.slice(1).map(text => (
              <p key={text}>{text}</p>
            ))}
            {!insights.length && (
              <p>Complete sessions and log task deadlines to surface verified pattern analysis.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
