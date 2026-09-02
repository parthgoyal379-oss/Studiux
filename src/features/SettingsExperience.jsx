import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { elapsed, focusScore } from '../lib.js';
import { downloadText, fullDataJson, sessionsToCsv } from '../services/exportService.js';
import { BrandLogo } from '../components/BrandLogo.jsx';

const ZONES = [
  'Asia/Kolkata',
  'UTC',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney'
];

export default function SettingsExperience() {
  const { state, patch, mode } = useStore();
  const auth = useAuth();
  const [profile, setProfile] = useState(state.profile);
  const [prefs, setPrefs] = useState(state.preferences);
  const [logout, setLogout] = useState(false);
  const [notice, setNotice] = useState('');

  function save() {
    const targetMinutes = Math.max(0, Math.min(1440, Number(profile.targetMinutes) || 0));
    const resetHour = Math.max(0, Math.min(23, Number(profile.resetHour) || 0));
    try {
      new Intl.DateTimeFormat('en', { timeZone: profile.timezone }).format();
    } catch {
      setNotice('Please choose a valid IANA timezone, such as Asia/Kolkata or UTC.');
      return;
    }
    patch({
      profile: { ...profile, targetMinutes, resetHour },
      preferences: prefs,
      theme: prefs.theme
    });
    setNotice(
      mode === 'hybrid'
        ? 'Settings saved locally and synced with your cloud profile.'
        : 'Settings saved locally on this device.'
    );
  }

  async function finishLogout() {
    if (state.active) {
      const duration = elapsed(state.active);
      patch(s => ({
        ...s,
        active: null,
        sessions: [
          ...s.sessions,
          {
            ...s.active,
            status: 'COMPLETED',
            endedAt: Date.now(),
            duration,
            focusScore: focusScore({ duration, rating: 3, completed: true }),
            questions: 0,
            source: 'TIMER'
          }
        ]
      }));
    }
    await auth.signOut();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">PREFERENCES</span>
          <h1>Your study day, your rules.</h1>
          <p>Configure study targets, reset hours, focus intervals, and data exports.</p>
        </div>
        <span
          className="capability-label"
          style={{
            background: mode === 'hybrid' ? 'var(--emerald-surface)' : 'var(--surface-raised)',
            color: mode === 'hybrid' ? 'var(--emerald)' : 'var(--text-muted)'
          }}
        >
          {mode === 'hybrid' ? 'LOCAL-FIRST + CLOUD' : 'LOCAL DEVICE MODE'}
        </span>
      </div>

      {notice && (
        <p className="settings-notice" role="status">
          {notice}
        </p>
      )}

      <div className="settings-sections">
        <section className="focus-card settings-card">
          <div className="panel-title">
            <h3>Profile & Study Day</h3>
            <span>Baseline configuration</span>
          </div>
          <div className="form-row">
            <label>
              Display Name
              <input
                maxLength="80"
                value={profile.name || ''}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </label>
            <label>
              Username
              <input
                maxLength="40"
                value={profile.username || ''}
                onChange={e =>
                  setProfile({
                    ...profile,
                    username: e.target.value.replace(/[^a-zA-Z0-9_.-]/g, '')
                  })
                }
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Timezone
              <input
                list="studiux-timezones"
                value={profile.timezone || ''}
                onChange={e => setProfile({ ...profile, timezone: e.target.value })}
              />
              <datalist id="studiux-timezones">
                {ZONES.map(zone => (
                  <option key={zone}>{zone}</option>
                ))}
              </datalist>
            </label>
            <label>
              Study Day Resets At
              <select
                value={profile.resetHour}
                onChange={e =>
                  setProfile({ ...profile, resetHour: Number(e.target.value) })
                }
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Daily Target (minutes)
              <input
                type="number"
                min="0"
                max="1440"
                value={profile.targetMinutes}
                onChange={e =>
                  setProfile({ ...profile, targetMinutes: e.target.value })
                }
              />
            </label>
            <label>
              Week Starts On
              <select
                value={prefs.weekStart}
                onChange={e =>
                  setPrefs({ ...prefs, weekStart: Number(e.target.value) })
                }
              >
                <option value="1">Monday</option>
                <option value="0">Sunday</option>
              </select>
            </label>
          </div>
        </section>

        <section className="focus-card settings-card">
          <div className="panel-title">
            <h3>Focus Engine Defaults</h3>
            <span>Applied to new sessions</span>
          </div>
          <div className="form-row">
            <label>
              Default Timer Mode
              <select
                value={prefs.defaultTimerMode}
                onChange={e =>
                  setPrefs({ ...prefs, defaultTimerMode: e.target.value })
                }
              >
                <option value="STOPWATCH">Stopwatch</option>
                <option value="COUNTDOWN">Countdown</option>
                <option value="POMODORO">Pomodoro</option>
                <option value="DEEP WORK">Deep Work</option>
              </select>
            </label>
            <label>
              Theme Preference
              <select
                value={prefs.theme}
                onChange={e => setPrefs({ ...prefs, theme: e.target.value })}
              >
                <option value="system">System (Auto)</option>
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Pomodoro Focus Length (m)
              <input
                type="number"
                min="5"
                max="120"
                value={prefs.pomodoroWorkMinutes}
                onChange={e =>
                  setPrefs({
                    ...prefs,
                    pomodoroWorkMinutes: Math.max(5, Number(e.target.value) || 5)
                  })
                }
              />
            </label>
            <label>
              Pomodoro Break Length (m)
              <input
                type="number"
                min="1"
                max="60"
                value={prefs.pomodoroBreakMinutes}
                onChange={e =>
                  setPrefs({
                    ...prefs,
                    pomodoroBreakMinutes: Math.max(1, Number(e.target.value) || 1)
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="focus-card settings-card">
          <div className="panel-title">
            <h3>Privacy & Social</h3>
            <span>Visibility controls</span>
          </div>
          <div className="form-row">
            <label>
              Profile Visibility
              <select
                value={prefs.profileVisibility}
                onChange={e =>
                  setPrefs({ ...prefs, profileVisibility: e.target.value })
                }
              >
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
                <option value="public">Public</option>
              </select>
            </label>
            <label>
              Study Time Visibility
              <select
                value={prefs.studyTimeVisibility}
                onChange={e =>
                  setPrefs({ ...prefs, studyTimeVisibility: e.target.value })
                }
              >
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>

          <label className="toggle-row" style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(prefs.leaderboardEnabled)}
              onChange={e =>
                setPrefs({ ...prefs, leaderboardEnabled: e.target.checked })
              }
            />
            <span>Allow my eligible verified study time in circle leaderboards</span>
          </label>

          <div className="dialog-actions" style={{ marginTop: 16 }}>
            <button onClick={() => setLogout(true)} style={{ color: 'var(--rose)' }}>
              Log out
            </button>
            <button className="primary" onClick={save}>
              Save Settings
            </button>
          </div>
        </section>

        <section className="panel data-panel">
          <div className="panel-title">
            <h3>Your Data & Portability</h3>
            <span>Backup, Restore & Export</span>
          </div>
          <p className="muted">
            All your sessions, tasks, and analytics are fully owned by you. Exports never include auth tokens or secrets.
          </p>
          <div className="dialog-actions" style={{ marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
            <button
              onClick={() =>
                downloadText(
                  'studiux-sessions.csv',
                  sessionsToCsv(state.sessions),
                  'text/csv'
                )
              }
            >
              Export Sessions CSV
            </button>
            <button
              onClick={() =>
                downloadText(
                  'studiux-export.json',
                  fullDataJson(state),
                  'application/json'
                )
              }
            >
              Export Complete JSON
            </button>

            <label className="text-button" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '8px 14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
              <span>📥 Restore from JSON</span>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = evt => {
                    try {
                      const data = JSON.parse(evt.target.result);
                      if (data && Array.isArray(data.subjects) && Array.isArray(data.tasks)) {
                        patch(s => ({
                          ...s,
                          subjects: data.subjects || s.subjects,
                          chapters: data.chapters || s.chapters,
                          topics: data.topics || s.topics,
                          tasks: data.tasks || s.tasks,
                          subtasks: data.subtasks || s.subtasks,
                          sessions: data.sessions || s.sessions,
                          plannerEvents: data.plannerEvents || s.plannerEvents,
                          revisionItems: data.revisionItems || s.revisionItems,
                          revisionHistory: data.revisionHistory || s.revisionHistory,
                          mocks: data.mocks || s.mocks,
                          mockSections: data.mockSections || s.mockSections,
                          mistakes: data.mistakes || s.mistakes,
                          exams: data.exams || s.exams,
                          groups: data.groups || s.groups,
                          challenges: data.challenges || s.challenges,
                          profile: data.profile ? { ...s.profile, ...data.profile } : s.profile,
                          preferences: data.preferences ? { ...s.preferences, ...data.preferences } : s.preferences
                        }));
                        setNotice('Backup successfully restored and merged into your workspace!');
                      } else {
                        setNotice('Invalid backup file format.');
                      }
                    } catch (err) {
                      setNotice(`Error reading backup: ${err.message}`);
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>

            <button
              style={{ color: 'var(--rose)' }}
              onClick={() => {
                if (window.confirm('Are you sure you want to reset your local workspace data? This cannot be undone.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              Reset Local Cache
            </button>
          </div>
        </section>


        <section className="panel settings-about-panel" style={{ padding: '24px 20px', background: 'var(--surface-raised, rgba(255,255,255,0.03))', borderRadius: 'var(--radius, 14px)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', marginBottom: '20px' }}>
            <BrandLogo size="lg" showTagline layout="vertical" />
            <p className="muted" style={{ maxWidth: '420px', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              The unified study operating system designed to turn complex syllabi and ambitious goals into structured, measurable daily execution.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                <b style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Structure</b>
              </div>
              <p className="muted" style={{ fontSize: '12px', margin: 0 }}>Bedrock syllabus architecture & routine foundation.</p>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7469B6' }} />
                <b style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Progress</b>
              </div>
              <p className="muted" style={{ fontSize: '12px', margin: 0 }}>Tri-color ascending velocity: initiation to mastery.</p>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34A39C' }} />
                <b style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Focus</b>
              </div>
              <p className="muted" style={{ fontSize: '12px', margin: 0 }}>Single-minded deep work immersion & execution.</p>
            </div>
          </div>
        </section>
      </div>

      {logout && (
        <div className="overlay" onMouseDown={() => setLogout(false)}>
          <section
            className="import-dialog"
            role="dialog"
            aria-modal="true"
            onMouseDown={e => e.stopPropagation()}
          >
            <h2>{state.active ? 'Finish active focus session?' : 'Log out of Studiux?'}</h2>
            <p>
              {state.active
                ? 'Your active timer will be safely completed and saved before logout. No study time is discarded.'
                : 'Local cached data remains securely isolated on this device.'}
            </p>
            <div className="dialog-actions">
              <button onClick={() => setLogout(false)}>Cancel</button>
              <button className="primary" onClick={finishLogout}>
                {state.active ? 'Finish session & log out' : 'Log out'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
