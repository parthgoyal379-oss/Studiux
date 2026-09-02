import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Store, useStore } from './store.jsx';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { AuthScreen } from './auth/AuthScreen.jsx';
import { SyncBadge } from './sync/SyncContext.jsx';
import { aggregate, formatDuration, studyDayKey } from './lib.js';
import { evaluateNotifications } from './domain/notificationEngine.js';
import * as I from './icons.jsx';
import { BrandLogo } from './components/BrandLogo.jsx';

const FocusExperience = lazy(() => import('./features/FocusExperience.jsx'));
const PlannerExperience = lazy(() => import('./features/PlannerExperience.jsx'));
const RevisionExperience = lazy(() => import('./features/RevisionExperience.jsx'));
const MockLab = lazy(() => import('./features/MockLab.jsx'));
const TasksExperience = lazy(() => import('./features/TasksExperience.jsx'));
const ProgressExperience = lazy(() => import('./features/ProgressExperience.jsx'));
const SettingsExperience = lazy(() => import('./features/SettingsExperience.jsx'));
const TodayExperience = lazy(() => import('./features/TodayExperience.jsx'));
const SyllabusExperience = lazy(() => import('./features/SyllabusExperience.jsx'));
const GroupsExperience = lazy(() => import('./features/GroupsExperience.jsx'));
const NotificationCenter = lazy(() => import('./features/NotificationCenter.jsx'));
const ExamsExperience = lazy(() => import('./features/ExamsExperience.jsx'));

const NAV = [
  ['Home', I.House],
  ['Today', I.Target],
  ['Focus', I.Timer],
  ['Plan', I.CalendarDays],
  ['Tasks', I.CheckSquare],
  ['Progress', I.ChartNoAxesCombined],
  ['Syllabus', I.BookOpen],
  ['Revision', I.RotateCcw],
  ['Exams', I.Trophy],
  ['Mocks', I.BarChart3],
  ['Groups', I.Users],
  ['Settings', I.Settings]
];

const percent = (a, b) => (b ? Math.round(Math.min(1, a / b) * 100) : 0);

