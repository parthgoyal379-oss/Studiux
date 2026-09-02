import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { clock, elapsed, focusScore, uid } from '../lib.js';
import { advanceRevision } from '../domain/product.js';
import { nextRecurrenceDue } from '../domain/recurrence.js';
import { playBreakSound, playTimerDoneSound } from '../domain/sound.js';
import * as I from '../icons.jsx';

const MODES = ['STOPWATCH', 'COUNTDOWN', 'POMODORO', 'DEEP WORK'];

function focusedPomodoroMs(active, elapsedMs) {
  const work = (active.workMinutes || 25) * 60000;
  const rest = (active.breakMinutes || 5) * 60000;
  const cycle = work + rest;
  const full = Math.floor(elapsedMs / cycle);
  const partial = elapsedMs % cycle;
  return full * work + Math.min(partial, work);
}

export default function FocusExperience() {
  const { state, patch } = useStore();
  const draft = state.focusDraft || {};
  const [now, setNow] = useState(Date.now());
  const [review, setReview] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [manualTime, setManualTime] = useState('18:00');
  const [subjectId, setSubjectId] = useState(draft.subjectId || state.subjects[0]?.id || '');
  const [chapterId, setChapterId] = useState(draft.chapterId || '');
  const [taskId, setTaskId] = useState(draft.taskId || '');
  const [mode, setMode] = useState(draft.mode || state.preferences?.defaultTimerMode || 'STOPWATCH');
  const [intention, setIntention] = useState(draft.intention || '');
  const [minutes, setMinutes] = useState(draft.minutes || 50);
  const [rating, setRating] = useState(4);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [notes, setNotes] = useState('');
  const [markTaskDone, setMarkTaskDone] = useState(true);
  const [revisionOutcome, setRevisionOutcome] = useState('STRONG');

  const soundPlayedRef = useRef(false);
  const lastPhaseRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const warn = e => {
      if (state.active) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const visibility = () => {
      if (document.hidden && state.active && !state.active.pausedAt) {
        patch(s => ({
          ...s,
          active: { ...s.active, tabLeaves: (s.active.tabLeaves || 0) + 1 }
        }));
      }
    };
    addEventListener('beforeunload', warn);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      removeEventListener('beforeunload', warn);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [state.active, patch]);

  // Keyboard shortcuts: Space to toggle pause, F to finish session
  useEffect(() => {
    const handleKeyDown = e => {
      if (!state.active || review || manual) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        setReview(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const chapters = state.chapters.filter(row => row.subjectId === subjectId);
  const activeElapsed = elapsed(state.active, now);
  const target = state.active?.targetMinutes ? state.active.targetMinutes * 60000 : null;
  const pomodoroFocus =
    state.active?.mode === 'POMODORO'
      ? focusedPomodoroMs(state.active, activeElapsed)
      : activeElapsed;
  const display = target ? Math.max(0, target - activeElapsed) : activeElapsed;

  const phase = useMemo(() => {
    if (state.active?.mode !== 'POMODORO') return null;
    const work = (state.active.workMinutes || 25) * 60000;
    const rest = (state.active.breakMinutes || 5) * 60000;
    return activeElapsed % (work + rest) < work ? 'FOCUS PHASE' : 'BREAK PHASE';
  }, [state.active, activeElapsed]);

  // Sound chimes triggers
  useEffect(() => {
    if (!state.active) {
      soundPlayedRef.current = false;
      lastPhaseRef.current = null;
      return;
    }

    if (target && display === 0 && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playTimerDoneSound();
    }

    if (phase && lastPhaseRef.current && lastPhaseRef.current !== phase) {
      if (phase === 'BREAK PHASE') {
        playBreakSound();
      } else {
        playTimerDoneSound();
      }
    }
    if (phase) {
      lastPhaseRef.current = phase;
    }
  }, [state.active, target, display, phase]);

  function start() {
    if (!subjectId) return;
    const workMinutes = state.preferences?.pomodoroWorkMinutes || 25;
    const breakMinutes = state.preferences?.pomodoroBreakMinutes || 5;
    const targetMinutes =
      mode === 'STOPWATCH'
        ? null
        : mode === 'POMODORO'
        ? (workMinutes + breakMinutes) * 4
        : mode === 'DEEP WORK'
        ? Math.max(60, minutes)
        : minutes;

    patch({
      focusDraft: null,
      active: {
        id: uid(),
        subjectId,
        chapterId: chapterId || null,
        taskId: taskId || draft.taskId || null,
        revisionItemId: draft.revisionItemId || null,
        mode,
        sessionType: mode === 'POMODORO' ? 'Questions' : 'Other',
        intention: intention.trim(),
        startedAt: Date.now(),
        pausedTotal: 0,
        tabLeaves: 0,
        targetMinutes,
        workMinutes,
        breakMinutes,
        source: 'TIMER'
      }
    });
  }

  function togglePause() {
    patch(s => ({
      ...s,
      active: s.active.pausedAt
        ? {
            ...s.active,
            pausedTotal: s.active.pausedTotal + Date.now() - s.active.pausedAt,
            pausedAt: null
          }
        : { ...s.active, pausedAt: Date.now() }
    }));
  }

  function discardSession() {
    if (window.confirm('Discard this focus session without saving?')) {
      patch({ active: null, focusDraft: null });
      setReview(false);
    }
  }

  function saveReview() {
    if (!state.active) return;
    const raw = elapsed(state.active);
    const duration =
      state.active.mode === 'POMODORO'
        ? focusedPomodoroMs(state.active, raw)
        : Math.min(
            raw,
            state.active.targetMinutes ? state.active.targetMinutes * 60000 : raw
          );
    const session = {
      ...state.active,
      status: 'COMPLETED',
      endedAt: Date.now(),
      duration,
      focusRating: Number(rating),
      focusScore: focusScore({
        duration,
        rating: Number(rating),
        tabLeaves: state.active.tabLeaves || 0,
        completed: true
      }),
      questions: Number(attempted) || 0,
      questionsCorrect: Math.min(Number(correct) || 0, Number(attempted) || 0),
      notes: notes.trim(),
      source: 'TIMER'
    };

    patch(s => {
      let nextTasks = s.tasks;
      if (state.active.taskId && markTaskDone) {
        const task = s.tasks.find(t => t.id === state.active.taskId);
        if (task && !task.done) {
          nextTasks = s.tasks.map(t =>
            t.id === task.id
              ? { ...t, done: true, status: 'DONE', completedAt: Date.now() }
              : t
          );
          if (task.recurrence) {
            const nextDue = nextRecurrenceDue(task.recurrence, task.dueAt || Date.now());
            nextTasks = [
              {
                ...task,
                id: uid(),
                done: false,
                status: 'OPEN',
                dueAt: nextDue,
                completedAt: null
              },
              ...nextTasks
            ];
          }
        }
      }

      let nextRevisionItems = s.revisionItems;
      let nextRevisionHistory = s.revisionHistory;
      if (state.active.revisionItemId) {
        const revItem = s.revisionItems.find(r => r.id === state.active.revisionItemId);
        if (revItem) {
          nextRevisionItems = s.revisionItems.map(r =>
            r.id === revItem.id ? advanceRevision(r, revisionOutcome) : r
          );
          nextRevisionHistory = [
            ...s.revisionHistory,
            {
              id: uid(),
              revisionItemId: revItem.id,
              revisedAt: Date.now(),
              outcome: revisionOutcome
            }
          ];
        }
      }

      return {
        ...s,
        active: null,
        tasks: nextTasks,
        revisionItems: nextRevisionItems,
        revisionHistory: nextRevisionHistory,
        sessions: [...s.sessions, session]
      };
    });

    setReview(false);
    setIntention('');
    setNotes('');
    setAttempted(0);
    setCorrect(0);
  }

  function saveManual(e) {
    e.preventDefault();
    if (!subjectId || minutes <= 0) return;
    const startedAt = +new Date(`${manualDate}T${manualTime}`);
    const duration = Math.max(1, Math.min(1440, Number(minutes) || 1)) * 60000;
    patch(s => ({
      ...s,
      sessions: [
        ...s.sessions,
        {
          id: uid(),
          subjectId,
          chapterId: chapterId || null,
          taskId: taskId || null,
          status: 'COMPLETED',
          source: 'MANUAL',
          sessionType: 'Other',
          startedAt,
          endedAt: startedAt + duration,
          duration,
          questions: Number(attempted) || 0,
          questionsCorrect: Math.min(Number(correct) || 0, Number(attempted) || 0),
          notes: notes.trim(),
          intention: intention.trim()
        }
      ]
    }));
    setManual(false);
    setNotes('');
    setAttempted(0);
    setCorrect(0);
  }

  if (!state.active) {
    return (
      <section className="focus-setup">
        <span className="eyebrow">FOCUS ENGINE</span>
        <h1>What are you working on?</h1>
        <p>Select your subject and set a clear intention before starting.</p>

        <div className="focus-card">
          <label>
            Subject
            <div className="subject-picks">
              {state.subjects.map(subject => (
                <button
                  type="button"
                  className={subjectId === subject.id ? 'selected' : ''}
                  onClick={() => {
                    setSubjectId(subject.id);
                    setChapterId('');
                  }}
                  key={subject.id}
                >
                  <i
                    className="subject-dot"
                    style={{ background: subject.color || '#6366f1' }}
                  />
                  {subject.name}
                </button>
              ))}
            </div>
          </label>
          {!state.subjects.length && (
            <p className="form-error">Add a subject before starting Focus.</p>
          )}

          <div className="form-row">
            <label>
              Chapter (optional)
              <select value={chapterId} onChange={e => setChapterId(e.target.value)}>
                <option value="">No chapter</option>
                {chapters.map(row => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Task (optional)
              <select value={taskId} onChange={e => setTaskId(e.target.value)}>
                <option value="">No task</option>
                {state.tasks
                  .filter(row => !row.done && (!subjectId || row.subjectId === subjectId))
                  .map(row => (
                    <option key={row.id} value={row.id}>
                      {row.title}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label>
            Session intention
            <input
              value={intention}
              maxLength="240"
              onChange={e => setIntention(e.target.value)}
              placeholder="e.g. 30 electrostatics questions without looking at solutions"
            />
          </label>

          <label>
            Timer Mode
            <div className="mode-picks">
              {MODES.map(value => (
                <button
                  type="button"
                  className={mode === value ? 'selected' : ''}
                  onClick={() => setMode(value)}
                  key={value}
                >
                  {value.replace('_', ' ')}
                </button>
              ))}
            </div>
          </label>

          {mode !== 'STOPWATCH' && mode !== 'POMODORO' && (
            <label>
              Duration (minutes)
              <input
                type="number"
                min={mode === 'DEEP WORK' ? 60 : 1}
                max="480"
                value={minutes}
                onChange={e => setMinutes(Math.max(1, Number(e.target.value)))}
              />
            </label>
          )}

          {mode === 'POMODORO' && (
            <p className="muted" style={{ margin: '4px 0' }}>
              {state.preferences?.pomodoroWorkMinutes || 25}m focus ·{' '}
              {state.preferences?.pomodoroBreakMinutes || 5}m break · 4 cycles. Configurable in Settings.
            </p>
          )}

          <button className="primary wide big" disabled={!subjectId} onClick={start}>
            <I.Play /> Begin Focus Session
          </button>
          <button
            className="text-button"
            disabled={!subjectId}
            onClick={() => setManual(true)}
            style={{ justifySelf: 'center' }}
          >
            Log study manually →
          </button>
        </div>

        {manual && (
          <div className="overlay" onMouseDown={() => setManual(false)}>
            <form
              className="import-dialog review-dialog"
              role="dialog"
              aria-modal="true"
              onSubmit={saveManual}
              onMouseDown={e => e.stopPropagation()}
            >
              <span className="eyebrow">MANUAL STUDY LOG</span>
              <h2>Record missed study time</h2>
              <p className="muted">
                Manual logs remain visibly distinguished from verified timer focus records.
              </p>
              <div className="form-row">
                <label>
                  Date
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                  />
                </label>
                <label>
                  Start time
                  <input
                    type="time"
                    value={manualTime}
                    onChange={e => setManualTime(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={minutes}
                  onChange={e => setMinutes(Number(e.target.value))}
                />
              </label>
              <div className="form-row">
                <label>
                  Questions attempted
                  <input
                    type="number"
                    min="0"
                    value={attempted}
                    onChange={e => setAttempted(e.target.value)}
                  />
                </label>
                <label>
                  Correct
                  <input
                    type="number"
                    min="0"
                    max={attempted}
                    value={correct}
                    onChange={e => setCorrect(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Note
                <textarea
                  value={notes}
                  maxLength="1000"
                  onChange={e => setNotes(e.target.value)}
                />
              </label>
              <div className="dialog-actions">
                <button type="button" onClick={() => setManual(false)}>
                  Cancel
                </button>
                <button className="primary">Save manual log</button>
              </div>
            </form>
          </div>
        )}
      </section>
    );
  }

  const subject = state.subjects.find(row => row.id === state.active.subjectId);

  return (
    <section className="timer-page">
      <div className="live">
        <i />
        {state.active.pausedAt ? 'PAUSED' : phase || 'LIVE FOCUS'}
      </div>

      <div className="subject-chip">
        <i
          className="subject-dot"
          style={{ background: subject?.color || 'var(--accent)' }}
        />
        <span>{subject?.name || 'Study session'}</span>
      </div>

      <div
        className="timer"
        aria-live="polite"
        aria-label={`${Math.floor(display / 1000)} seconds ${
          target ? 'remaining' : 'elapsed'
        }`}
      >
        {clock(display)}
      </div>

      {target && (
        <div className="timer-progress">
          <i style={{ width: `${Math.min(100, (activeElapsed / target) * 100)}%` }} />
        </div>
      )}

      <p>{state.active.intention || 'Stay with the next clear action.'}</p>

      <div className="timer-actions">
        <button
          className="round"
          onClick={togglePause}
          title="Pause/Resume (Space)"
          aria-label={state.active.pausedAt ? 'Resume' : 'Pause'}
        >
          {state.active.pausedAt ? <I.Play /> : <I.Pause />}
        </button>
        <button className="finish" onClick={() => setReview(true)} title="Finish (Key F)">
          <I.Square />
          <span>Finish Session</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12 }}>
        <button
          type="button"
          onClick={discardSession}
          style={{ background: 'transparent', border: 'none', color: 'var(--rose)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
        >
          Discard Session
        </button>
      </div>

      <small className="muted" style={{ marginTop: 8 }}>
        Shortcuts: <kbd>Space</kbd> Pause/Resume · <kbd>F</kbd> Finish · Monotonic timestamp authoritative.
      </small>

      {review && (
        <div className="overlay" onMouseDown={() => setReview(false)}>
          <section
            className="import-dialog review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            onMouseDown={e => e.stopPropagation()}
          >
            <span className="eyebrow">SESSION REVIEW</span>
            <h2 id="review-title">Record what actually happened.</h2>
            <p>
              {clock(
                state.active.mode === 'POMODORO' ? pomodoroFocus : activeElapsed
              )}{' '}
              focused · {subject?.name}
            </p>

            <label>
              Focus rating (1 to 5)
              <select value={rating} onChange={e => setRating(e.target.value)}>
                {[1, 2, 3, 4, 5].map(value => (
                  <option key={value} value={value}>
                    {value} / 5 {'★'.repeat(value)}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-row">
              <label>
                Questions attempted
                <input
                  type="number"
                  min="0"
                  value={attempted}
                  onChange={e => setAttempted(e.target.value)}
                />
              </label>
              <label>
                Correct
                <input
                  type="number"
                  min="0"
                  max={attempted}
                  value={correct}
                  onChange={e => setCorrect(e.target.value)}
                />
              </label>
            </div>

            {state.active.taskId && (
              <label className="toggle-row" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={markTaskDone}
                  onChange={e => setMarkTaskDone(e.target.checked)}
                />
                <span>Mark linked task as completed</span>
              </label>
            )}

            {state.active.revisionItemId && (
              <label style={{ marginTop: 6 }}>
                Spaced Revision Recall Outcome
                <select
                  value={revisionOutcome}
                  onChange={e => setRevisionOutcome(e.target.value)}
                >
                  <option value="STRONG">Strong (Retained well)</option>
                  <option value="OKAY">Okay (Needed some hints)</option>
                  <option value="WEAK">Weak (Forgotten / Difficult)</option>
                </select>
              </label>
            )}

            <label>
              Session reflection notes
              <textarea
                value={notes}
                maxLength="1000"
                onChange={e => setNotes(e.target.value)}
                placeholder="What worked well? What needs another pass?"
              />
            </label>

            <div className="dialog-actions">
              <button onClick={() => setReview(false)}>Continue session</button>
              <button className="primary" onClick={saveReview}>
                Save session
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

