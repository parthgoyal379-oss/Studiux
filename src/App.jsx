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

const NAV_SECTIONS = [
  {
    title: '',
    items: [
      ['Home', I.House, 'Home'],
      ['Today', I.Target, 'Today'],
      ['Focus', I.Timer, 'Focus'],
      ['Plan', I.CalendarDays, 'Plan'],
      ['Progress', I.ChartNoAxesCombined, 'Progress']
    ]
  },
  {
    title: '',
    items: [
      ['Tasks', I.CheckSquare, 'Tasks'],
      ['Syllabus', I.BookOpen, 'Syllabus'],
      ['Revision', I.RotateCcw, 'Revision'],
      ['Exams', I.Trophy, 'Exams'],
      ['Mocks', I.BarChart3, 'Mocks']
    ]
  },
  {
    title: '',
    items: [
      ['Groups', I.Users, 'Circles'],
      ['Settings', I.Settings, 'Settings']
    ]
  }
];

const ALL_NAV_NAMES = NAV_SECTIONS.flatMap(s => s.items.map(x => x[0]));
const percent = (a, b) => (b ? Math.round(Math.min(1, a / b) * 100) : 0);

function Onboarding() {
  const { state, patch } = useStore();
  const [draft, setDraft] = useState(state.profile);

  return (
    <main className="onboard">
      <div className="brand-onboard">
        <BrandLogo size="lg" showTagline layout="vertical" />
      </div>
      <div className="on-card panel">
        <small style={{ color: 'var(--ink-muted)', marginBottom: 4 }}>Get started</small>
        <h1>Set up your workspace</h1>
        <p>Takes a minute. Everything stays editable later.</p>

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
          Enter Workspace <I.ChevronRight />
        </button>
      </div>
    </main>
  );
}