function Onboarding() {
  const { state, patch } = useStore();
  const [draft, setDraft] = useState(state.profile);

  return (
    <main className="onboard">
      <div className="brand-onboard">
        <BrandLogo size="lg" showTagline layout="vertical" />
      </div>
      <div className="on-card">
        <span className="eyebrow">SET UP YOUR STUDY SPACE</span>
        <h1>Make the next study block obvious.</h1>
        <p>A small setup now. Everything stays editable later.</p>

        <label>
          Your Name
          <input
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Parth"
            autoFocus
          />
        </label>
        <label>
          Target Examination
          <select value={draft.exam} onChange={e => setDraft({ ...draft, exam: e.target.value })}>
            {['JEE 2027', 'NEET', 'UPSC', 'SAT', 'University', 'Something else'].map(x => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Daily Target (Hours)
            <input
              type="number"
              min="0"
              max="24"
              step="0.25"
              value={draft.targetMinutes / 60}
              onChange={e =>
                setDraft({ ...draft, targetMinutes: Math.max(0, Number(e.target.value) * 60) })
              }
            />
          </label>
          <label>
            Study Day Resets At
            <select
              value={draft.resetHour}
              onChange={e => setDraft({ ...draft, resetHour: Number(e.target.value) })}
            >
              {[0, 2, 3, 4, 5, 6].map(x => (
                <option key={x} value={x}>
                  {String(x).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="primary wide big"
          style={{ marginTop: 8 }}
          onClick={() =>
            patch({
              profile: { ...draft, name: draft.name.trim() || 'Student' },
              onboarded: true
            })
          }
        >
          Enter my workspace <I.ChevronRight />
        </button>
      </div>
    </main>
  );
}

function Shell() {
  const { state, patch } = useStore();
  const [page, setPage] = useState(() => {
    const hash = location.hash.slice(1);
    return NAV.some(([name]) => name === hash) ? hash : 'Home';
  });
  const [palette, setPalette] = useState(false);
  const [notifications, setNotifications] = useState(false);

  // Background deterministic notification evaluation
  useEffect(() => {
    if (!state.onboarded) return;
    const newNotifs = evaluateNotifications(state);
    if (newNotifs.length > 0) {
      patch(s => ({
        ...s,
        notifications: [...newNotifs, ...s.notifications]
      }));
    }
  }, [state, patch]);

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(v => !v);
      }
      if (e.key === 'Escape') {
        setPalette(false);
        setNotifications(false);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    const onHash = () => {
      const next = location.hash.slice(1);
      if (NAV.some(([name]) => name === next)) setPage(next);
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  const navigate = next => {
    setPage(next);
    history.replaceState(null, '', `#${next}`);
  };

  const Page =
    {
      Home,
      Today: TodayExperience,
      Focus: FocusExperience,
      Plan: PlannerExperience,
      Tasks: TasksExperience,
      Progress: ProgressExperience,
      Syllabus: SyllabusExperience,
      Revision: RevisionExperience,
      Exams: ExamsExperience,
      Mocks: MockLab,
      Groups: GroupsExperience,
      Settings: SettingsExperience
    }[page] || Home;

  const loadingFallback = (
    <main className="route-loading" aria-live="polite">
      Opening {page}…
    </main>
  );

  const hasUnread = state.notifications.some(row => !row.readAt);

  return (
    <div className="app">
      <aside>
        <div className="brand" onClick={() => navigate('Home')} style={{ cursor: 'pointer' }}>
          <BrandLogo size="md" />
        </div>
        <nav>
          {NAV.map(([name, Icon]) => (
            <button
              key={name}
              className={page === name ? 'active' : ''}
              onClick={() => navigate(name)}
            >
              <Icon />
              {name}
            </button>
          ))}
        </nav>
        <div className="aside-foot">
          <button
            onClick={() => patch({ theme: state.theme === 'dark' ? 'light' : 'dark' })}
            aria-label="Toggle light or dark theme"
          >
            {state.theme === 'dark' ? <I.Sun /> : <I.Moon />}
            {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="user">
            <b>{(state.profile.name || 'S')[0].toUpperCase()}</b>
            <span>
              {state.profile.name || 'Student'}
              <small>{state.profile.exam}</small>
            </span>
          </div>
        </div>
      </aside>

      <header>
        <button
          className="mobile-menu"
          onClick={() => setPalette(true)}
          aria-label="Open navigation"
        >
          <I.Menu />
        </button>
        <button className="search" onClick={() => setPalette(true)}>
          <I.Search />
          <span>Search or run a command…</span>
          <kbd>⌘ K</kbd>
        </button>
        <button
          className="icon notification-button"
          aria-label="Notifications"
          onClick={() => setNotifications(true)}
        >
          <I.Inbox />
          {hasUnread && <i />}
        </button>
        <button className="start" onClick={() => navigate('Focus')}>
          <I.Play />
          <span>Start Focus</span>
        </button>
      </header>

      <main className="content">
        <Suspense fallback={loadingFallback}>
          <Page go={navigate} />
        </Suspense>
      </main>

      <div className="mobile-nav">
        {NAV.slice(0, 4).map(([name, Icon]) => (
          <button
            key={name}
            className={page === name ? 'active' : ''}
            onClick={() => navigate(name)}
          >
            <Icon />
            <small>{name}</small>
          </button>
        ))}
        <button
          className=""
          onClick={() => setPalette(true)}
          aria-label="More views"
        >
          <I.SlidersHorizontal />
          <small>More</small>
        </button>
      </div>

      {palette && (
        <Palette
          close={() => setPalette(false)}
          go={x => {
            navigate(x);
            setPalette(false);
          }}
        />
      )}

      {notifications && (
        <Suspense fallback={null}>
          <NotificationCenter
            close={() => setNotifications(false)}
            go={x => {
              navigate(x);
              setNotifications(false);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

function Palette({ close, go }) {
  const { state, patch } = useStore();
  const [query, setQuery] = useState('');

  const actions = [
    ['Start focus session', 'Focus', I.Play],
    ['Create a task', 'Tasks', I.Plus],
    ['Open Today', 'Today', I.Target],
    ['Open Planner', 'Plan', I.CalendarDays],
    ['Open Revision', 'Revision', I.RotateCcw],
    ['Add mock result', 'Mocks', I.BarChart3],
    ['Open analytics', 'Progress', I.ChartNoAxesCombined],
    ['Manage syllabus', 'Syllabus', I.BookOpen],
    ['Change settings', 'Settings', I.Settings],
    ['Toggle theme', 'Settings', I.Moon]
  ];

  const term = query.trim().toLowerCase();
  const entities = term
    ? [
        ...state.tasks.map(row => [row.title, 'Tasks', I.CheckSquare]),
        ...state.subjects.map(row => [row.name, 'Syllabus', I.BookOpen]),
        ...state.chapters.map(row => [row.name, 'Syllabus', I.BookOpen]),
        ...state.mocks.map(row => [row.name, 'Mocks', I.BarChart3]),
        ...state.mistakes.map(row => [row.notes || row.type, 'Mocks', I.BarChart3])
      ]
        .filter(([label]) => label?.toLowerCase().includes(term))
        .slice(0, 8)
    : [];

  const list = [
    ...actions.filter(([label]) => label.toLowerCase().includes(term)),
    ...entities
  ];

  const choose = ([label, page]) => {
    if (label === 'Toggle theme') patch({ theme: state.theme === 'dark' ? 'light' : 'dark' });
    else go(page);
    close();
  };

  return (
    <div className="overlay" onMouseDown={close}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={e => e.stopPropagation()}
      >
        <div>
          <I.Search />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && list[0]) choose(list[0]);
            }}
            placeholder="Type a command or search…"
            autoFocus
          />
        </div>
        <span className="eyebrow">{term ? 'RESULTS' : 'QUICK ACTIONS'}</span>
        {list.map((item, index) => {
          const [label, , Icon] = item;
          return (
            <button key={`${label}-${index}`} onClick={() => choose(item)}>
              <Icon />
              {label}
              {index === 0 && <kbd>↵</kbd>}
            </button>
          );
        })}
        {!list.length && (
          <div className="empty">
            <p>No matching task, subject, chapter, mock or mistake.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, note }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
      {note && <small>{note}</small>}
    </div>
  );
}

function Empty({ title, text, action, onClick }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action}
        </button>
      )}
    </div>
  );
}

function SubjectDot({ color }) {
  return <i className="subject-dot" style={{ background: color || '#777', color: color || '#777' }} />;
}

function Home({ go }) {
  const { state } = useStore();
  const today = aggregate(
    state.sessions,
    studyDayKey(new Date(), state.profile.resetHour, state.profile.timezone),
    { resetHour: state.profile.resetHour, timeZone: state.profile.timezone }
  );
  const target = (state.profile.targetMinutes || 360) * 60000;
  const pct = percent(today.duration, target);

  const upcoming = [...state.tasks]
    .filter(t => !t.done)
    .sort((a, b) => (a.dueAt || Infinity) - (b.dueAt || Infinity))
    .slice(0, 3);

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = studyDayKey(d, state.profile.resetHour, state.profile.timezone);
    return {
      d,
      value: aggregate(state.sessions, k, {
        resetHour: state.profile.resetHour,
        timeZone: state.profile.timezone
      }).duration
    };
  });

  const max = Math.max(...week.map(x => x.value), 1);
  const strongest = state.subjects
    .map(s => ({
      ...s,
      ms: state.sessions
        .filter(x => x.subjectId === s.id)
        .reduce((a, x) => a + (x.duration || 0), 0)
    }))
    .sort((a, b) => b.ms - a.ms)[0];

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">
            {new Date()
              .toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })
              .toUpperCase()}
          </span>
          <h1>
            Good{' '}
            {new Date().getHours() < 12
              ? 'morning'
              : new Date().getHours() < 18
              ? 'afternoon'
              : 'evening'}
            , {state.profile.name || 'Student'}.
          </h1>
          <p>
            {today.duration
              ? `${formatDuration(today.duration)} focused study completed today. Maintain momentum.`
              : 'Your study history starts with one focused session.'}
          </p>
        </div>
        <button className="primary" onClick={() => go('Focus')}>
          <I.Play />
          <span>Start Focus</span>
        </button>
      </section>

      <section className="today panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">
              TODAY'S TARGET · RESETS {String(state.profile.resetHour).padStart(2, '0')}:00
            </span>
            <h2>
              {formatDuration(today.duration)}{' '}
              <small>of {formatDuration(target)} target</small>
            </h2>
          </div>
          <div className="ring" style={{ '--p': `${pct * 3.6}deg` }}>
            <b>{pct}%</b>
          </div>
        </div>
        <div className="metrics">
          <Metric
            label="REMAINING"
            value={formatDuration(Math.max(0, target - today.duration))}
          />
          <Metric label="SESSIONS" value={today.sessions} />
          <Metric label="QUESTIONS" value={today.questions} />
          <Metric
            label="FOCUS SCORE"
            value={today.sessions ? Math.round(today.focus / today.sessions) : '—'}
          />
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title">
            <h3>Next up</h3>
            <button className="text-button" onClick={() => go('Today')}>
              Open Today →
            </button>
          </div>
          {upcoming.length ? (
            upcoming.map(t => (
              <button
                className="list-row actionable"
                key={t.id}
                onClick={() => go('Tasks')}
              >
                <span className="checkbox" />
                <span className="task-copy">
                  <b>{t.title}</b>
                  <small>
                    {t.subject || 'Unsorted'} · {t.estimate || 30}m
                  </small>
                </span>
                <I.ChevronRight />
              </button>
            ))
          ) : (
            <Empty
              title="Nothing scheduled"
              text="Add one clear task to organize your day."
              action="Add task"
              onClick={() => go('Tasks')}
            />
          )}
        </section>

        <section className="panel">
          <div className="panel-title">
            <h3>Subject allocation</h3>
            <span>Recorded focus</span>
          </div>
          {state.subjects.length ? (
            state.subjects.slice(0, 4).map(s => {
              const ms = state.sessions
                .filter(x => x.subjectId === s.id)
                .reduce((a, x) => a + (x.duration || 0), 0);
              const barWidth = Math.min(
                100,
                (ms / Math.max(target / Math.max(state.subjects.length, 1), 1)) * 100
              );
              return (
                <div className="subject-row" key={s.id}>
                  <SubjectDot color={s.color} />
                  <span>{s.name}</span>
                  <div>
                    <i
                      style={{
                        width: `${barWidth}%`,
                        background: s.color || 'var(--accent)'
                      }}
                    />
                  </div>
                  <b>{formatDuration(ms)}</b>
                </div>
              );
            })
          ) : (
            <Empty
              title="Add your first subject"
              text="Subjects give every focus block useful context."
              action="Add subject"
              onClick={() => go('Syllabus')}
            />
          )}
        </section>

        <section className="panel week">
          <div className="panel-title">
            <h3>Seven-day rhythm</h3>
            <span>Actual focus time</span>
          </div>
          <div className="bars">
            {week.map(x => (
              <div key={x.d.toISOString()} title={formatDuration(x.value)}>
                <i style={{ height: `${(x.value / max) * 100}%` }} />
                <small>
                  {x.d.toLocaleDateString(undefined, { weekday: 'narrow' })}
                </small>
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 14 }}>
            {state.sessions.length
              ? 'Derived purely from your recorded focus sessions.'
              : 'Complete sessions to build your study pattern.'}
          </p>
        </section>

        <section className="insight">
          <I.Brain />
          <div>
            <span className="eyebrow">GROUNDED INSIGHT</span>
            <h3>
              {strongest
                ? `${strongest.name} is your strongest time investment.`
                : 'A useful pattern needs evidence.'}
            </h3>
            <p>
              {strongest
                ? `${formatDuration(strongest.ms)} recorded so far. Add more sessions to compare balance and focus windows.`
                : 'Studiux will surface patterns only after your own records make them meaningful.'}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Store>
        <Gate />
      </Store>
    </AuthProvider>
  );
}

function Gate() {
  const { state, loading, error } = useStore();
  const auth = useAuth();

  if (auth.loading || loading)
    return (
      <main className="auth-loading">
        <BrandLogo size="lg" showTagline layout="vertical" />
        <p style={{ marginTop: '20px' }}>Restoring your study space…</p>
      </main>
    );

  if (auth.configured && !auth.session) return <AuthScreen />;

  if (error && !state.onboarded)
    return (
      <main className="auth-loading">
        <BrandLogo size="lg" showTagline layout="vertical" />
        <p style={{ marginTop: '20px' }}>Your study space could not be opened. Reload to retry.</p>
      </main>
    );

  return state.onboarded ? (
    <>
      <SyncBadge />
      <Shell />
    </>
  ) : (
    <Onboarding />
  );
}
