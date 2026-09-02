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
    title: 'OVERVIEW',
    items: [
      ['Home', I.House, 'Home'],
      ['Today', I.Target, 'Today'],
      ['Focus', I.Timer, 'Focus'],
      ['Plan', I.CalendarDays, 'Plan'],
      ['Progress', I.ChartNoAxesCombined, 'Progress']
    ]
  },
  {
    title: 'STUDY VAULT',
    items: [
      ['Tasks', I.CheckSquare, 'Tasks'],
      ['Syllabus', I.BookOpen, 'Syllabus'],
      ['Revision', I.RotateCcw, 'Revision'],
      ['Exams', I.Trophy, 'Exams'],
      ['Mocks', I.BarChart3, 'Mocks']
    ]
  },
  {
    title: 'SYSTEM',
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
            <div className="nav-section" key={section.title}>
              <div className="nav-section-title">{section.title}</div>
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

  // Precision Chrono Halo calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

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

  // Subject distribution
  const totalSubjectMs = state.sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const subjectDistribution = state.subjects.map(s => {
    const ms = state.sessions
      .filter(x => x.subjectId === s.id)
      .reduce((a, x) => a + (x.duration || 0), 0);
    return { ...s, ms, pct: totalSubjectMs ? Math.round((ms / totalSubjectMs) * 100) : 0 };
  }).filter(s => s.ms > 0);

  return (
    <>
      {/* 1. Header & Live Time Anchor */}
      <div className="cockpit-header">
        <div className="cockpit-date-tag">
          <i className="cockpit-live-pulse" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>STUDY CYCLE ACTIVE</span>
        </div>
        <span className="cockpit-reset-hint">
          Quota resets at {String(state.profile.resetHour).padStart(2, '0')}:00
        </span>
      </div>

      {/* 2. Signature Studiux Chrono Hero & Dominant Focus Launchpad */}
      <div className="chrono-cockpit-hero">
        <div className="chrono-halo-wrap">
          <svg className="chrono-halo-svg" viewBox="0 0 140 140">
            <circle className="chrono-halo-track" cx="70" cy="70" r={radius} />
            <circle
              className="chrono-halo-progress"
              cx="70"
              cy="70"
              r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: isNaN(strokeDashoffset) ? circumference : strokeDashoffset
              }}
            />
          </svg>
          <div className="chrono-halo-center">
            <b>{formatDuration(today.duration)}</b>
            <small>of {formatDuration(target)}</small>
            <span className="chrono-halo-pct">{pct}%</span>
          </div>
        </div>

        <div className="chrono-launchpad">
          <div className="chrono-launchpad-copy">
            <span className="eyebrow">ACADEMIC FOCUS COCKPIT</span>
            <h2>Ready for your next study block.</h2>
            <div className="chrono-inline-metrics">
              <span>{today.sessions} {today.sessions === 1 ? 'Session' : 'Sessions'}</span>
              <i className="bullet" />
              <span>{today.questions} Questions</span>
              <i className="bullet" />
              <span>Focus Score: {today.sessions ? Math.round(today.focus / today.sessions) : '—'}</span>
            </div>
          </div>

          <div className="chrono-cta-row">
            <button className="focus-dominant-btn" onClick={() => go('Focus')}>
              <I.Play style={{ width: 16, height: 16, fill: 'currentColor' }} />
              <span>Start Focus Block</span>
              <kbd>Space</kbd>
            </button>
            <button className="text-button" onClick={() => go('Today')}>
              View Full Timeline →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Execution Flow: NOW / NEXT / LATER */}
      <div className="cockpit-flow-grid">
        {/* Column 1: NOW Immediate Priority */}
        <div className="flow-column">
          <div className="flow-header">
            <h3>NOW · FOCUS PRIORITY</h3>
            <button className="text-button" onClick={() => go('Tasks')}>Manage Tasks →</button>
          </div>

          {nowPriorityTask ? (
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
                  <span>{nowPriorityTask.estimate || 30}m estimated</span>
                </div>
              </div>
              <button
                className="primary"
                style={{ padding: '8px 14px', fontSize: 12.5 }}
                onClick={() => go('Focus')}
              >
                <I.Play style={{ width: 13, height: 13 }} /> Focus Now
              </button>
            </div>
          ) : (
            <div className="guided-setup-strip">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 13.5 }}>Set up your study workflow</b>
                <small style={{ color: 'var(--text-muted)' }}>3 quick actions</small>
              </div>
              <div className="guided-setup-steps">
                <button className="setup-step-pill" onClick={() => go('Syllabus')}>
                  <b>1</b> Add Subjects
                </button>
                <button className="setup-step-pill" onClick={() => go('Tasks')}>
                  <b>2</b> Plan Today's Task
                </button>
                <button className="setup-step-pill" onClick={() => go('Focus')}>
                  <b>3</b> Launch Focus
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: NEXT Upcoming Schedule */}
        <div className="flow-column">
          <div className="flow-header">
            <h3>NEXT · UPCOMING SCHEDULE</h3>
            <button className="text-button" onClick={() => go('Plan')}>Planner →</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcomingTasks.map(t => (
              <div className="feed-row" key={t.id} onClick={() => go('Tasks')}>
                <div className="feed-row-left">
                  <span className="subject-dot" style={{ background: state.subjects.find(s => s.id === t.subjectId)?.color || 'var(--accent)' }} />
                  <b>{t.title}</b>
                </div>
                <span className="feed-row-meta">{t.estimate || 30}m</span>
              </div>
            ))}

            {dueRevisions.map(r => (
              <div className="feed-row" key={r.id} onClick={() => go('Revision')}>
                <div className="feed-row-left">
                  <I.RotateCcw style={{ width: 13, height: 13, color: 'var(--amber)' }} />
                  <b>{r.targetTitle || 'Spaced Revision'}</b>
                </div>
                <span className="feed-row-meta" style={{ color: 'var(--amber)' }}>Due Today</span>
              </div>
            ))}

            {!upcomingTasks.length && !dueRevisions.length && (
              <div className="feed-row" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                <span>No pending scheduled tasks for later today.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. 7-Day Precision Study Pulse & Subject Mastery Spectrum */}
      <div className="rhythm-spectrum-grid">
        <div>
          <div className="flow-header" style={{ marginBottom: 12 }}>
            <h3>7-DAY STUDY PULSE</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Verified Focus</span>
          </div>
          <div className="rhythm-bars">
            {week.map(x => (
              <div className="rhythm-bar-col" key={x.d.toISOString()} title={`${x.d.toLocaleDateString()}: ${formatDuration(x.value)}`}>
                <div
                  className="rhythm-bar-fill"
                  style={{
                    height: `${Math.max(6, (x.value / maxWeek) * 100)}%`,
                    background: x.value > 0 ? 'var(--accent)' : 'var(--surface-active)'
                  }}
                />
                <small>{x.d.toLocaleDateString(undefined, { weekday: 'narrow' })}</small>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flow-header" style={{ marginBottom: 12 }}>
            <h3>SUBJECT MASTERY SPECTRUM</h3>
            <button className="text-button" onClick={() => go('Syllabus')}>Syllabus →</button>
          </div>

          {subjectDistribution.length > 0 ? (
            <>
              <div className="mastery-spectrum-bar">
                {subjectDistribution.map(s => (
                  <div
                    key={s.id}
                    className="mastery-segment"
                    style={{ width: `${s.pct}%`, background: s.color || 'var(--accent)' }}
                    title={`${s.name}: ${s.pct}%`}
                  />
                ))}
              </div>
              <div className="mastery-legend">
                {subjectDistribution.slice(0, 4).map(s => (
                  <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <SubjectDot color={s.color} />
                    {s.name} <b style={{ color: 'var(--text)' }}>{s.pct}%</b>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
              <span>Subjects configured in Syllabus will dynamically map study distribution here.</span>
            </div>
          )}
        </div>
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