function Shell() {
  const { state, patch } = useStore();
  const [page, setPage] = useState(() => {
    const hash = location.hash.slice(1);
    return ALL_NAV_NAMES.includes(hash) ? hash : 'Home';
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
      if (ALL_NAV_NAMES.includes(next)) setPage(next);
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
        <div className="brand" onClick={() => navigate('Home')}>
          <BrandLogo size="md" />
        </div>
        <nav>
          {NAV_SECTIONS.map(section => (
            <div className="nav-section" key={section.title || section.items[0][0]}>
              {section.title && <div className="nav-section-title">{section.title}</div>}
              {section.items.map(([name, Icon, label]) => (
                <button
                  key={name}
                  className={page === name ? 'active' : ''}
                  onClick={() => navigate(name)}
                >
                  <Icon />
                  {label || name}
                </button>
              ))}
            </div>
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
              <small>{state.profile.exam || 'Workspace'}</small>
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
        <div className="header-actions">
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() => setNotifications(true)}
          >
            <I.Inbox />
            {hasUnread && <i />}
          </button>
        </div>
      </header>

      <main className="content">
        <Suspense fallback={loadingFallback}>
          <Page go={navigate} />
        </Suspense>
      </main>

      <div className="mobile-nav">
        {[
          ['Home', I.House],
          ['Today', I.Target],
          ['Focus', I.Timer],
          ['Tasks', I.CheckSquare]
        ].map(([name, Icon]) => (
          <button
            key={name}
            className={page === name ? 'active' : ''}
            onClick={() => navigate(name)}
          >
            <Icon />
            <small>{name}</small>
          </button>
        ))}
        <button onClick={() => setPalette(true)} aria-label="More views">
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
        <span className="eyebrow">{term ? 'Results' : 'Quick actions'}</span>
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

function SubjectDot({ color }) {
  return <i className="subject-dot" style={{ background: color || 'var(--accent)' }} />;
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

  const activeTasks = state.tasks.filter(t => !t.done);
  const nowPriorityTask = activeTasks.sort((a, b) => (a.dueAt || Infinity) - (b.dueAt || Infinity))[0];
  const upcomingTasks = activeTasks.slice(1, 4);
  const dueRevisions = state.revisionItems.filter(r => r.status !== 'COMPLETED').slice(0, 2);

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

  const maxWeek = Math.max(...week.map(x => x.value), 1);

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="home-layout">
      {/* Main column */}
      <div className="home-main">
        <div className="home-date">{dateStr}</div>

        {/* Study duration — typography is the hero */}
        <div className="home-studied">
          <b>{formatDuration(today.duration)}</b>
          <small>studied today</small>
        </div>

        {/* Horizontal progress track */}
        <div className="progress-track">
          <div
            className="progress-track-fill"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
          <span className="progress-track-label">
            {formatDuration(target)}
          </span>
        </div>

        {/* Focus CTA */}
        <button className="home-focus-btn" onClick={() => go('Focus')}>
          <I.Play style={{ width: 15, height: 15, fill: 'currentColor' }} />
          Start a focus session
          <kbd>Space</kbd>
        </button>

        {/* Up next section */}
        <div className="home-section">
          <div className="home-section-head">
            <h3>Up next</h3>
            <button className="text-button" onClick={() => go('Tasks')}>All tasks →</button>
          </div>

          {nowPriorityTask ? (
            <>
              <div className="now-priority-card">
                <div className="now-task-info">
                  <b>{nowPriorityTask.title}</b>
                  <div className="now-task-meta">
                    {nowPriorityTask.subject && (
                      <span className="subject-tag">
                        <SubjectDot color={state.subjects.find(s => s.id === nowPriorityTask.subjectId)?.color} />
                        {nowPriorityTask.subject}
                      </span>
                    )}
                    <span>{nowPriorityTask.estimate || 30}m</span>
                  </div>
                </div>
                <button
                  className="primary"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => go('Focus')}
                >
                  <I.Play style={{ width: 12, height: 12 }} /> Focus
                </button>
              </div>

              {upcomingTasks.map(t => (
                <div className="feed-row" key={t.id} onClick={() => go('Tasks')}>
                  <div className="feed-row-left">
                    <span className="subject-dot" style={{ background: state.subjects.find(s => s.id === t.subjectId)?.color || 'var(--accent)' }} />
                    <b>{t.title}</b>
                  </div>
                  <span className="feed-row-meta">{t.estimate || 30}m</span>
                </div>
              ))}
            </>
          ) : (
            <p style={{ fontSize: 13 }}>
              No tasks yet.{' '}
              <button className="text-button" onClick={() => go('Tasks')}>Add a study task →</button>
            </p>
          )}
        </div>

        {/* Revision due */}
        {dueRevisions.length > 0 && (
          <div className="home-section">
            <div className="home-section-head">
              <h3>Revision due</h3>
              <button className="text-button" onClick={() => go('Revision')}>Open →</button>
            </div>
            {dueRevisions.map(r => (
              <div className="feed-row" key={r.id} onClick={() => go('Revision')}>
                <div className="feed-row-left">
                  <I.RotateCcw style={{ width: 13, height: 13, color: 'var(--warning)' }} />
                  <b>{r.targetTitle || 'Spaced Revision'}</b>
                </div>
                <span className="feed-row-meta" style={{ color: 'var(--warning)' }}>Due today</span>
              </div>
            ))}
          </div>
        )}

        {/* Today's plan link */}
        <div className="home-section">
          <div className="home-section-head">
            <h3>Today's plan</h3>
            <button className="text-button" onClick={() => go('Plan')}>Open planner →</button>
          </div>
          {today.sessions > 0 ? (
            <p style={{ fontSize: 13 }}>
              {today.sessions} {today.sessions === 1 ? 'session' : 'sessions'} logged today.{' '}
              <button className="text-button" onClick={() => go('Today')}>View timeline →</button>
            </p>
          ) : (
            <p style={{ fontSize: 13 }}>
              No sessions yet today.{' '}
              <button className="text-button" onClick={() => go('Focus')}>Start one →</button>
            </p>
          )}
        </div>
      </div>

      {/* Context sidebar */}
      <div className="home-context">
        <div className="context-block">
          <h4>Daily target</h4>
          <div className="context-value">{formatDuration(target)}</div>
          <div className="context-label">{pct}% complete</div>
        </div>

        <div className="context-block">
          <h4>Sessions</h4>
          <div className="context-value">{today.sessions}</div>
        </div>

        <div className="context-block">
          <h4>Questions</h4>
          <div className="context-value">{today.questions}</div>
        </div>

        <div className="context-block">
          <h4>Focus score</h4>
          <div className="context-value">
            {today.sessions ? Math.round(today.focus / today.sessions) : '—'}
          </div>
          <div className="context-label">out of 100</div>
        </div>

        <div className="context-block">
          <h4>Resets at</h4>
          <div className="context-label">
            {String(state.profile.resetHour).padStart(2, '0')}:00
          </div>
        </div>

        {/* Mini week chart */}
        <div className="context-block">
          <h4>This week</h4>
          <div className="mini-bars">
            {week.map(x => (
              <div
                key={x.d.toISOString()}
                className={x.value > 0 ? 'mini-bar' : 'mini-bar mini-bar-empty'}
                style={{ height: `${Math.max(6, (x.value / maxWeek) * 100)}%` }}
                title={`${x.d.toLocaleDateString()}: ${formatDuration(x.value)}`}
              />
            ))}
          </div>
          <div className="mini-bar-labels">
            {week.map(x => (
              <small key={x.d.toISOString()}>
                {x.d.toLocaleDateString(undefined, { weekday: 'narrow' })}
              </small>
            ))}
          </div>
        </div>
      </div>
    </div>
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
