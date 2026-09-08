import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Store, useStore } from './store.jsx';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { AuthScreen } from './auth/AuthScreen.jsx';
import { SyncBadge } from './sync/SyncContext.jsx';
import { aggregate, elapsed, formatDuration, studyDayKey } from './lib.js';
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
    title: 'Core',
    items: [
      ['Home', I.House, 'Dashboard'],
      ['Today', I.Target, 'Today'],
      ['Focus', I.Timer, 'Focus Timer'],
      ['Plan', I.CalendarDays, 'Planner'],
      ['Progress', I.ChartNoAxesCombined, 'Analytics']
    ]
  },
  {
    title: 'Curriculum',
    items: [
      ['Tasks', I.CheckSquare, 'Tasks'],
      ['Syllabus', I.BookOpen, 'Syllabus'],
      ['Revision', I.RotateCcw, 'Spaced Revision'],
      ['Exams', I.Trophy, 'Exams'],
      ['Mocks', I.BarChart3, 'Mock Lab']
    ]
  },
  {
    title: 'Workspace',
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
        <span className="eyebrow">WELCOME TO STUDIUX</span>
        <h1>Initialize your workspace</h1>
        <p>Your local-first study command operating system. Everything can be adjusted later in settings.</p>

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
            {['JEE 2027', 'JEE 2026', 'NEET', 'UPSC', 'SAT', 'University', 'Something else'].map(x => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Daily Study Target (Hours)
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.25"
              value={draft.targetMinutes / 60}
              onChange={e =>
                setDraft({ ...draft, targetMinutes: Math.max(30, Number(e.target.value) * 60) })
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
          style={{ marginTop: 12 }}
          onClick={() =>
            patch({
              profile: { ...draft, name: draft.name.trim() || 'Scholar' },
              onboarded: true
            })
          }
        >
          Launch Workspace <I.ChevronRight style={{ width: 16, height: 16 }} />
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
  const [now, setNow] = useState(Date.now());

  // Heartbeat for header timer ticker
  useEffect(() => {
    if (!state.active) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [state.active]);

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
    document.documentElement.dataset.theme = state.theme || 'dark';
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="pulse-dot" style={{ width: 12, height: 12 }} />
        <span>Opening {page}…</span>
      </div>
    </main>
  );

  const hasUnread = state.notifications.some(row => !row.readAt);
  const openTasksCount = state.tasks.filter(t => !t.done).length;
  const dueRevisionCount = state.revisionItems.filter(r => r.status !== 'COMPLETED').length;

  return (
    <div className="app">
      <aside>
        <div className="brand" onClick={() => navigate('Home')}>
          <BrandLogo size="md" />
          <span className="version-badge">v2.0 PRO</span>
        </div>

        <nav>
          {NAV_SECTIONS.map(section => (
            <div className="nav-section" key={section.title}>
              {section.title && <div className="nav-section-title">{section.title}</div>}
              {section.items.map(([name, Icon, label]) => {
                const isActive = page === name;
                return (
                  <button
                    key={name}
                    className={isActive ? 'active' : ''}
                    onClick={() => navigate(name)}
                  >
                    <Icon />
                    <span>{label || name}</span>
                    {name === 'Focus' && state.active && <span className="pulse-dot" />}
                    {name === 'Tasks' && openTasksCount > 0 && (
                      <span className="nav-badge">{openTasksCount}</span>
                    )}
                    {name === 'Revision' && dueRevisionCount > 0 && (
                      <span className="nav-badge" style={{ color: 'var(--warning)' }}>
                        {dueRevisionCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="aside-foot">
          <div className="aside-user-card">
            <div className="aside-avatar">
              {(state.profile?.name || 'S')[0].toUpperCase()}
            </div>
            <div className="aside-user-info">
              <span className="aside-user-name">{state.profile?.name || 'Scholar'}</span>
              <span className="aside-user-exam">{state.profile?.exam || 'General Prep'}</span>
            </div>
            <button
              className="theme-toggle-btn"
              onClick={() => patch({ theme: state.theme === 'light' ? 'dark' : 'light' })}
              aria-label="Toggle theme"
              title={`Switch to ${state.theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {state.theme === 'light' ? <I.Moon /> : <I.Sun />}
            </button>
          </div>
        </div>
      </aside>

      <header>
        <div className="header-left">
          <button
            className="mobile-menu"
            onClick={() => setPalette(true)}
            aria-label="Open navigation"
          >
            <I.Menu />
          </button>
          <div className="breadcrumb-tag">
            <small>Studiux /</small>
            <span>{page}</span>
          </div>
        </div>

        <div className="header-actions">
          {state.active && page !== 'Focus' && (
            <div
              className="header-focus-dock"
              onClick={() => navigate('Focus')}
              title="Focus session in progress — click to view"
            >
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
              <I.Timer style={{ width: 14, height: 14, color: 'var(--accent-text)' }} />
              <span className="header-focus-time">
                {formatDuration(elapsed(state.active, now))}
              </span>
            </div>
          )}

          <button className="search" onClick={() => setPalette(true)}>
            <I.Search />
            <span>Search or jump to…</span>
            <kbd>⌘ K</kbd>
          </button>

          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() => setNotifications(true)}
            title="Notification Center"
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
    ['Open Today timeline', 'Today', I.Target],
    ['Open Calendar planner', 'Plan', I.CalendarDays],
    ['Open Spaced Revision', 'Revision', I.RotateCcw],
    ['Record mock result', 'Mocks', I.BarChart3],
    ['View analytics & metrics', 'Progress', I.ChartNoAxesCombined],
    ['Manage syllabus chapters', 'Syllabus', I.BookOpen],
    ['Target examinations', 'Exams', I.Trophy],
    ['Study circles & groups', 'Groups', I.Users],
    ['System settings', 'Settings', I.Settings],
    ['Toggle light/dark theme', 'Settings', I.Moon]
  ];

  const term = query.trim().toLowerCase();
  const entities = term
    ? [
        ...state.tasks.map(row => [`Task: ${row.title}`, 'Tasks', I.CheckSquare]),
        ...state.subjects.map(row => [`Subject: ${row.name}`, 'Syllabus', I.BookOpen]),
        ...state.chapters.map(row => [`Chapter: ${row.name}`, 'Syllabus', I.BookOpen]),
        ...state.mocks.map(row => [`Mock: ${row.name}`, 'Mocks', I.BarChart3]),
        ...state.mistakes.map(row => [`Mistake: ${row.notes || row.type}`, 'Mocks', I.BarChart3])
      ]
        .filter(([label]) => label?.toLowerCase().includes(term))
        .slice(0, 8)
    : [];

  const list = [
    ...actions.filter(([label]) => label.toLowerCase().includes(term)),
    ...entities
  ];

  const choose = ([label, page]) => {
    if (label === 'Toggle light/dark theme') {
      patch({ theme: state.theme === 'light' ? 'dark' : 'light' });
    } else {
      go(page);
    }
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
          <I.Search style={{ width: 18, height: 18, color: 'var(--accent-text)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && list[0]) choose(list[0]);
            }}
            placeholder="Type a command, task, subject or mock…"
            autoFocus
          />
        </div>
        <span className="eyebrow">{term ? 'SEARCH RESULTS' : 'QUICK NAVIGATION'}</span>
        {list.map((item, index) => {
          const [label, , Icon] = item;
          return (
            <button key={`${label}-${index}`} onClick={() => choose(item)}>
              <Icon />
              <span>{label}</span>
              {index === 0 && <kbd>↵</kbd>}
            </button>
          );
        })}
        {!list.length && (
          <div className="empty">
            <p>No matching task, subject, chapter, or action found.</p>
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
  const { state, patch } = useStore();
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
  const dueRevisions = state.revisionItems.filter(r => r.status !== 'COMPLETED').slice(0, 3);

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

  // Time-aware greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  function completeTask(id) {
    patch(s => ({
      ...s,
      tasks: s.tasks.map(t =>
        t.id === id ? { ...t, done: true, status: 'DONE', completedAt: Date.now() } : t
      )
    }));
  }

  return (
    <div className="home-layout">
      {/* Main command column */}
      <div className="home-main">
        {/* Hero Study Banner */}
        <div className="home-hero-card">
          <div className="home-hero-top">
            <div>
              <span className="eyebrow">COMMAND CENTER</span>
              <h2 className="home-greeting-title">
                {greeting}, {state.profile?.name || 'Scholar'}
              </h2>
              <div className="home-hero-date">{dateStr}</div>
            </div>
            <div className="version-badge" style={{ alignSelf: 'flex-start' }}>
              {pct}% GOAL
            </div>
          </div>

          <div className="home-hero-metrics">
            <span className="home-hero-time">{formatDuration(today.duration)}</span>
            <span className="home-hero-target">
              studied today / <b>{formatDuration(target)}</b> target
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-track-fill"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>

          <div className="progress-track-label">
            <span>0m</span>
            <span>{pct}% complete</span>
            <span>{formatDuration(target)}</span>
          </div>

          <div className="home-hero-actions">
            <button className="home-focus-btn" onClick={() => go('Focus')}>
              <I.Play style={{ width: 16, height: 16 }} />
              <span>{state.active ? 'Resume Focus Session' : 'Start Focus Session'}</span>
              <kbd>Space</kbd>
            </button>
            <button className="btn-secondary" onClick={() => go('Plan')}>
              <I.CalendarDays style={{ width: 15, height: 15 }} />
              Plan Your Day
            </button>
          </div>
        </div>

        {/* Priority Focus Task Section */}
        <div className="home-section">
          <div className="home-section-head">
            <h3>
              <I.Target style={{ width: 16, height: 16, color: 'var(--accent-text)' }} />
              Up next in queue
            </h3>
            <button className="text-button" onClick={() => go('Tasks')}>
              All tasks ({activeTasks.length}) →
            </button>
          </div>

          {nowPriorityTask ? (
            <>
              <div className="now-priority-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <button
                    className="check-mark"
                    onClick={() => completeTask(nowPriorityTask.id)}
                    title="Mark task as complete"
                  >
                    <I.Check style={{ width: 11, height: 11 }} />
                  </button>
                  <div className="now-task-info">
                    <b>{nowPriorityTask.title}</b>
                    <div className="now-task-meta">
                      {nowPriorityTask.subject && (
                        <span className="subject-tag">
                          <SubjectDot
                            color={
                              state.subjects.find(s => s.id === nowPriorityTask.subjectId)?.color
                            }
                          />
                          {nowPriorityTask.subject}
                        </span>
                      )}
                      <span>
                        <I.Clock style={{ width: 12, height: 12, display: 'inline', verticalAlign: '-1px' }} />{' '}
                        {nowPriorityTask.estimate || 30}m
                      </span>
                      {nowPriorityTask.priority && (
                        <span
                          className={`status-badge ${
                            nowPriorityTask.priority === 'HIGH'
                              ? 'text-danger'
                              : nowPriorityTask.priority === 'MEDIUM'
                              ? 'text-warning'
                              : 'text-success'
                          }`}
                        >
                          {nowPriorityTask.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="primary"
                  style={{ padding: '8px 14px', fontSize: 13 }}
                  onClick={() => go('Focus')}
                >
                  <I.Play style={{ width: 13, height: 13 }} /> Focus Now
                </button>
              </div>

              {upcomingTasks.map(t => (
                <div className="feed-row" key={t.id} onClick={() => go('Tasks')}>
                  <button
                    className="check-mark"
                    onClick={e => {
                      e.stopPropagation();
                      completeTask(t.id);
                    }}
                    title="Mark complete"
                  >
                    <I.Check style={{ width: 10, height: 10 }} />
                  </button>
                  <div className="feed-row-left">
                    <span
                      className="subject-dot"
                      style={{
                        background:
                          state.subjects.find(s => s.id === t.subjectId)?.color || 'var(--accent)'
                      }}
                    />
                    <b>{t.title}</b>
                  </div>
                  <span className="feed-row-meta">{t.estimate || 30}m</span>
                </div>
              ))}
            </>
          ) : (
            <div className="empty">
              <h3>All caught up!</h3>
              <p>No active tasks remaining in your queue.</p>
              <button className="primary" onClick={() => go('Tasks')}>
                <I.Plus style={{ width: 14, height: 14 }} /> Create a Task
              </button>
            </div>
          )}
        </div>

        {/* Due Revision Section */}
        {dueRevisions.length > 0 && (
          <div className="home-section">
            <div className="home-section-head">
              <h3>
                <I.RotateCcw style={{ width: 16, height: 16, color: 'var(--warning)' }} />
                Spaced Revision Due
              </h3>
              <button className="text-button" onClick={() => go('Revision')}>
                Open Revision ({dueRevisions.length}) →
              </button>
            </div>
            {dueRevisions.map(r => (
              <div className="feed-row" key={r.id} onClick={() => go('Revision')}>
                <div className="feed-row-left">
                  <I.RotateCcw style={{ width: 14, height: 14, color: 'var(--warning)' }} />
                  <b>{r.targetTitle || 'Spaced Revision Item'}</b>
                </div>
                <span className="feed-row-meta" style={{ color: 'var(--warning)' }}>
                  Due for review
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Curriculum Shortcuts */}
        <div className="dashboard-grid">
          <div className="panel" onClick={() => go('Syllabus')} style={{ cursor: 'pointer' }}>
            <div className="panel-title">
              <h3>
                <I.BookOpen style={{ width: 16, height: 16, color: 'var(--accent-text)' }} />
                Syllabus Tracker
              </h3>
              <I.ArrowUpRight style={{ width: 14, height: 14, color: 'var(--ink-muted)' }} />
            </div>
            <p>
              {state.subjects.length} subjects • {state.chapters.length} chapters mapped.
            </p>
          </div>

          <div className="panel" onClick={() => go('Mocks')} style={{ cursor: 'pointer' }}>
            <div className="panel-title">
              <h3>
                <I.BarChart3 style={{ width: 16, height: 16, color: 'var(--info)' }} />
                Mock Test Lab
              </h3>
              <I.ArrowUpRight style={{ width: 14, height: 14, color: 'var(--ink-muted)' }} />
            </div>
            <p>
              {state.mocks.length} mock tests recorded • {state.mistakes.length} mistakes tagged.
            </p>
          </div>
        </div>
      </div>

      {/* Context sidebar */}
      <div className="home-context">
        <div className="stat-metric-card">
          <h4>Daily Goal Status</h4>
          <div className="stat-value">{pct}%</div>
          <div className="stat-sub">
            {formatDuration(today.duration)} / {formatDuration(target)}
          </div>
        </div>

        <div className="stat-metric-card">
          <h4>Sessions Completed</h4>
          <div className="stat-value">{today.sessions}</div>
          <div className="stat-sub">Recorded deep study sessions</div>
        </div>

        <div className="stat-metric-card">
          <h4>Questions Solved</h4>
          <div className="stat-value">{today.questions}</div>
          <div className="stat-sub">Practice problems today</div>
        </div>

        <div className="stat-metric-card">
          <h4>Focus Quality</h4>
          <div className="stat-value">
            {today.sessions ? `${Math.round(today.focus / today.sessions)}/100` : '—'}
          </div>
          <div className="stat-sub">Tab discipline & rating average</div>
        </div>

        {/* 7-Day Study Rhythm Chart */}
        <div className="stat-metric-card">
          <h4>7-Day Study Rhythm</h4>
          <div className="mini-bars">
            {week.map(x => (
              <div
                key={x.d.toISOString()}
                className={x.value > 0 ? 'mini-bar' : 'mini-bar mini-bar-empty'}
                style={{ height: `${Math.max(8, (x.value / maxWeek) * 100)}%` }}
                title={`${x.d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${formatDuration(x.value)}`}
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
          <div className="stat-sub" style={{ marginTop: 8 }}>
            Day resets at {String(state.profile.resetHour).padStart(2, '0')}:00
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <span className="pulse-dot" style={{ width: 8, height: 8 }} />
          <p>Restoring your secure study space…</p>
        </div>
      </main>
    );

  if (auth.configured && !auth.session) return <AuthScreen />;

  if (error && !state.onboarded)
    return (
      <main className="auth-loading">
        <BrandLogo size="lg" showTagline layout="vertical" />
        <p style={{ marginTop: 20, color: 'var(--danger)' }}>
          Your study space could not be opened. Please reload to retry.
        </p>
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
