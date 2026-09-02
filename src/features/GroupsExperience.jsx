import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { challengeProgress } from '../domain/product.js';
import { DAY, formatDuration, uid } from '../lib.js';
import {
  joinGroup,
  loadGroupLeaderboard,
  loadGroupMembers
} from '../services/groupService.js';
import * as I from '../icons.jsx';

export default function GroupsExperience() {
  const { state, patch, runtime, mode } = useStore();
  const [selected, setSelected] = useState(state.groups[0]?.id || '');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [copied, setCopied] = useState(false);

  const group = state.groups.find(row => row.id === selected);
  const challenges = state.challenges.filter(
    row => !row.groupId || row.groupId === selected
  );

  function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = uid();
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    patch(s => ({
      ...s,
      groups: [
        ...s.groups,
        {
          id,
          name: name.trim(),
          joinCode,
          description: '',
          privacy: 'private',
          manualTimeCounts: false
        }
      ]
    }));
    setSelected(id);
    setName('');
  }

  function deleteGroup(id) {
    patch(s => ({
      ...s,
      groups: s.groups.filter(g => g.id !== id),
      challenges: s.challenges.filter(c => c.groupId !== id)
    }));
    if (selected === id) {
      setSelected(state.groups.find(g => g.id !== id)?.id || '');
    }
  }

  function deleteChallenge(id) {
    patch(s => ({
      ...s,
      challenges: s.challenges.filter(c => c.id !== id)
    }));
  }

  async function join(e) {
    e.preventDefault();
    try {
      setMessage('Joining…');
      await joinGroup(runtime.remote, code);
      setMessage('Joined. Reload this workspace to reconcile the new group.');
    } catch (error) {
      setMessage(error.message || 'The group could not be joined.');
    }
  }

  async function load(groupId) {
    if (!runtime.remote) {
      setMessage('Live membership and leaderboards require cloud mode.');
      return;
    }
    try {
      const [m, l] = await Promise.all([
        loadGroupMembers(runtime.remote, groupId),
        loadGroupLeaderboard(runtime.remote, groupId, Date.now() - 7 * DAY, Date.now())
      ]);
      setMembers(m);
      setLeaders(l);
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'Group data is unavailable.');
    }
  }

  function addChallenge(e) {
    e.preventDefault();
    if (!challengeTitle.trim()) return;
    patch(s => ({
      ...s,
      challenges: [
        ...s.challenges,
        {
          id: uid(),
          groupId: selected || null,
          title: challengeTitle.trim(),
          metric: 'FOCUS_MINUTES',
          target: 600,
          startsAt: Date.now(),
          endsAt: Date.now() + 7 * DAY
        }
      ]
    }));
    setChallengeTitle('');
  }

  function copyCode(c) {
    navigator.clipboard?.writeText(c);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">STUDY CIRCLES</span>
          <h1>Accountability without the noise.</h1>
          <p>Verified timer focus, private study circles, and collaborative streak challenges.</p>
        </div>
        <span
          className="capability-label"
          style={{
            background: mode === 'hybrid' ? 'var(--emerald-surface)' : 'var(--surface-raised)',
            color: mode === 'hybrid' ? 'var(--emerald)' : 'var(--text-muted)'
          }}
        >
          {mode === 'hybrid' ? 'CLOUD MEMBERSHIP ACTIVE' : 'LOCAL CHALLENGES ONLY'}
        </span>
      </div>

      {message && (
        <p className="settings-notice" role="status">
          {message}
        </p>
      )}

      <div className="groups-layout">
        <aside className="panel">
          <div className="panel-title">
            <h3>Your Groups</h3>
            <span>{state.groups.length} circles</span>
          </div>
          {state.groups.map(row => (
            <button
              className={`group-select ${selected === row.id ? 'active' : ''}`}
              key={row.id}
              onClick={() => {
                setSelected(row.id);
                load(row.id);
              }}
            >
              <b>{row.name}</b>
              <small>{row.privacy || 'private'} circle</small>
            </button>
          ))}

          <form className="compact-form" onSubmit={create} style={{ marginTop: 16 }}>
            <label>
              Create New Group
              <input
                value={name}
                maxLength="80"
                onChange={e => setName(e.target.value)}
                placeholder="Quiet study circle name…"
                required
              />
            </label>
            <button className="primary">
              <I.Plus /> Create Group
            </button>
          </form>

          <form className="compact-form" onSubmit={join} style={{ marginTop: 12 }}>
            <label>
              Join by Code
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter 6-char group code…"
                required
              />
            </label>
            <button disabled={!runtime.remote}>Join Group</button>
          </form>
        </aside>

        <div className="group-main">
          {group ? (
            <>
              <section className="panel">
                <div className="panel-title">
                  <div>
                    <span className="eyebrow">GROUP HOME</span>
                    <h3>{group.name}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Leave / Delete group"
                      onClick={() => deleteGroup(group.id)}
                      style={{ color: 'var(--rose)', padding: 4 }}
                    >
                      <I.X style={{ width: 14, height: 14 }} />
                    </button>
                    <span>
                      {members.length ? `${members.length} members` : 'Local workspace'}
                    </span>
                  </div>
                </div>
                <p className="muted" style={{ margin: '8px 0 16px' }}>
                  {group.description ||
                    'A private, study-first accountability space. Only verified focus counts toward leaderboard rankings.'}
                </p>

                {group.joinCode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-hover)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Invite Code:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: 1 }}>{group.joinCode}</strong>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => copyCode(group.joinCode)}
                      style={{ fontSize: 11, padding: '2px 8px', marginLeft: 'auto' }}
                    >
                      {copied ? '✓ Copied!' : 'Copy Code'}
                    </button>
                  </div>
                )}

                {members.map(member => (
                  <div className="member-row" key={member.userId}>
                    <span>User {member.userId.slice(0, 8)}</span>
                    <b>{member.role.toUpperCase()}</b>
                  </div>
                ))}
              </section>

              <section className="panel">
                <div className="panel-title">
                  <h3>Verified Focus Leaderboard</h3>
                  <span>Last 7 days · Timer time only</span>
                </div>
                {leaders.length ? (
                  leaders.map((row, index) => (
                    <div className="leader-row" key={row.userId}>
                      <b>#{index + 1}</b>
                      <span>User {row.userId.slice(0, 8)}</span>
                      <strong>{formatDuration(row.timerSeconds * 1000)}</strong>
                      <small>{row.activeDays} active days</small>
                    </div>
                  ))
                ) : (
                  <div className="empty">
                    <h3>No live ranking loaded</h3>
                    <p>Open a cloud-connected group to calculate verified timer time.</p>
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="empty">
              <h3>Create or select a group</h3>
              <p>Group data stays private, authenticated, and role-authorized.</p>
            </section>
          )}

          <section className="panel">
            <div className="panel-title">
              <h3>Active Challenges</h3>
              <span>{challenges.length} active</span>
            </div>
            {challenges.map(row => {
              const progress = challengeProgress(row, state);
              return (
                <div className="challenge-row" key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <b>{row.title}</b>
                    <small style={{ display: 'block' }}>
                      {Math.round(progress.value)} / {row.target} focus minutes completed
                    </small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="balance-track" style={{ width: 120 }}>
                      <i
                        style={{
                          width: `${Math.min(100, progress.ratio * 100)}%`,
                          background: 'var(--accent)'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      title="Delete challenge"
                      onClick={() => deleteChallenge(row.id)}
                      style={{ color: 'var(--rose)', padding: 4 }}
                    >
                      <I.X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              );
            })}
            <form className="inline-form" onSubmit={addChallenge} style={{ marginTop: 14 }}>
              <input
                value={challengeTitle}
                onChange={e => setChallengeTitle(e.target.value)}
                placeholder="e.g. 10 focused hours this week…"
              />
              <button className="primary">Add Challenge</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}

